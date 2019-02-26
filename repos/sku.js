const BaseRepo = require('./base');
const { Sku, Color, Size, Sequelize } = require('../models');

class SkuRepo extends BaseRepo {

  constructor(exclude = []) {
    super(Sku);

    exclude.push('sku');
    this.assoc = {};
    if (!exclude.includes('color')) {
      const ColorRepo = require('./color');
      this.assoc.color = new ColorRepo(exclude);
    }
    if (!exclude.includes('size')) {
      const SizeRepo = require('./size');
      this.assoc.size = new SizeRepo(exclude);
    }

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['used', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  async list(page = 1, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    if (order === 'color') order = Sequelize.col('Color.name');
    if (order === 'size') order = Sequelize.col('Size.name');
    order = order ? [[order, direction]] : this.defaultOrder;
    filter = SkuRepo.insertDateRange(filter);
    return this._list(
      this._listOptions({
        paranoid: false, page, order, filter
      })
    ); 
  }

  async listSize(page = 1, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    filter = SkuRepo.insertDateRange(filter);
    return this._list(
      this._listSizeOptions({ page, order, filter })
    );    
  }

  async listActive(page = 1, order, desc, filter) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    filter = SkuRepo.insertDateRange(filter);
    return this._list(
      this._listOptions({ page, order, filter })
    );
  }

  async get(id) {
    return this._get(this._listIdOptions({
      filter: { id }, paranoid: false
    }));
  }

  async getSize(id) {
    return this._get(this._listSizeOptions({
      filter: { id }, paranoid: false
    }));    
  }

  async create(id, upc, colorId, sizeId) {
    return this.transaction(async (t) => {
      let sku = await this._create({ id, upc, colorId, sizeId }, {
        attributes: ['id', 'upc', 'colorId', 'sizeId', 'created',
                     'used', 'hidden']
      });

      let color = await this.assoc.color.get(sku.colorId);
      let size = await this.assoc.size.get(sku.sizeId);

      if (!this.assoc.color.cache.get.used) {
        await this.assoc.color.use(color.id);
      }

      if (!this.assoc.size.cache.get.used) {
        await this.assoc.size.use(size.id);
      }

      return sku;
    });

  }

  async renew(id) {
    return this._use(this._listIdOptions({
      filter: { id }
    }), false);
  }

  async use(id) {
    return this._use(this._listIdOptions({
      filter: { id }
    }), true);
  }

  async hide(id) {
    return this._delete(this._listIdOptions({
      filter: { id }, paranoid: true
    }), false);
  }

  async delete(id) {
    return this.transaction(async (t) => {
      let sku = await this._delete(
        this._listIdOptions({ filter: { id }, paranoid: true }), 
        true);

      let color = await this.assoc.color.get(sku.colorId);
      let size = await this.assoc.size.get(sku.sizeId);

      if (!color) await this.assoc.color.renew(sku.colorId);
      if (!size) await this.assoc.size.renew(sku.sizeId);

      return sku;

    });
  }

  describe() {
    const schema = this._describe();
    return {
      id: schema.id,
      upc: schema.upc,
      color: schema.colorId,
      size: schema.sizeId,
      created: schema.created,
      used: schema.used,
      hidden: schema.hidden
    };
  }

  _listIdOptions({ paranoid = true, page = 1, order = null, filter = null } = {}) {
    return this._buildList(page, order, filter, [
      ['id', 'clickId'], 'id', 'upc', 'colorId', 'sizeId', 
      [Sequelize.literal(`COALESCE("Sku".created::text , '')`), 'created'],
      'used', 'hidden'
    ], paranoid);
  }

  _listOptions({ paranoid = true, page = 1, order = null, filter = null } = {}) {
    return this._buildList(page, order, filter, [
      ['id', 'clickId'], 'id', 'upc',
      [Sequelize.col('Color.name'), 'color'], 
      [Sequelize.col('Size.name'), 'size'], 
      [Sequelize.literal(`COALESCE("Sku".created::text , '')`), 'created'], 
      'used', 'hidden'
    ], paranoid);
  }

  _listSizeOptions({ page = 1, order = null, filter = null } = {}) {
    return this._buildList(page, order, filter, [
      'id', 
      [Sequelize.col('Size.innerSize'), 'innerSize'],
      [Sequelize.col('Size.masterSize'), 'masterSize']
    ], false);
  }

  _buildList(page = 1, order, filter, attributes, paranoid) {
    let opts = {
      include: [{
        model: Color,
        attributes: []
      }, {
        model: Size,
        attributes: []
      }]
    };
    if (page > 0) opts.offset = (page - 1) * 20;
    opts.order = order || this.defaultOrder;
    if (filter) opts.where = filter;
    opts.paranoid = paranoid || true;
    if (attributes) opts.attributes = attributes;
    return opts;
  }
};

module.exports = SkuRepo;