const SettingsRepo = require('./settings');
const InnerCartonRepo = require('./innerCarton');
const SkuRepo = require('./sku');
const { Item } = require('../models');

class ItemRepo extends SettingsRepo {

  constructor(associate) {
    super(Item);

    if (!associate) {
      this.assoc = {
        sku: new SkuRepo(true),
        inner: new InnerCartonRepo(true)
      };
    }
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
        const item = await this._create(cartons[i].carton);
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