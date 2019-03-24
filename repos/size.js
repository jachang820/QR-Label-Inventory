const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Size, sequelize } = require('../models');

class SizeRepo extends BaseRepo {

  constructor() {
    super(Size);

    this.defaultOrder = [
      ['hidden', 'ASC'],
      ['used', 'ASC'],
      ['name', 'ASC']
    ];
  }

  async list(page = 1, order, desc, filter) { 
    let opts = this._buildList(page, order, desc, filter);
    return this._list(opts);
  }

  async listActive(page = 1, order, desc) {
    const filter = { hidden: false };
    let opts = this._buildList(page, order, desc, filter);
    return this._list(opts);
  }

  async get(id, { eventId } = {}) {
    return this._get({
      where: { id }
    }, { eventId });
  }

  async create(name, abbrev, inner, master) {
    let event = await this.events.create("Create Size", 1,
      this.name, name);
    const size = this._create({
      name: name,
      abbrev: abbrev,
      innerSize: inner,
      masterSize: master
    }, { eventId: event.id });
    await this.events.done(event.id);
    return size;
  }

  async renew(id, { eventId } = {}) {
    return this._use({ where: { id } }, false,
      { eventId });
  }

  async use(id, { eventId } = {}) {
    let size;
    let event;
    if (!eventId) {
      size = await this.get(id);
      event = await this.events.create("Use Size", 1,
        this.name, size.name);
      eventId = event.id;
    }
    size = await this._use({ where: { id } }, true,
      { eventId });
    await this.events.done(eventId);
    return size;
  }

  async hide(id) {
    let size = await this.get(id);
    let event = await this.events.create("Hide Size", 1,
      this.name, size.name);
    size = await this._delete({ where: { id } }, false,
      { eventId: event.id });
    await this.events.done(event.id);
    return size;
  }

  async delete(id) {
    let size = await this.get(id);
    let event = await this.events.create("Delete Size", 1,
      this.name, size.name);
    size = await this._delete({ where: { id }}, true,
      { eventId: event.id });
    await this.events.done(event.id);
    return size;
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