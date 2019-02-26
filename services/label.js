const BaseService = require('./base');
const LabelRepo = require('../repos/label');

class Labels extends BaseService {
  constructor() {
    super(LabelRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.style) filter.style = Labels.toTitleCase(filter.style);
    return this._getListView(page, order, desc, filter,
      Labels._addListStatus);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.style.select = this.repo.styles();
    schema.prefix.explanation =
      "Entire URL path preceding the serial, not including " +
      "the query string (denoted by '?').";
    schema.style.explanation =
      "Select Path if serial is expected within URL path. " +
      "Select Querystring if serial is expected as part of " +
      "the query string, as 'id=[serial]', anywhere after " +
      "the '?' delimiter.";
    return schema;
  }

  async get(id) {
    return this._get(id, Labels._addListStatus);
  }

  async add(prefix, style) {
    return this._add(Array.from(arguments));
  }

  async changeState(id) {
    let label = await this.get(id);
    return this._changeState(label, id);
  }

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      list[i].state = list[i].hidden ? 'hidden' : 'used';
      delete list[i].hidden;
    }
    return list;
  }
};

module.exports = Labels;