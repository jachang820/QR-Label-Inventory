const BaseRepo = require('./base');
const { Label } = require('../models');

class LabelRepo extends BaseRepo {

  constructor() {
    super(Label, 'prefix');

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['updated', 'DESC']
    ];
  }

  async list(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      attributes: [['id', 'clickId'], 'prefix', 'style', 'created', 'hidden'],
      order,
      offset: (page - 1) * 20,
      paranoid: false
    });
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      attributes: [['id', 'clickId'], 'prefix', 'style', 'created', 'hidden'],
      order,
      offset: (page - 1) * 20
    });
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

};

module.exports = LabelRepo;