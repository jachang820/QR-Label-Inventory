const BaseService = require('./base');
const SkuRepo = require('../repos/sku');

class Skus extends BaseService {

  constructor() {
    super(SkuRepo);
  }

  async getListView() {
    let list = await this.repo.list();
    list = Skus._addListStatus(list);
    list = Skus._moveCreatedToEnd(list);
    return list;
  }

  async getSchema() {
    let schema = await this.repo.describe();
    schema = Skus._prepareSchema(schema);
    const colors = await this.repo.associate['color'].listActive();
    const sizes = await this.repo.associate['size'].listActive();
    schema.color.type = 'reference';
    schema.size.type = 'reference';
    schema.color.select = Skus.mapColumn(colors, 'name');
    schema.size.select = Skus.mapColumn(sizes, 'name');
    schema = Skus._moveCreatedToEnd([schema])[0];
    return schema;
  }

  async add(id, upc, color, size) {
    let sku = await this.repo.create(id, upc, color, size);
    sku = Skus._addListStatus(sku);
    return sku[0];
  }

};

module.exports = Skus;