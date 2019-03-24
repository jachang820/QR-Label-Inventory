const BaseRepo = require('./base');
const { Label, sequelize } = require('../models');

class LabelRepo extends BaseRepo {

  constructor() {
    super(Label, 'prefix');

    this.defaultOrder = [
      ['hidden', 'ASC'],
      ['updated', 'DESC']
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
    let event = await this.events.create("Create Label", 1,
      this.name, `${prefix} -- ${style}`);
    let label = await this._create({
      prefix: prefix,
      style: style
    }, { eventId: event.id });
    delete label.id;
    await this.events.done(event.id);
    return label;
  }

  async use(id) {
    let label = await this.get(id);
    let event = await this.events.create("Use Label", 1,
      this.name, `${label.prefix} -- ${label.style}`);
    label = await this._use({ where: { id } }, true,
      { eventId: event.id });
    await this.events.done(event.id);
    return label;
  }

  async hide(id) {
    let label = await this.get(id);
    let event = await this.events.create("Hide Label", 1,
      this.name, `${label.prefix} -- ${label.style}`);
    label = await this._delete({ where: { id } }, false,
      { eventId: event.id });
    await this.events.done(event.id);
    return label;
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