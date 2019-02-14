class BaseService {

  constructor(repo) {
    this.repo = new repo();
  }

  async getListView(page = 1, order, desc) {
    let list = await this.repo.list(page, order, desc);
    if (list.length === 0) return [];
    list = BaseService._addListStatus(list);
    list = BaseService._convertDate(list);
    return list;
  }

  async getSchema() {
    let schema = await this.repo.describe();
    schema = BaseService._prepareSchema(schema);
    return schema;
  }

  async get(id) {
    let model = await this.repo.get(id);
    if (!model) return null;  
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

  static _convertDate(list) {

    const fixDate = (row, column) => {
      let field = row[column];
      if (field !== undefined) {
        if (field === null) {
          field = '';
        } else {
          field = BaseService._formatDate(field);
        }

        row[column] = field;
      }
    };

    for (let i = 0; i < list.length; i++) {
      fixDate(list[i], 'created');
      fixDate(list[i], 'shipped');
      fixDate(list[i], 'ordered');
      fixDate(list[i], 'arrival');
    }
    return list;
  }

  static _formatDate(date) {
    date = new Date(date);
    if (isNaN(date.getMonth())) date = new Date();

    const year = (date.getYear() + 1900).toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = (date.getDate()).toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
  };

  static _prepareSchema(schema) {
    if ('hidden' in schema) delete schema.hidden;
    if ('updated' in schema) delete schema.updated;
    if ('used' in schema) delete schema.used;
    return schema;
  }

  static mapColumn(table, column) {
    return table.map(e => e[column]);
  }

};

module.exports = BaseService;