const SettingsRepo = require('./settings');
const { Label } = require('../models');

class LabelRepo extends SettingsRepo {

  constructor() {
    super(Label, 'prefix');
  }

  async list() {
    return this._list({
      attributes: { exclude: ['id'] },
      paranoid: false
    });
  }

  async liveActive() {
    return this._list({
      attributes: { exclude: ['id'] }
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
      },
      paranoid: false
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