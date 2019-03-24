class BaseService {

  constructor(repo) {
    this.repo = new repo();
  }

  /* Get a list of records. */
  async _getListView(page = 1, order, desc, filter) {
    let list = await this.repo.list(page, order, desc, filter);
    if (list.length === 0) return [];
    else return list;
  }

  /* Get model schema to determine how to display data, and remove
     hidden columns. */
  async _getSchema() {
    let schema = await this.repo.describe();
    schema = BaseService._prepareSchema(schema);
    return schema;
  }

  /* Get a single record. */
  async _get(id) {
    let model = await this.repo.get(id);
    if (!model) return null;
    else return model;
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
        param: 'items',
        critical: true
      }];
      throw err;
    }
    return model;
  }

  /* Create new record using a list of attributes. */
  async _add(attributes) {
    return this.repo.create(...attributes);
  }

  /* Get a list of record ids with open events, showing that they are
     being acted upon (busy). */
  async _getActiveEvents() {
    const ids = await this.repo.events.listBusy(this.repo.name);
    return ids.map(e => e.targetId);
  }

  /* Default function to add status depending on some parameter date
     columns. */
  async _addListStatus(list, eventTarget) {
    const inputIsArray = Array.isArray(list);
    /* Convert input to array. */
    if (!inputIsArray) {
      list = [list];
    }

    if (!eventTarget) eventTarget = 'id';

    /* Get a list of busy records. */
    const busyList = await this._getActiveEvents();

    /* Add status to each record based on hidden and used parameters. */
    for (let i = 0; i < list.length; i++) {
      const active = !list[i].hidden;
      const used = list[i].used;
      if (list[i][eventTarget] in busyList) list[i].state = 'busy';
      else if (active && !used) list[i].state = 'new';
      else if (active && used) list[i].state = 'used';
      else if (!active && used) list[i].state = 'hidden';
      else list[i].state = 'eternal';

      delete list[i].hidden;
      delete list[i].used;
    }

    if (!inputIsArray) list = list[0];
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