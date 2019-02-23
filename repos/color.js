const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Color, sequelize } = require('../models');

class ColorRepo extends BaseRepo {

  constructor() {
    super(Color);

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['used', 'ASC'],
      ['name', 'ASC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    let opts = this._buildList(page, order, desc, filter);
    opts.paranoid = false;
    return this._list(opts);
  }

  async listActive(page = 1, order, desc) {
    let opts = this._buildList(page, order, desc);
    return this._list(opts);
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

  _buildList(page, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    let opts = {
      order,
      attributes: { include: [['id', 'clickId']], exclude: ['id']}
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    if (filter) opts.where = ColorRepo.insertDateRange(filter);
    return opts;
  }

};

module.exports = ColorRepo;