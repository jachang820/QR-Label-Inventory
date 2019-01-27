const SettingsRepo = require('./settings');
const MasterCartonRepo = require('./masterCarton');
const { FactoryOrder } = require('../models');

class FactoryOrderRepo extends SettingsRepo {

  constructor() {
    super(FactorOrder);

    this.assoc = {
      masterCarton: new MasterCartonRepo(),
    };
  }

  async list() { return this._list({ paranoid: false }); }

  async listActive() { return this._list(); }

  async get(serial) {
    return this._get({
      where: { id: serial },
      paranoid: false
    });
  }

  async create(id, upc, newColor, newSize) {
    return this.transaction(async (t) => {
      let sku = await this._create({
        id: id,
        upc: upc,
        color: newColor,
        size: newSize
      });

      let color = await this.assoc.color.get(sku.color);
      let size = await this.assoc.size.get(sku.size);

      if (!this.assoc.color.cache.get.used) {
        await this.assoc.color.use(color.name);
      }

      if (!this.assoc.size.cache.get.used) {
        await this.assoc.size.use(size.name);
      }

      return sku;
    });

  }

  async renew(id) {
    return this._use({
      where: { id: id },
      paranoid: false
    }, false);
  }

  async use(id) {
    return this._use({
      where: { id: id },
      paranoid: false
    }, true);
  }

  async hide(id) {
    return this._delete({ where: { id: id }}, false);
  }

  async delete(id) {
    this.transaction(async (t) => {
      let sku = await this.get(id);

      await this.cache.get.destroy({ force: true });

      const optFun = (value) => {
        return {
          where: { name: value },
          paranoid: false
        };
      };

      let color = await this.assoc.color.get(optFun(sku.color));
      let size = await this.assoc.size.get(optFun(sku.size));

      if (!color) await this.assoc.color.renew(sku.color);
      if (!size) await this.assoc.size.renew(sku.size);

      this.cache.delete = sku;
      return sku;

    });
  }

  describe() { return this._describe(); }

};

module.exports = SkuRepo;