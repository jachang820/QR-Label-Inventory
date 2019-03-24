const BaseRepo = require('./base');
const { Profile, sequelize } = require('../models');

class ProfileRepo extends BaseRepo {

  constructor() {
    super(Profile, 'email');

    this.defaultOrder = [
      ['role', 'ASC'],
      ['email', 'ASC']
    ];
  }

  async list(page = 1, order, desc, filter) {
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
    if (filter) opts.where = ProfileRepo.insertDateRange(filter);
    return this._list(opts);
  }

  async get(id) {
    return this._get({
      where: { id },
      attributes: {
        include: [
          ['id', 'clickId'],
          [sequelize.literal(`COALESCE(created::text , '')`), 'created']
        ], 
        exclude: ['id']
      }
    });
  }

  async getByEmail(email) {
    return this._get({
      where: { email },
    });
  }

  async create(first, last, email, role) {
    let event = await this.events.create("Create Profile", 1,
      this.name, email);
    let profile = await this._create({
      firstName: first,
      lastName: last,
      email: email,
      role: role
    }, { eventId: event.id });
    delete profile.id;
    await this.events.done(event.id);
    return profile;
  }

  async update(email, first, last, new_email) {
    return this._update({
      firstName: first,
      lastName: last,
      email: new_email || email
    }, {
      where: { email }
    });
  }

  async delete(id) {
    let profile = await this.get(id);
    let event = await this.events.create("Delete Profile", 1,
      this.name, profile.email);
    profile = await this._delete({ where: { id }}, true,
      { eventId: event.id });
    delete profile.id;
    await this.events.done(event.id);
    return profile;
  }

  describe() { return this._describe(['id', 'fullName']); }

  roles() {
    return this.Model.rawAttributes.role.values;
  }

};

module.exports = ProfileRepo;