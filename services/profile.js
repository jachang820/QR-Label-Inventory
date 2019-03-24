const BaseService = require('./base');
const ProfileRepo = require('../repos/profile');

class Profiles extends BaseService {
  constructor() {
    super(ProfileRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    if (filter.role) filter.role = Profiles.toTitleCase(filter.role);
    let list = await this._getListView(page, order, desc, filter);
    return this._addListStatus(list);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.role.select = this.repo.roles();

    /* Column names to show. */
    schema.firstName.alias = "First Name";
    schema.lastName.alias = "Last Name";

    /* Explanations on mouse hovers. */
    schema.email.explanation = 
      "Unique email per account used to log in.";
    schema.role.explanation =
      "Role determines user capabilities. Note that " +
      "administrator accounts cannot be deleted once " +
      "created.";
    return schema;
  }

  async get(id) {
    let profile = await this._get(id);
    return this._addListStatus(profile);
  }

  async getByEmail(email) {
    return this.repo.getByEmail(email);
  }

  async add(first, last, email, role) {
    let profile = await this.repo.create(first, last, email, role);
    return this._addListStatus(profile);
  }

  async changeState(id) {
    const profile = await this.get(id);
    return this._changeState(profile, id);
  }

  async _addListStatus(list) {
    const inputIsArray = Array.isArray(list);
    if (!inputIsArray) {
      list = [list];
    }

    const busyList = await this._getActiveEvents();

    for (let i = 0; i < list.length; i++) {
      const isAdmin = (list[i].role === 'Administrator');
      if (list[i].email in busyList) list[i].state = 'busy';
      else if (isAdmin) list[i].state = 'eternal';
      else list[i].state = 'new';
    }

    if (!inputIsArray) list = list[0];
    return list;
  }

};

module.exports = Profiles;