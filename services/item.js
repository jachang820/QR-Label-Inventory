const BaseService = require('./base');
const ItemRepo = require('../repos/item');

class Items extends BaseService {

  constructor() {
    super(ItemRepo);
  }

  async getListView(by, page = 1, order, desc) {
    let list = await this.repo.list(by, page, order, desc);
    if (list.length === 0) return [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].status === 'in stock') list[i].state = 'used';
      else list[i].state = 'eternal';
      delete list[i].hidden;
    }
    list = Items._convertDate(list);
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

module.exports = Items;