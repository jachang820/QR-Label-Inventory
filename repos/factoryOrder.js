const SettingsRepo = require('./settings');
const MasterCartonRepo = require('./masterCarton');
const SkuRepo = require('./sku');
const db = require('../models');
const Op = db.Sequelize.Op;

class FactoryOrderRepo extends SettingsRepo {

  constructor(associate) {
    super(db.FactoryOrder);

    if (!associate) {
      this.assoc = {
        sku: new SkuRepo(true),
        master: new MasterCartonRepo(true)
      };
    }
  }

  async list() {
    let query = `
      WITH line_item AS (
        SELECT "factoryOrderId",
               sku, 
               SUM("Size"."innerSize" * "Size"."masterSize") AS count, 
               COUNT("MasterCarton".serial) AS cartons, 
               ARRAY_AGG("MasterCarton".serial ORDER BY "MasterCarton".serial) AS serials
        FROM "MasterCarton" 
          INNER JOIN "Sku" ON "MasterCarton".sku = "Sku".id 
          INNER JOIN "Size" ON "Sku".size = "Size".name 
        GROUP BY "MasterCarton".sku, "MasterCarton"."factoryOrderId"
        ORDER BY "MasterCarton".sku
      ) 
      SELECT "FactoryOrder".serial, (
          SELECT JSON_AGG(line_item)
          FROM line_item  
          WHERE "FactoryOrder".id = line_item."factoryOrderId"
        ) AS "lineItems", (
          SELECT COALESCE(SUM(line_item.count), 0)
          FROM line_item
          WHERE "FactoryOrder".id = line_item."factoryOrderId"
        ) AS count
      FROM "FactoryOrder"
      GROUP BY "FactoryOrder".id
      ORDER BY ordered DESC, "FactoryOrder".serial ASC
      `.replace(/\s+/g, ' ').trim();

    const orders = await db.sequelize.query(query);
    this.cache.list = orders;
    if (!orders[0]) return [];
    return orders[0]; 
  }

  async get(serial) {
    return this._get({
      where: { id: serial },
      attributes: { exclude: ['id'] },
      include: [{ 
        model: MasterCarton,
        attributes: ['serial', 'sku'],
        include: [{
          model: InnerCarton,
          attributes: ['serial', 'sku'],
          include: [{
            model: Item,
            attributes: ['serial', 'sku'],
            order: [['serial', 'ASC']]
          }],
          order: [['serial', 'ASC']]
        }],
        order: [['serial', 'ASC']]
      }],
      paranoid: false
    });
  }

  /* 'order' consists of a list of objects with 
     sku and quantity (in number of master cartons).
     [...{sku, quantity}] */
  async create(alias, notes, order, transaction) {
    let skus = order.map(e => e.sku);
    skus = [...new Set(skus)];

    const skus = await this.assoc.sku.listWithSize({
      id: { [Op.or]: skus }
    });

    let skuDict = {};
    for (let i = 0; i < skus.length; i++) {
      skuDict[skus[i].id] = {
        inner: skus[i].innerSize,
        master: skus[i].masterSize
      };
    }

    return this.transaction(async (t) => {
      const factoryOrder = await this._create({
        alias: alias,
        notes: notes
      });

      let masterList = [];
      for (let i = 0; i < order.length; i++) {
        const carton = {
          sku: order[i].sku,
          factoryOrderId: factoryOrder.serial 
        };

        const sku = skuDict[carton.sku];

        masterList.push({
          carton: carton,
          quantity: order[i].quantity,
          innerSize: sku.innerSize,
          masterSize: sku.masterSize
        });
      }

      await this.assoc.master.create(masterList, t);  
      
      return factoryOrder;
    }, transaction);
  }

  async update(serial, label, notes) {
    return this._update({
      alias: alias,
      notes: notes
    }, {
      where: { serial: serial }
    });
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._use({ where: by }, true);
      const master = await this.assoc.master.use({
        factoryOrderId: order.serial
      }, transaction);
      return order;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._delete({ where: by }, false);
      const master = await this.assoc.master.hide({
        factoryOrderId: order.serial
      }, transaction);
      return order;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = FactoryOrderRepo;