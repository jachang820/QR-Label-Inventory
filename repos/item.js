const BaseRepo = require('./base');
const db = require('../models');

class ItemRepo extends BaseRepo {

  constructor(exclude = []) {
    super(db.Item);

    exclude.push('item');

    this.assoc = {};
    if (!exclude.includes('sku')) {
      const SkuRepo = require('./sku');
      this.assoc.sku = new SkuRepo(exclude);
    }
    if (!exclude.includes('innerCarton')) {
      const InnerCartonRepo = require('./innerCarton');
      this.assoc.innerCarton = new InnerCartonRepo(exclude);
    }
    if (!exclude.includes('label')) {
      const LabelRepo = require('./label');
      this.assoc.label = new LabelRepo(exclude);
    }

    this.defaultOrder = [
      ['status', 'ASC'],
      ['customerOrderId', 'DESC'],
      ['id', 'ASC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    let where = ItemRepo.buildFilterString(filter, 'Item');

    let offset = '';
    if (page > 0) {
      offset = `LIMIT 51 OFFSET ${(page - 1) * 50}`;
    }

    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    order = order.map(e => `"Item"."${e[0]}" ${e[1]}`);
    order = order.join(', ');

    /* Convert columns to associate columns. */
    const map = {
      factoryOrderId: ['FactoryOrder', 'serial'],
      customerOrderId: ['CustomerOrder', 'serial'],
      innerId: ['InnerCarton', 'serial'],
      masterId: ['MasterCarton', 'serial'],
      arrival: ['FactoryOrder', 'arrival'],
      shipped: ['CustomerOrder', 'shipped']
    };
    let keys = Object.keys(map);
    for (let i = 0; i < keys.length; i++) {
      const oldString = `"Item"."${keys[i]}"`;
      const newString = `"${map[keys[i]][0]}".${map[keys[i]][1]}`;
      where = where.split(oldString).join(newString);
      order = order.split(oldString).join(newString);
    }

    const query = `
      SELECT
        "Item".id AS "clickId", 
        "Item".serial, 
        "Item".status, 
        UPPER("Item".sku) AS sku, 
        COALESCE("InnerCarton".serial, '') AS "innerId", 
        COALESCE("MasterCarton".serial, '') AS "masterId",
        COALESCE("FactoryOrder".serial, '') AS "factoryId",
        COALESCE("Item".created::text, '') AS created,
        COALESCE("FactoryOrder".arrival::text, '') AS arrival,
        COALESCE("CustomerOrder".serial, '') AS "customerId",
        COALESCE("CustomerOrder".shipped::text, '') AS shipped
      FROM "Item"
        LEFT JOIN "CustomerOrder" ON "Item"."customerOrderId" = "CustomerOrder".id
        LEFT JOIN "InnerCarton" ON "Item"."innerId" = "InnerCarton".id
        LEFT JOIN "MasterCarton" ON "Item"."masterId" = "MasterCarton".id
        LEFT JOIN "FactoryOrder" ON "Item"."factoryOrderId" = "FactoryOrder".id
      ${where}
      ORDER BY ${order}
      ${offset}
    `.replace(/\s+/g, ' ').trim();

    const items = await db.sequelize.query(query);
    this.cache.list = items;

    if (!items[0]) return [];
    return items[0]; 
  }

  async expandData(customerOrderId) {
    return this._list({
      where: { customerOrderId: customerOrderId },
      order: [['serial', 'ASC']],
      attributes: [
        ['serial', 'unit'], 
        'status', 
        [db.sequelize.literal(`UPPER(sku)`), 'SKU'], 
        [db.sequelize.literal(`COALESCE(created::text , '')`), 'created'], 
        [db.sequelize.literal(`COALESCE("FactoryOrder".serial, '')`), 
          'Factory Order']
      ],
      include: [{
        model: db.FactoryOrder,
        attributes: []
      }],
      offset: -1
    }); 
  }

  async getStock(id) {
    const tables = ['Item', 'InnerCarton', 'MasterCarton'];
    const filter = tables.map(e => `"${e}".serial = '${id}'`).join(` OR `);
    
    let items = await this.list(0, 'id', true, filter);

    if (items.length === 0) {
      ItemRepo._handleErrors(new Error("Item not found."), 'serial');

    } else if (items.filter(e => e.status !== 'In Stock').length > 0) {
      ItemRepo._handleErrors(new Error("Item is not in stock."), 'serial');
    }
    return items;
  }

  async get(id) {
    return this._get({
      where: { id },
      attributes: {
        include: [
          [db.sequelize.literal(`COALESCE(created::text , '')`), 'created']
        ], 
        exclude: ['id'] 
      },
      paranoid: false
    });
  }

  /* Cartons is a list in the format
     [...{serial, sku, innerId, masterId, factoryOrderId}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      return this._create(cartons);
    }, transaction);
  }

  async order(innerId, transaction) {
    return this.transaction(async (t) => {
      return this._update(
        { status: 'Ordered' },
        { paranoid: false, 
          where: { innerId }
        }
      );
    }, transaction);
  }

  async stock(id, type, transaction) {
    const Op = db.Sequelize.Op;
    let where = {};
    if (type === 'customer') where.customerOrderId = id;
    else if (type === 'factory') where.factoryOrderId = id;
    else where.id = id;
    return this.transaction(async (t) => {
      return this._update(
        { status: 'In Stock' },
        { paranoid: false, where }
      );
    }, transaction);
  }

  /* Alias for stock. */
  async use(id) {
    return this.stock(id);
  }

  async ship(customerOrderId, itemId, transaction) {
    return this.transaction(async (t) => {
      return this._update({
        status: 'Shipped',
        customerOrderId
      }, {  
        where: { id: itemId },
        limit: 1,
        paranoid: false
      });
    }, transaction);
  }

  async reship(customerOrderId, transaction) {
    return this.transaction(async (t) => {
      return this._update({
        status: 'Shipped'
      }, {
        where: { customerOrderId },
        paranoid: false
      });
    }, transaction);
  }

  async cancel(id, bulk, transaction) {
    const Op = db.Sequelize.Op;
    let where = {};
    if (bulk) where.innerId = id;
    else where.id = id;
    return this.transaction(async (t) => {
      return this._update(
        { status: 'Cancelled' },
        { paranoid: false, where }
      );
    }, transaction);
  }

  /* Alias for cancel. */
  async hide(id) {
    return this.cancel(id);
  }

  describe() { 
    let columns = this._describe(['id']);
    return {
      serial: columns.serial,
      status: columns.status,
      sku: columns.sku,
      innerId: columns.innerId,
      masterId: columns.masterId,
      factoryOrderId: columns.factoryOrderId,
      created: columns.created,
      arrival: { type: 'date', optional: true },
      customerOrderId: columns.customerOrderId,
      shipped: { type: 'date', optional: true }
    };
  }

  statuses() {
    return this.Model.rawAttributes.status.values;
  }
};

module.exports = ItemRepo;