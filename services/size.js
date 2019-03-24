const BaseService = require('./base');
const SizeRepo = require('../repos/size');

class Sizes extends BaseService {

  constructor() {
    super(SizeRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.name) filter.name = Sizes.toTitleCase(filter.name);
    if (filter.abbrev) filter.abbrev = filter.abbrev.toUpperCase();
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
  }

  async getSchema() {
    let schema = await this._getSchema();

    /* Column names to show. */
    schema.abbrev.alias = "Label Abbreviation";
    schema.innerSize.alias = "Units/Inner";
    schema.masterSize.alias = "Inner/Master";

    /* Explanations on mouse hovers. */
    schema.abbrev.explanation = 
      "Abbreviation printed on label template.";
    schema.innerSize.explanation = 
      "Number of units per inner carton.";
    schema.masterSize.explanation =
      "Number of inner cartons per master carton.";
    return schema;
  }

  async get(id) {
    let size = await this._get(id);
    return this._addListStatus(size);
  }

  async changeState(id) {
    const size = await this._get(id);
    return this._changeState(size, id);
  }

  async add(name, abbrev, innerSize, masterSize) {
    name = Sizes.toTitleCase(name);
    abbrev = abbrev.toUpperCase();
    let size = await this._add([name, abbrev, innerSize, masterSize]);
    return this._addListStatus(size);
  }

  async addListStatus(list) {
    return this._addListStatus(list, 'name');
  }

};

module.exports = Sizes;