class BaseService {

  constructor(repo) {
    this.repo = new repo();
  }

  /* Get a list of records with an optional function to determine
     and append status. */
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

  /* Get model schema to determine how to display data, and remove
     hidden columns. */
  async _getSchema() {
    let schema = await this.repo.describe();
    schema = BaseService._prepareSchema(schema);
    return schema;
  }

  /* Get a single record with an optional function to determine
     and append status. */
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

  /* Toggle states depending on status. 
     -New records that have not been used can be permenantly deleted.
     -Records associated with others can be hidden, so the association
     is preserved.
     -Hidden records can be re-activated.
     -Records marked eternal, or unmarked records cannot be deleted or
     hidden. */
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

  /* Create new record using a list of attributes. */
  async _add(attributes) {
    let model = await this.repo.create(...attributes);
    model = BaseService._addListStatus(model);
    return model[0];
  }

  /* Default function to add status depending on some parameter date
     columns. */
  static _addListStatus(list) {
    /* Convert input to array. */
    if (!Array.isArray(list)) {
      list = [list];
    }

    /* Add status to each record based on hidden and used parameters. */
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

  /* Delete parameter columns in schema. */
  static _prepareSchema(schema) {
    if ('hidden' in schema) delete schema.hidden;
    if ('updated' in schema) delete schema.updated;
    if ('used' in schema) delete schema.used;
    return schema;
  }

  /* Helper: Convert input string to Title Case. */
  static toTitleCase(str) {
    return str.split(' ').map(e => {
      return e.charAt(0).toUpperCase() + e.substring(1).toLowerCase();
    }).join(' ');
  }

  /* Helper: Convert list of objects to list of a property of the 
     object. */
  static mapColumn(table, column) {
    return table.map(e => e[column]);
  }

};

module.exports = BaseService;