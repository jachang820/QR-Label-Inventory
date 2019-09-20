const BaseService = require('./base');
const SkuRepo = require('../repos/sku');

class Skus extends BaseService {

  constructor() {
    super(SkuRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    /* Convert inputs to correct text case. */
    if (filter.id) filter.id = filter.id.toUpperCase();
    if (filter.color) {
      filter.colorId = filter.color;
      delete filter.color;
    }
    if (filter.size) {
      filter.sizeId = filter.size;
      delete filter.size;
    }
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
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

    /* Include all colors and sizes in listboxes in form. */
    schema.color.select = colors.map(e => { 
      return { value: e.clickId, text: e.name }
    });
    schema.size.select = sizes.map(e => { 
      return { value: e.clickId, text: e.name }
    });

    /* Column names to show. */
    schema.id.alias = "SKU";
    schema.upc.alias = "UPC";

    /* Explanations on mouse hovers. */
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
    let sku = await this._get(id);
    return this._addListStatus(sku);
  }

  async changeState(id) {
    const sku = await this.get(id);
    return this._changeState(sku, id);
  }

  async add(id, upc, colorId, sizeId) {
    id = id.toUpperCase();
    let sku = await this._add([id, upc, colorId, sizeId]);
    return this._addListStatus(sku);
  }

};

module.exports = Skus;