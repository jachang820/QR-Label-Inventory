const BaseService = require('./base');
const ProfileRepo = require('../repos/profile');

class Profiles extends BaseService {
  constructor() {
    super(ProfileRepo);
  }

  async getListView(page = 1, order, desc, filter) {
    return this.repo.list(page, order, desc, filter,
      Profiles._addListStatus);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.role.select = this.repo.roles();
    schema.firstName.alias = "First Name";
    schema.lastName.alias = "Last Name";
    schema.email.explanation = 
      "Unique email per account used to log in.";
    schema.role.explanation =
      "Role determines user capabilities. Note that " +
      "administrator accounts cannot be deleted once " +
      "created.";
    return schema;
  }

  async get(id) {
    return this._get(id, Profiles._addListStatus);
  }

  async getByEmail(email) {
    return this.repo.getByEmail(email);
  }

  async add(first, last, email, role) {
    let profile = await this.repo.create(first, last, email, role);
    profile = Profiles._addListStatus(profile);
    return profile[0];
  }

  async changeState(id) {
    const profile = await this.get(id);
    console.log(profile);
    return this._changeState(profile, id);
  }

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      const isAdmin = (list[i].role === 'Administrator');
      list[i].state = isAdmin ? 'eternal' : 'new';
    }
    return list;
  }

};

module.exports = Profiles;