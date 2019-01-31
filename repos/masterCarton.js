const SettingsRepo = require('./settings');
const FactoryOrderRepo = require('./factoryOrder');
const InnerCartonRepo = require('./innerCarton');
const SkuRepo = require('./sku');
const { MasterCarton } = require('../models');

class MasterCartonRepo extends SettingsRepo {

  constructor(associate) {
    super(MasterCarton);

    if (!associate) {
      this.assoc = {
        sku: new SkuRepo(true),
        factoryOrder: new FactoryOrderRepo(true),
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
     [...{carton: {sku, factoryOrderId}, quantity, innerSize, masterSize}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let masterList = [];
      let innerList = [];
      for (let i = 0; i < cartons.length; i++) {
        const master = await this._create(cartons[i].carton);
        masterList.push(master);

        const carton = {
          sku: master.sku,
          masterId: master.serial,
          factoryOrderId: master.factoryOrderId
        };
        innerList.push({
          carton: carton,
          quantity: cartons[i].masterSize * cartons[i].quantity,
          innerSize: cartons[i].innerSize
        });
        
      }
      await this.assoc.inner.create(innerList);
      return masterList;
    }, transaction);
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const master = await this._use({ where: by }, true);
      const inner = await this.assoc.inner.use({
        masterId: master.serial
      }, t);
      return master;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const master = await this._delete({ where: by }, false);
      const inner = await this.assoc.inner.hide({
        masterId: master.serial
      }, t);
      return master;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = MasterCartonRepo;