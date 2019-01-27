class BaseService {

  constructor(repo) {
    this.repo = new repo();
  }

  async getListView() {
    let list = await this.repo.list();
    list = BaseService._addListStatus(list);
    return list;
  }

  async getSchema() {
    let schema = await this.repo.describe();
    schema = BaseService._prepareSchema(schema);
    return schema;
  }

  async get(id) {
    let model = await this.repo.get(id);
    model = BaseService._addListStatus(model);
    return model[0];
  }

  async changeState(id) {
    const model = await this.get(id);
    if (model.state === 'new') await this.repo.delete(id);
    else if (model.state === 'used') await this.repo.hide(id);
    else if (model.state === 'hidden') await this.repo.use(id);
    else throw new Error("State cannot be changed.");
  }

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      const active = !list[i].hidden;
      const used = list[i].used;
      if (active && !used) list[i].state = 'new';
      else if (active && used) list[i].state = 'used';
      else if (!active && used) list[i].state = 'hidden';
      else list[i].state = 'eternal';

      delete list[i].hidden;
      delete list[i].used;
    }
    return list;
  }

  static _moveCreatedToEnd(list) {
    for (let i = 0; i < list.length; i++) {
      const created = list[i].created;
      if (created) {
        delete list[i].created;
        list[i].created = created;
      }
    }
    return list;
  }

  static _prepareSchema(schema) {
    if ('hidden' in schema) delete schema.hidden;
    if ('used' in schema) delete schema.used;
    return schema;
  }

  static mapColumn(table, column) {
    return table.map(e => e[column]);
  }

};

module.exports = BaseService;