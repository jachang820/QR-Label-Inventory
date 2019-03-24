const BaseRepo = require('./base');
const { Event, Profile, Sequelize } = require('../models');

class EventRepo extends BaseRepo {

  constructor(exclude = []) {
    super(Event);

    this.defaultOrder = [
      ['status', 'ASC'],
      ['started', 'DESC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    let fullName = `CONCAT("Profile"."firstName",' ', "Profile"."lastName")`;
    let opts = {
      attributes: {
        include: [
          ['id', 'clickId'],
          [Sequelize.literal(fullName), "fullName"]
        ],
        exclude: ['id']
      },
      include: [{
        model: Profile,
        attributes: []
      }],
      order
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    if (filter) opts.where = EventRepo.insertDateRange(filter);
    return this._list(opts); 
  }

  async listBusy(target) {
    let opts = {
      where: { status: 'Open', target },
      attributes: ['targetId'],
      order: [['targetId', 'ASC']]
    };
    return this._list(opts);
  }

  async get(id) {
    return this._get({ where: { id } });
  }

  async create(title, max, target, targetId) {
    return this._create({
      progress: 1, 
      max, title, target, targetId,
      status: 'Open' });
  }

  async throw(id, message, stack) {
    return this._update({
      subtitle: message,
      notes: stack,
      status: 'Error',
      finished: new Date().toISOString()
    }, {
      where: { id }
    });
  }

  async update(id, progress, subtitle) {
    return this._update({
      progress, subtitle
    }, {
      where: { id }
    });
  }

  async done(id) {
    const event = await this.get(id);
    return this._update({
      status: 'Success',
      finished: new Date().toISOString(),
      progress: event.max
    }, {
      where: { id }
    });
  }

  async setTarget(id, { target, targetId } = {}) {
    let query = {};
    if (target) query.target = target;
    if (targetId) query.targetId = targetId;
    return this._update(query, { where: { id } });
  }

  describe() {
    let schema = this._describe();
    schema.owner = { type: 'string', optional: false };
    return schema;
  }
};

module.exports = EventRepo;