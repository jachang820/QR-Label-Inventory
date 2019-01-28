const SettingsRepo = require('./settings');
const { Color } = require('../models');

class ColorRepo extends SettingsRepo {

  constructor() {
    super(Color);
  }

  async list() { return this._list({ paranoid: false }); }

  async listActive() { return this._list(); }

  async get(name) {
    return this._get({
      where: { name: name },
      paranoid: false
    });
  }

  async create(name) { return this._create({ name: name }); }

  async renew(name) {
    return this._use({
      where: { name: name },
      paranoid: false
    }, false);
  }

  async use(name) {
    return this._use({
      where: { name: name },
      paranoid: false
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