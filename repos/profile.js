const BaseRepo = require('./base');
const { Profile } = require('../models');

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
      attributes: { include: [['id', 'clickId']], exclude: ['id'] },
      offset: (page - 1) * 20 
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    if (filter) opts.where = ProfileRepo.insertDateRange(filter);
    return this._list(opts);
  }

  async get(id) {
    return this._get({
      where: { id },
      attributes: { include: [['id', 'clickId']], exclude: ['id'] }
    });
  }

  async getByEmail(email) {
    return this._get({
      where: { email },
    });
  }

  async create(first, last, email, role) {
    let profile = await this._create({
      firstName: first,
      lastName: last,
      email: email,
      role: role
    });
    delete profile.id;
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
    let profile = await this._delete({ where: { id }}, true);
    delete profile.id;
    return profile;
  }

  describe() { return this._describe(['id']); }

  roles() {
    return this.Model.rawAttributes.role.values;
  }

};

module.exports = ProfileRepo;