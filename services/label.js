const BaseService = require('./base');
const LabelRepo = require('../repos/label');

class Labels extends BaseService {
  constructor() {
    super(LabelRepo);
  }

  async getListView() {
    let list = await this.repo.list();
    for (let i = 0; i < list.length; i++) {
      list[i].state = list[i].hidden ? 'hidden' : 'used';
      delete list[i].hidden;
    }
    return list;
  }

  async getSchema() {
    let schema = await this.repo.describe();
    schema = Labels._prepareSchema(schema);
    schema['style'].select = this.repo.styles();
    return schema;
  }

  async add(prefix, style) {
    let label = await this.repo.create(prefix, style);
    label.state = 'used';
    delete label.hidden;
    return label;
  }

  async changeState(prefix, style) {
    let label = await this.repo.get(prefix, style);
    if (label.hidden) label = await this.repo.use(prefix, style);
    else label = await this.repo.hide(prefix, style);
    label.state = label.hidden ? 'hidden' : 'used';
    return label;
  }

};

module.exports = Labels;