const BaseRepo = require('./base');
const { InnerCarton } = require('../models');

class InnerCartonRepo extends BaseRepo {

  constructor(exclude = []) {
    super(InnerCarton);

    exclude.push('innerCarton');
    console.log('INNER: ' + exclude);
    this.assoc = {};
    if (!exclude.includes('sku')) {
      const SkuRepo = require('./sku');
      this.assoc.sku = new SkuRepo(exclude);
    }
    if (!exclude.includes('masterCarton')) {
      const MasterCartonRepo = require('./masterCarton');
      this.assoc.masterCarton = new MasterCartonRepo(exclude);
    }
    if (!exclude.includes('item')) {
      const ItemRepo = require('./item');
      this.assoc.item = new ItemRepo(exclude);
    }
  }

  async list(by) {
    // Implement this later.
  }

  async get(serial) {
    // Not sure how to implement this yet.
  }

  /* Cartons is a list in the format
     [...{carton: {sku, masterId, factoryOrderId}, quantity, innerSize}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let innerList = [];
      let itemList = [];

      for (let i = 0; i < cartons.length; i++) {
        const cartonList = Array(cartons[i].quantity).fill(cartons[i].carton);
        const inner = await this._create(cartonList);
        innerList.push(inner);

        for (let j = 0; j < inner.length; j++) {
          const carton = {
            sku: inner[j].sku,
            innerId: inner[j].id,
            masterId: inner[j].masterId,
            factoryOrderId: cartons[i].carton.factoryOrderId
          };

          itemList.push({
            carton: carton,
            quantity: cartons[i].innerSize
          });
        }
      }

      await this.assoc.item.create(itemList, t);
      return innerList;
    }, transaction);
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._use({ where: by }, true);
      let items = await this.assoc.item.order({
        innerId: inner[0].id
      }, t);
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._delete({ where: by }, false);
      let items = await this.assoc.item.cancel({
        innerId: inner.id
      }, t);
      return inner;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = InnerCartonRepo;