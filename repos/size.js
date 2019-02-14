const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Size } = require('../models');

class SizeRepo extends BaseRepo {

  constructor() {
    super(Size);

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['used', 'ASC'],
      ['name', 'ASC']
    ];
  }

  async list(page = 1, order, desc) { 
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      order,
      offset: (page - 1) * 20,
      paranoid: false 
    }); 
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      order,
      offset: (page - 1) * 20
    }); 
  }

  async get(name) {
    return this._get({
      where: { name: name },
      paranoid: false
    });
  }

  async create(name, abbrev, inner, master) {
    return this._create({
      name: name,
      abbrev: abbrev,
      innerSize: inner,
      masterSize: master
    });
  }

  async renew(name) {
    return this._use({
      where: { name: name }
    }, false);
  }

  async use(name) {
    return this._use({
      where: { name: name }
    }, true);
  }

  async hide(name) {
    return this._delete({ where: { name: name }}, false);
  }

  async delete(name) {
    return this._delete({ where: { name: name }}, true);
  }

  describe() { return this._describe(); }

};

module.exports = SizeRepo;