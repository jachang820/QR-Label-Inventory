const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Size, sequelize } = require('../models');

class SizeRepo extends BaseRepo {

  constructor() {
    super(Size);

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

  _buildList(page, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    let opts = {
      order,
      attributes: {
        include: [
          ['id', 'clickId'],
          [sequelize.literal(`COALESCE(created::text , '')`), 'created']
        ], 
        exclude: ['id']
      }
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    if (filter) opts.where = SizeRepo.insertDateRange(filter);
    return opts;
  }

};

module.exports = SizeRepo;