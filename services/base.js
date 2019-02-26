class BaseService {

  constructor(repo) {
    this.repo = new repo();
  }

  async _getListView(page = 1, order, desc, filter, statusFun) {
    let list = await this.repo.list(page, order, desc, filter);
    if (list.length === 0) return [];
    if (statusFun) {
      list = statusFun(list);
    } else {
      list = BaseService._addListStatus(list);
    }
    return list;
  }

  async _getSchema() {
    let schema = await this.repo.describe();
    schema = BaseService._prepareSchema(schema);
    return schema;
  }

  async _get(id, statusFun) {
    let model = await this.repo.get(id);
    if (!model) return null;
    if (statusFun) {
      model = statusFun(model);
    } else {
      model = BaseService._addListStatus(model);
    }
    return model[0];
  }

  async _changeState(model, id) {
    if (model.state === 'new') model = await this.repo.delete(id);
    else if (model.state === 'used') model = await this.repo.hide(id);
    else if (model.state === 'hidden') model = await this.repo.use(id);
    else {
      let err = new Error("State cannot be changed.");
      err.errors = [{
        msg: err.message,
        param: null,
        critical: true
      }];
      throw err;
    }
    return model;
  }

  async _add(attributes) {
    let model = await this.repo.create(...attributes);
    model = BaseService._addListStatus(model);
    return model[0];
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

  static _prepareSchema(schema) {
    if ('hidden' in schema) delete schema.hidden;
    if ('updated' in schema) delete schema.updated;
    if ('used' in schema) delete schema.used;
    return schema;
  }

  static toTitleCase(str) {
    return str.split(' ').map(e => {
      return e.charAt(0).toUpperCase() + e.substring(1).toLowerCase();
    }).join(' ');
  }

  static mapColumn(table, column) {
    return table.map(e => e[column]);
  }

};

module.exports = BaseService;