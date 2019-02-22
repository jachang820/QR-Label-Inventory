const BaseService = require('./base');
const CustomerOrderRepo = require('../repos/customerOrder');
const LabelRepo = require('../repos/label');

class CustomerOrders extends BaseService {

  constructor() {
    super(CustomerOrderRepo);
  }

  async getListView(page = 1, order, desc) {
    let list = await this.repo.list(page, order, desc);
    if (list.length === 0) return [];
    list = CustomerOrders._addListStatus(list);
    list = CustomerOrders._convertDate(list);
    return list;
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.serial.alias = "Order";
    schema.serial.explanation = "Customer order serial number.";
    schema.type.explanation = "Order either sold retail or wholesale.";
    schema.shipped.explanation = "Date order was prepared to be shipped out.";
    return schema;
  }

  async get(id) {
    let model = await this.repo.get(id);
    if (!model) return null;
    let model = CustomerOrders._addListStatus(model);
    return model[0];
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
    if (!Array.isArray) {
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