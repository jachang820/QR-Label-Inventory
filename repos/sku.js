const BaseRepo = require('./base');
const { Sku, Size, Sequelize } = require('../models');

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
      ['size', 'ASC'],
      ['color', 'ASC']
    ];
  }

  async list(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list(
      this._listOptions(null, false, page, order)
    ); 
  }

  async listSize(by, page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list(
      this._listSizeOptions(by, page, order)
    );    
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list(
      this._listOptions(null, true, page, order)
    );
  }

  async get(id) {
    return this._get(this._listOptions({ id: id }, false));
  }

  async getSize(id) {
    return this._get(this._listSizeOptions({ id: id }));    
  }

  async create(id, upc, newColor, newSize) {
    return this.transaction(async (t) => {
      let sku = await this._create({
        id: id,
        upc: upc,
        color: newColor,
        size: newSize
      }, {
        attributes: ['id', 'upc', 'color', 'size', 'created',
                     'used', 'hidden']
      });

      let color = await this.assoc.color.get(sku.color);
      let size = await this.assoc.size.get(sku.size);

      if (!this.assoc.color.cache.get.used) {
        await this.assoc.color.use(color.name);
      }

      if (!this.assoc.size.cache.get.used) {
        await this.assoc.size.use(size.name);
      }

      return sku;
    });

  }

  async renew(id) {
    return this._use(this._listOptions({ id }), false);
  }

  async use(id) {
    return this._use(this._listOptions({ id }), true);
  }

  async hide(id) {
    return this._delete(this._listOptions({ id }, true), false);
  }

  async delete(id) {
    return this.transaction(async (t) => {
      let sku = await this._delete(
        this._listOptions({ id }, true), 
        true);

      let color = await this.assoc.color.get(sku.color);
      let size = await this.assoc.size.get(sku.size);

      if (!color) await this.assoc.color.renew(sku.color);
      if (!size) await this.assoc.size.renew(sku.size);

      return sku;

    });
  }

  describe() {
    const schema = this._describe();
    return {
      id: schema.id,
      upc: schema.upc,
      color: schema.color,
      size: schema.size,
      created: schema.created,
      used: schema.used,
      hidden: schema.hidden
    };
  }

  _listOptions(by, paranoid, page = 1, order) {
    let opts = { 
      attributes: ['id', 'upc', 'color', 'size', 'created',
                   'used', 'hidden'],
      order: order || this.defaultOrder,
      offset: (page - 1) * 20,
      paranoid: paranoid
    };
    if (by) opts.where = by;
    return opts;
  }

  _listSizeOptions(by, page = 1, order) {
    return { 
      where: by,
      attributes: ['id', 
        [Sequelize.col('Size.innerSize'), 'innerSize'],
        [Sequelize.col('Size.masterSize'), 'masterSize']
      ],
      include: [{ model: Size, attributes: [] }],
      order: order || this.defaultOrder,
      offset: (page - 1) * 20,
      paranoid : false
    };
  }
};

module.exports = SkuRepo;