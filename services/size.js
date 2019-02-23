const BaseService = require('./base');
const SizeRepo = require('../repos/size');

class Sizes extends BaseService {

  constructor() {
    super(SizeRepo);
  }

  async getListView(page = 1, order, desc, filter) {
    return this._getListView(page, order, desc, filter);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.abbrev.alias = "Label Abbreviation";
    schema.innerSize.alias = "Units/Inner";
    schema.masterSize.alias = "Inner/Master";
    schema.abbrev.explanation = 
      "Abbreviation printed on label template.";
    schema.innerSize.explanation = 
      "Number of units per inner carton.";
    schema.masterSize.explanation =
      "Number of inner cartons per master carton.";
    return schema;
  }

  async get(id) {
    return this._get(id);
  }

  async changeState(id) {
    const size = await this._get(id);
    return this._changeState(size, id);
  }

  async add(name, abbrev, innerSize, masterSize) {
    name = Sizes.toTitleCase(name);
    abbrev = abbrev.toUpperCase();
    return this._add(Array.from(arguments));
  }

};

module.exports = Sizes;