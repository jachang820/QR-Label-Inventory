const BaseRepo = require('./base');
const ColorRepo = require('./color');
const SizeRepo = require('./size');
const { Sku, Size, Sequelize } = require('../models');

class SkuRepo extends BaseRepo {

  constructor(exclude = []) {
    super(Sku);

    exclude.push('sku');
    this.assoc = {};
    if (!exclude.includes('color'))
      this.assoc.color = new ColorRepo(exclude);
    if (!exclude.includes('size'))
      this.assoc.size = new SizeRepo(exclude);
  }

  async list(by) {
    return this._list(this._listOptions(by, false)); 
  }

  async listSize(by) {
    return this._list(this._listSizeOptions(by));    
  }

  async listActive(by) { 
    return this._list(this._listOptions(by, true));
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

  _listOptions(by, paranoid) {
    return { 
      where: by,
      attributes: ['id', 'upc', 'color', 'size', 'created',
                   'used', 'hidden'],
      paranoid: paranoid
    };
  }

  _listSizeOptions(by) {
    return { 
      where: by,
      attributes: ['id', 
        [Sequelize.col('Size.innerSize'), 'innerSize'],
        [Sequelize.col('Size.masterSize'), 'masterSize']
      ],
      include: [{ model: Size, attributes: [] }],
      paranoid : false
    };
  }
};

module.exports = SkuRepo;