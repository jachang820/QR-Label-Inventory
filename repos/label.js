const BaseRepo = require('./base');
const { Label, sequelize } = require('../models');

class LabelRepo extends BaseRepo {

  constructor() {
    super(Label, 'prefix');

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['updated', 'DESC']
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
      attributes: { exclude: ['id'] },
      paranoid: false
    });
  }

  async getActive() {
    const labels = await this.listActive();
    return labels[0];
  }

  async create(prefix, style) {
    let label = await this._create({
      prefix: prefix,
      style: style
    });
    delete label.id;
    return label;
  }

  async use(id) {
    return this._use({ where: { id } }, true);
  }

  async hide(id) {
    return this._delete({ where: { id } }, false);
  }

  describe() { return this._describe(['id']); }

  styles() {
    return this.Model.rawAttributes.style.values;
  }

  _buildList(page, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    let opts = {
      attributes: [
        ['id', 'clickId'], 'prefix', 'style', 
        [sequelize.literal(`COALESCE(created::text , '')`), 'created'], 
        'hidden'
      ],
      order
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    if (filter) opts.where = LabelRepo.insertDateRange(filter);
    return opts;
  }

};

module.exports = LabelRepo;