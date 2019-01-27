const BaseService = require('./base');
const ProfileRepo = require('../repos/profile');

class Profiles extends BaseService {
  constructor() {
    super(ProfileRepo);
  }

  async getListView() {
    let list = await this.repo.list();
    for (let i = 0; i < list.length; i++) {
      if (list[i].role === 'administrator') {
        list[i].state = 'eternal';
      } else {
        list[i].state = 'new';
      }
    }
    return list;
  }

  async getSchema() {
    let schema = await this.repo.describe();
    schema = Profiles._prepareSchema(schema);
    schema['role'].select = this.repo.roles();
    return schema;
  }

  async add(first, last, email, role) {
    let profile = await this.repo.create(first, last, email, role);
    if (profile.role === 'administrator') {
      profile.state = 'eternal';
    } else {
      profile.state = 'new';
    }
    return profile;
  }

  async changeState(email) {
    const profile = await this.get(email);
    if (profile.role !== 'administrator') {
      return this.repo.delete(email);
    }
    throw new Error("Cannot delete administrators.");
  }

};

module.exports = Profiles;