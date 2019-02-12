const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Color } = require('../models');

class ColorRepo extends BaseRepo {

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