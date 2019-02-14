const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Color } = require('../models');

class ColorRepo extends BaseRepo {

  constructor() {
    super(Color);

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

  async create(name, abbrev) { 
    return this._create({
      name: name, 
      abbrev: abbrev 
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

module.exports = ColorRepo;