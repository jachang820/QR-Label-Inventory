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
      attributes: { include: [['id', 'clickId']], exclude: ['id'] },
      offset: (page - 1) * 20,
      paranoid: false 
    }); 
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      order,
      attributes: { include: [['id', 'clickId']], exclude: ['id'] },
      offset: (page - 1) * 20
    }); 
  }

  async get(id) {
    return this._get({
      where: { id },
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

  async renew(id) {
    return this._use({ where: { id } }, false);
  }

  async use(id) {
    return this._use({ where: { id } }, true);
  }

  async hide(id) {
    return this._delete({ where: { id } }, false);
  }

  async delete(id) {
    return this._delete({ where: { id }}, true);
  }

  describe() { return this._describe(['id']); }

};

module.exports = SizeRepo;