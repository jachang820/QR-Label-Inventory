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
    for (let i = 0; i < list.length; i++) {
      if (list[i].hidden) list[i].state = 'hidden';
      else list[i].state = 'used';
      delete list[i].hidden;
    }
    list = CustomerOrders._convertDate(list);
    return list;
  }

  async get(id) {
    let model = await this.repo.get(id);
    if (!model) return null;
    if (model.hidden) model.state = 'hidden';
    else model.state = 'used';
    return model;
  }

  // fix
  async add(serial, notes, order) {
    return this.repo.create(serial, notes, order);
  }

  async getDetails(id) {
    return this.repo.expand(id);
  }

  async stock(id) {
    return this.repo.stock(id);
  }

};

module.exports = CustomerOrders;