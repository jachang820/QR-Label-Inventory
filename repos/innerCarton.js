const BaseRepo = require('./base');
const { InnerCarton } = require('../models');

class InnerCartonRepo extends BaseRepo {

  constructor(exclude = []) {
    super(InnerCarton);

    exclude.push('innerCarton');
    
    this.assoc = {};
    if (!exclude.includes('sku')) {
      const SkuRepo = require('./sku');
      this.assoc.sku = new SkuRepo(exclude);
    }
    if (!exclude.includes('masterCarton')) {
      const MasterCartonRepo = require('./masterCarton');
      this.assoc.masterCarton = new MasterCartonRepo(exclude);
    }
    if (!exclude.includes('item')) {
      const ItemRepo = require('./item');
      this.assoc.item = new ItemRepo(exclude);
    }
    const EventRepo = require('./event');
    this.events = new EventRepo();
  }

  async list(by) {
    // Implement this later.
  }

  async get(serial) {
    // Not sure how to implement this yet.
  }

  /* Cartons is a list in the format
     [...{sku, masterId}] */
  async create(cartons, eventId, transaction) {
    return this.transaction(async (t) => {
      return this._create(cartons, { eventId });
    }, transaction);
  }

  async use(id, eventId, transaction) {
    return this.transaction(async (t) => {
      return this._use({ where: { masterId: id } }, 
        true, { eventId });
    }, transaction);
  }

  async hide(id, eventId, transaction) {
    return this.transaction(async (t) => {
      return this._delete({ where: { masterId: id } }, 
        false, { eventId });
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = InnerCartonRepo;