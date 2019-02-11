const BaseRepo = require('./base');
const InnerCartonRepo = require('./innerCarton');
const SkuRepo = require('./sku');
const { Item } = require('../models');

class ItemRepo extends BaseRepo {

  constructor(exclude = []) {
    super(Item);

    exclude.push('item');
    this.assoc = {};
    if (!exclude.includes('sku'))
      this.assoc.sku = new SkuRepo(exclude);
    if (!exclude.includes('innerCarton'))
      this.assoc.innerCarton = new InnerCartonRepo(exclude);
  }

  async list() {
    // Implement this later.
  }

  async get(serial) {
    // Not sure how to implement this yet.
  }

  /* Cartons is a list in the format
     [...{carton: {sku, innerId, masterId, factoryOrderId}, quantity}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let itemList = [];

      for (let i = 0; i < cartons.length; i++) {
        const cartonList = Array(cartons[i].quantity).fill(cartons[i].carton);
        const item = await this._create(cartonList);
        itemList.push(item); 
      }
      return itemList;
    }, transaction);
  }

  async order(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'ordered' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  async stock(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'in stock' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  async ship(by, orderId, transaction) {
    return this.transaction(async (t) => {
      return this._update({
        status: 'shipped',
        customerOrderId: orderId
      }, { 
        paranoid: false, 
        where: by
      });
    }, transaction);
  }

  async cancel(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'cancelled' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = ItemRepo;