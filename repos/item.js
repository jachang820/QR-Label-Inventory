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
      ['hidden', 'DESC NULLS FIRST'],
      ['status', 'ASC'],
      ['customerOrderId', 'DESC'],
      ['id', 'DESC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    const where = ItemRepo.buildFilterString(filter);

    let offset = '';
    if (page > 0) {
      offset = `LIMIT 51 OFFSET ${(page - 1) * 50}`;
    }

    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    order = order.map(e => `"Item"."${e[0]}" ${e[1]}`);
    order = order.join(', ');

    const query = `
      SELECT
        "Item".id AS "clickId", 
        "Item".serial, 
        "Item".status, 
        UPPER("Item".sku) AS sku, 
        COALESCE("InnerCarton".serial, '') AS "innerId", 
        COALESCE("MasterCarton".serial, '') AS "masterId",
        COALESCE("FactoryOrder".serial, '') AS "factoryId",
        "Item".created,
        "FactoryOrder".arrival,
        COALESCE("CustomerOrder".serial, '') AS "customerId",
        "CustomerOrder".shipped
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
        'created', 
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
    const Op = db.Sequelize.Op;
    const tables = ['Item', 'InnerCarton', 'MasterCarton'];
    const by = tables.map(e => `"${e}".serial = '${id}'`).join(` OR `);
    
    let items = await this.list(by, 0, 'id', 'true');

    if (items.length === 0) {
      ItemRepo._handleErrors(new Error("Item not found."), 'serial');

    } else if (items.filter(e => e.status !== 'in stock').length > 0) {
      ItemRepo._handleErrors(new Error("Item is not in stock."), 'serial');
    }

    for (let i = 0; i < items.length; i++) {
      delete items[i].status;
      delete items[i].factorySerial;
      delete items[i].customerSerial;
    }
    return items;
  }

  /* Cartons is a list in the format
     [...{carton: {serial, sku, innerId, masterId, factoryOrderId}, quantity}] */
  async create(cartons, transaction) {
    return this.transaction(async (t) => {
      let itemList = [];

      for (let i = 0; i < cartons.length; i++) {
        const cartonList = Array(cartons[i].quantity).fill(cartons[i].carton);
        const item = await this._create(cartonList);
        itemList.push(item); 
      }
      return itemList;
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

  /* 'id' can be factoryOrderId or customerOrderId. */
  async stock(id, transaction) {
    const Op = db.Sequelize.Op;
    return this.transaction(async (t) => {
      return this._update(
        { status: 'In Stock' },
        { paranoid: false, 
          where: {
            [Op.or]: [
              { factoryOrderId: id },
              { customerOrderId: id }
            ] 
          } 
        }
      );
    }, transaction);
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

  async cancel(innerId, transaction) {
    return this.transaction(async (t) => {
      return this._update(
        { status: 'Cancelled' },
        { paranoid: false, 
          where: { innerId } 
        }
      );
    }, transaction);
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
      arrival: { type: 'dateonly', optional: true },
      customerOrderId: columns.customerOrderId,
      shipped: { type: 'dateonly', optional: true }
    };
  }

};

module.exports = ItemRepo;