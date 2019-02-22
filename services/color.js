const BaseService = require('./base');
const ColorRepo = require('../repos/color');

class Colors extends BaseService {

  constructor() {
    super(ColorRepo);
  }

  async getListView(page = 1, order, desc) {
    return this._getListView(page, order, desc);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.abbrev.alias = "Label Abbreviation";
    schema.abbrev.explanation = 
      "Abbreviation printed on label template.";
    return schema;
  }

  async get(id) {
    return this._get(id);
  }

  async changeState(id) {
    return this._changeState(id);
  }

  async add(name, abbrev) {
  	name = Colors.toTitleCase(name);
  	abbrev = abbrev.toUpperCase();
    return this._add(Array.from(arguments));
  }

};

module.exports = Colors;