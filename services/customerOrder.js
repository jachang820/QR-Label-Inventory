const BaseService = require('./base');
const CustomerOrderRepo = require('../repos/customerOrder');
const LabelRepo = require('../repos/label');

class CustomerOrders extends BaseService {

  constructor() {
    super(CustomerOrderRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.serial) {
      filter.serial = [filter.serial, filter.serial.toUpperCase()];
    }
    if (filter.type) {
      filter.type = CustomerOrders.toTitleCase(filter.type);
    }
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.type.select = this.repo.types();
    schema.serial.alias = "Order";
    schema.serial.explanation = "Customer order serial number.";
    schema.type.explanation = "Order either sold retail or wholesale.";
    schema.shipped.explanation = "Date order was prepared to be shipped out.";
    return schema;
  }

  async get(id) {
    let order = await this._get(id);
    return this._addListStatus(order);
  }

  async changeState(id) {
    const order = await this.get(id);
    return this._changeState(order, id);
  }

  async add(serial, type, notes, items) {
    serial = serial.toUpperCase();
    const uniqueItems = Array.from(new Set(items));
    if (items.length !== uniqueItems.length) {
      let err = new Error("Duplicate items. Already scanned.");
      err.errors = [{ msg: err.message, param: 'serial' }];
      throw err;
    }
    return this.repo.create(serial, type, notes, items);
  }

  async getDetails(id) {
    return this.repo.expand(id);
  }

  async _addListStatus(list) {
    const inputIsArray = Array.isArray(list);
    if (!inputIsArray) {
      list = [list];
    }

    const busyList = await this._getActiveEvents();

    for (let i = 0; i < list.length; i++) {
      if (list[i].serial in busyList) list[i].state = 'busy';
      else if (list[i].count === 0) list[i].state = 'eternal';
      else if (list[i].hidden) list[i].state = 'hidden';
      else list[i].state = 'used';
      delete list[i].hidden;
      delete list[i].id;
    }

    if (!inputIsArray) list = list[0];
    return list;
  }

};

module.exports = CustomerOrders;