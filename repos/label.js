const BaseRepo = require('./base');
const { Label } = require('../models');

class LabelRepo extends BaseRepo {

  constructor() {
    super(Label, 'prefix');

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['updated', 'DESC'],
      ['prefix', 'ASC'],
      ['style', 'ASC']
    ];
  }

  async list(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      attributes: { exclude: ['id'] },
      order,
      offset: (page - 1) * 20,
      paranoid: false
    });
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      attributes: { exclude: ['id'] },
      order,
      offset: (page - 1) * 20
    });
  }

  async get(prefix, style) {
    return this._get({
      where: { 
        prefix: prefix,
        style: style
      },
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

  async use(prefix, style) {
    return this._use({
      where: {
        prefix: prefix,
        style: style
      }
    }, true);
  }

  async hide(prefix, style) {
    return this._delete({
      where: {
        prefix: prefix,
        style: style
      }
    }, false);
  }

  describe() { return this._describe(['id']); }

  styles() {
    return this.Model.rawAttributes.style.values;
  }

};

module.exports = LabelRepo;