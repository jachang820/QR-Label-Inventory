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
      attributes: { include: [['id', 'clickId']], exclude: ['id']},
      offset: (page - 1) * 20,
      paranoid: false 
    }); 
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      order,
      attributes: { include: [['id', 'clickId']], exclude: ['id']},
      offset: (page - 1) * 20
    }); 
  }

  async get(id) {
    return this._get({ 
      where: { id }, 
      paranoid: false
    });
  }

  async create(name, abbrev) { 
    return this._create({
      name: name, 
      abbrev: abbrev 
    }); 
  }

  async renew(id) {
    return this._use({ where: { id } }, false);
  }

  async use(id) {
    return this._use({ where: { id } }, true);
  }

  async hide(id) {
    return this._delete({ where: { id }}, false);
  }

  async delete(id) {
    return this._delete({ where: { id }}, true);
  }

  describe() { return this._describe(['id']); }

};

module.exports = ColorRepo;