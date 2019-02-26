const BaseService = require('./base');
const SkuRepo = require('../repos/sku');

class Skus extends BaseService {

  constructor() {
    super(SkuRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.id) filter.id = filter.id.toUpperCase();
    if (filter.color) {
      filter.colorId = filter.color;
      delete filter.color;
    }
    if (filter.size) {
      filter.sizeId = filter.size;
      delete filter.size;
    }
    return this._getListView(page, order, desc, filter);
  }

  async getSize(sku) {
    return this.repo.getSize(sku);
  }

  async getSchema() {
    let schema = await this._getSchema();
    const colors = await this.repo.associate.color.listActive();
    const sizes = await this.repo.associate.size.listActive();
    schema.color.type = 'reference';
    schema.size.type = 'reference';
    schema.color.select = colors.map(e => { 
      return { value: e.clickId, text: e.name }
    });
    schema.size.select = sizes.map(e => { 
      return { value: e.clickId, text: e.name }
    });
    schema.id.alias = "SKU";
    schema.upc.alias = "UPC";
    schema.id.explanation = 
      "The SKU represents a color/size combination in the inventory " +
      "system.";
    schema.color.explanation =
      "Colors must be created before it can be used in a SKU.";
    schema.size.explanation =
      "Sizes must be created before it can be used in a SKU.";
    return schema;
  }

  async get(id) {
    return this._get(id);
  }

  async changeState(id) {
    const sku = await this._get(id);
    return this._changeState(sku, id);
  }

  async add(id, upc, colorId, sizeId) {
    id = id.toUpperCase();
    return this._add(Array.from(arguments));
  }

};

module.exports = Skus;