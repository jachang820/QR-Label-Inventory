const BaseRepo = require('./base');
const SkuRepo = require('./sku');
const { Color, sequelize } = require('../models');

class ColorRepo extends BaseRepo {

  constructor() {
    super(Color);

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
      where: { id }, 
      paranoid: false
    }, { eventId });
  }

  async create(name, abbrev) {
    let event = await this.events.create("Create Color", 1,
      this.name, name);
    const color = await this._create({
      name: name, 
      abbrev: abbrev 
    }, { eventId: event.id });
    await this.events.done(event.id);
    return color;
  }

  async renew(id, { eventId } = {}) {
    return this._use({ where: { id } }, false,
      { eventId });
  }

  async use(id, { eventId } = {}) {
    let color;
    let event;
    if (!eventId) {
      color = await this.get(id);
      event = await this.events.create("Use Color", 1,
        this.name, color.name);
      eventId = event.id;
    }
    color = await this._use({ where: { id } }, true, { eventId });
    await this.events.done(eventId);
    return color;
  }

  async hide(id) {
    let color = await this.get(id);
    let event = await this.events.create("Hide Color", 1,
      this.name, color.name);
    color = await this._delete({ where: { id }}, false,
      { eventId: event.id });
    await this.events.done(event.id);
    return color;
  }

  async delete(id) {
    let color = await this.get(id);
    let event = await this.events.create("Delete Color", 1,
      this.name, color.name);
    const color = await this._delete({ where: { id }}, true,
      { eventId: event.id });
    await this.events.done(event.id);
    return color;
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

    if (filter) opts.where = ColorRepo.insertDateRange(filter);
    return opts;
  }

};

module.exports = ColorRepo;