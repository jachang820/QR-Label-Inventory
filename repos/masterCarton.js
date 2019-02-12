const BaseRepo = require('./base');
const FactoryOrderRepo = require('./factoryOrder');
const InnerCartonRepo = require('./innerCarton');
const SkuRepo = require('./sku');
const { MasterCarton, Sku, Size, sequelize } = require('../models');

class MasterCartonRepo extends BaseRepo {

  constructor(exclude = []) {
    super(MasterCarton);

    exclude.push('masterCarton');
    this.assoc = {};
    if (!exclude.includes('sku')) 
      this.assoc.sku = new SkuRepo(exclude);
    if (!exclude.includes('factoryOrder'))
      this.assoc.factoryOrder = new FactoryOrderRepo(exclude);
    if (!exclude.includes('innerCarton'))
      this.assoc.innerCarton = new InnerCartonRepo(exclude);
  }

  async list(by) {
    by = Object.entries(by).map(
      e => `"${e[0]}" = '${e[1]}'`
    ).join(' AND ');
    let query = `
      SELECT 
        serial, 
        sku,
        "Size"."masterSize",
        "Size"."innerSize",
        SUM("Size"."innerSize" * "Size"."masterSize") AS count
      FROM "MasterCarton"
        LEFT JOIN "Sku" ON "MasterCarton".sku = "Sku".id
        LEFT JOIN "Size" ON "Sku".size = "Size".name
      WHERE ${by}
      GROUP BY "MasterCarton".serial, "MasterCarton".sku, "Size"."innerSize", "Size"."masterSize"
      ORDER BY "MasterCarton".serial ASC
    `.replace(/\s+/g, ' ').trim();

    const cartons = await sequelize.query(query);
    this.cache.list = cartons;
    if (!cartons[0]) return [];
    return cartons[0];
  }

  async get(serial) {
    // Not sure how to implement this yet.
  }

  /* Cartons is a list in the format
     [...{carton: {sku, factoryOrderId}, quantity, innerSize, masterSize}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let masterList = [];
      let innerList = [];

      for (let i = 0; i < cartons.length; i++) {
        const cartonList = Array(cartons[i].quantity).fill(cartons[i].carton);
        const master = await this._create(cartonList);
        masterList.push(master);

        for (let j = 0; j < master.length; j++) {
          const carton = {
            sku: master[j].sku,
            masterId: master[j].id,
            factoryOrderId: master[j].factoryOrderId
          };
        
          innerList.push({
            carton: carton,
            quantity: cartons[i].masterSize,
            innerSize: cartons[i].innerSize
          });
        }
      }

      await this.assoc.innerCarton.create(innerList, t);
      return masterList;
    }, transaction);
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const master = await this._use({ where: by }, true);
      const inner = await this.assoc.innerCarton.use({
        masterId: master[0].id
      }, t);
      return master;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const master = await this._delete({ where: by }, false);
      const inner = await this.assoc.innerCarton.hide({
        masterId: master.id
      }, t);
      return master;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = MasterCartonRepo;
