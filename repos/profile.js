const SettingsRepo = require('./settings');
const { Profile } = require('../models');

class ProfileRepo extends SettingsRepo {

  constructor() {
    super(Profile, 'email');
  }

  async list() {
    return this._list({ attributes: { exclude: ['id'] } });
  }

  async get(email) {
    return this._get({
      where: { email: email },
      attributes: { exclude: ['id'] }
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
      where: { email: email }
    });
  }

  async delete(email) {
    let profile = await this._delete({ where: { email: email }}, true);
    delete profile.id;
    return profile;
  }

  describe() { return this._describe(['id']); }

  roles() {
    return this.Model.rawAttributes.role.values;
  }

};

module.exports = ProfileRepo;