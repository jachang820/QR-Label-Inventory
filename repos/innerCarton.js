const BaseRepo = require('./base');
const { InnerCarton } = require('../models');

class InnerCartonRepo extends BaseRepo {

  constructor(exclude = []) {
    super(InnerCarton);

    exclude.push('innerCarton');
    
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

  async stock(id, transaction) {
    return this.transaction(async (t) => {
      return this.assoc.item.stock(id, t);
    });
  }

  async use(id, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._use({ 
        where: { masterId: id }
      }, true);
      inner = inner.map(e => e.get({ plain: true }));

      for (let i = 0; i < inner.length; i++) {
        const items = await this.assoc.item.order(
          inner[i].id, t);
        inner[i].items = items;
      }
      
      return inner;
    }, transaction);
  }

  async hide(id, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._delete({ 
        where: { masterId: id } 
      }, false);

      for (let i = 0; i < inner.length; i++) {
        let items = await this.assoc.item.cancel(
          inner[i].id, true, t);
        inner[i].push(items);
      }
      return inner;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = InnerCartonRepo;