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
    return this._getListView(page, order, desc, filter,
      CustomerOrders._addListStatus);
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
    return this._get(id, CustomerOrders._addListStatus);
  }

  async changeState(id) {
    const order = await this.get(id);
    return this._changeState(order, id);
  }

  async add(serial, type, notes, items) {
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

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].hidden) list[i].state = 'hidden';
      else list[i].state = 'used';
      delete list[i].hidden;
    }
    return list;
  }

};

module.exports = CustomerOrders;