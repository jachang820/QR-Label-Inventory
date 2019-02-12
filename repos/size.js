const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Size } = require('../models');

class SizeRepo extends BaseRepo {

  constructor() {
    super(Size);
  }

  async list() { return this._list({ paranoid: false }); }

  async listActive() { return this._list(); }

  async get(name) {
    return this._get({
      where: { name: name },
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

module.exports = SizeRepo;