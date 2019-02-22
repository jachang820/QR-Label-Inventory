const BaseService = require('./base');
const ProfileRepo = require('../repos/profile');

class Profiles extends BaseService {
  constructor() {
    super(ProfileRepo);
  }

  async getListView(page = 1, order, desc) {
    let list = await this.repo.list(page, order, desc);
    list = Profiles._addListStatus(list);
    list = Profiles._convertDate(list);
    return list;
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
    return this._get(id);
  }

  async add(first, last, email, role) {
    let profile = await this.repo.create(first, last, email, role);
    profile = Profiles._addListStatus(profile);
    return profile[0];
  }

  async changeState(email) {
    const profile = await this.get(email);
    if (profile.role !== 'Administrator') {
      return this.repo.delete(email);
    }
    let err = new Error("Cannot delete administrators.");
    err.errors = [{
      msg: err.message,
      param: null,
      critical: true
    }];
    throw err;
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