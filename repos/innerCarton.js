const SettingsRepo = require('./settings');
const MasterCartonRepo = require('./innerCarton');
const ItemRepo = require('./item');
const SkuRepo = require('./sku');
const { InnerCarton } = require('../models');

class InnerCartonRepo extends SettingsRepo {

  constructor(assocaite) {
    super(InnerCarton);

    if (!associate) {
      this.assoc = {
        sku: new SkuRepo(true),
        master: new MasterCartonRepo(true),
        item: new ItemRepo(true)
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
     [...{carton: {sku, masterId, factoryOrderId}, quantity, innerSize}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let innerList = [];
      let itemList = [];
      for (let i = 0; i < cartons.length; i++) {
        const inner = await this._create(cartons[i].carton);
        innerList.push(inner);

        const carton = {
          sku: inner.sku,
          innerId: inner.serial,
          masterId: inner.masterId,
          factoryOrderId: inner.factoryOrderId
        };
        itemList.push({
          carton: carton,
          quantity: cartons[i].innerSize * cartons[i].quantity
        });
        
      }
      await this.assoc.item.create(itemList);
      return innerList;
    }, transaction);
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._use({ where: by }, true);
      let items = await this.assoc.items.use({
        innerId: inner.serial
      }, t);
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      let inner = await this._delete({ where: by }, false);
      let items = await this.assoc.item.hide({
        innerId: inner.serial
      }, t);
      return inner;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = InnerCartonRepo;