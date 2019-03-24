const BaseService = require('./base');
const LabelRepo = require('../repos/label');

class Labels extends BaseService {
  constructor() {
    super(LabelRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.style) filter.style = Labels.toTitleCase(filter.style);
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.style.select = this.repo.styles();

    /* Explanations on mouse hovers. */
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
    let label = await this._get(id);
    return this._addListStatus(label);
  }

  async add(prefix, style) {
    let label = await this._add(Array.from(arguments));
    return this._addListStatus(label);
  }

  async changeState(id) {
    let label = await this.get(id);
    return this._changeState(label, id);
  }

  async _addListStatus(list) {
    const inputIsArray = Array.isArray(list);
    if (!inputIsArray) {
      list = [list];
    }

    const busyList = await this._getActiveEvents();

    for (let i = 0; i < list.length; i++) {
      const active = !list[i].hidden;
      const eventTarget = `${list[i].prefix} -- ${list[i].style}`;
      if (eventTarget in busyList) list[i].state = 'busy';
      else if (active) list[i].state = 'used';
      else list[i].state = 'hidden';
      delete list[i].hidden;
    }

    if (!inputIsArray) list = list[0];
    return list;
  }
};

module.exports = Labels;