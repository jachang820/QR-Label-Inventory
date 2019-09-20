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

    this.defaultOrder = [
      ['status', 'ASC'],
      ['customerOrderId', 'DESC'],
      ['id', 'ASC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    let where = ItemRepo.buildFilterString(filter, 'Item');
    console.log(where);

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
      console.log(where);
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
    console.log(items)

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
      }]
    }); 
  }

  async getStock(id) {
    const tables = ['Item', 'InnerCarton', 'MasterCarton'];
    const filter = tables.map(e => `"${e}".serial = '${id}'`).join(` OR `);
    
    let items = await this.list(0, 'id', true, filter);

    let param = { param: 'serial' };
    if (items.length === 0) {
      this._handleErrors(new Error("Item not found."), param);

    } else if (items.filter(e => e.status !== 'In Stock').length > 0) {
      this._handleErrors(new Error("Item is not in stock."), param);
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
      }
    });
  }

  /* Cartons is a list in the format
     [...{serial, sku, innerId, masterId, factoryOrderId}] */
  async create(cartons, eventId, transaction) {
    return this.transaction(async (t) => {
      const count = cartons.length;
      let event;
      let existingEvent = true;
      if (!eventId) {
        existingEvent = false;
        event = await this.events.create("Add Units to Inventory", count, 
          this.name);
        eventId = event.id;
      }

      const items = await this._create(cartons, { eventId });
      const skus = [...new Set(items.map(e => e.sku))];
      if (!existingEvent) await this.events.update(eventId, event.progress,
        "Created units.");
      
      /* Use SKUs. */
      if (existingEvent && this.assoc.sku) {
        for (let i = 0; i < skus.length; i++) {
          await this.assoc.sku.use(skus[i], { eventId });
        }
      }

      if (!existingEvent) await this.events.done(eventId);

      return items;
    }, transaction);
  }

  async order(factoryOrderId, eventId, transaction) {
    return this.transaction(async (t) => {
      let items = [];
      let where = { factoryOrderId, status: 'Cancelled' };
      let status = { status: 'Ordered' };
      let opts = { where, limit: 1000 };
      let batch;

      /* Update event progress. Since master and inner carton runs in
         parallel, get progress again in each iteration. */
      do {
        let event = await this.events.get(eventId);
        batch = await this._update(status, opts, { eventId: event.id });
        event.progress += batch.length;
        await this.events.update(event.id, event.progress,
          `Reactivating units... ${event.progress}/${event.max}.`);
        items = items.concat(batch);
      } while (batch.length === 1000);

      return items;
    }, transaction);
  }

  async stock(id, type, eventId, transaction) {
    const Op = db.Sequelize.Op;
    let where = { status: { [Op.ne]: 'In Stock' }};
    if (type === 'customer') where.customerOrderId = id;
    else if (type === 'factory') where.factoryOrderId = id;
    else where.id = id;
    let opts = { where, limit: 1000 };

    let event;
    if (!eventId) {
      const item = await this.get(id);
      event = await this.events.create("Stock Items", 1, 
        this.name, item.serial);
    }

    let items = [];
    return this.transaction(async (t) => {
      /* Update event progress. Since master and inner carton runs in
         parallel, get progress again in each iteration. */
      let batch;
      do {
        if (eventId) event = await this.events.get(eventId);  
        batch = await this._update({ status: 'In Stock' }, opts,
          { eventId: event.id });
        event.progress += batch.length;
        await this.events.update(event.id, event.progress,
          `Stocking units... ${event.progress}/${event.max}.`);
        items = items.concat(batch);
      } while (batch.length === 1000);
      return items;
    }, transaction);
  }

  /* Alias for stock. */
  async use(id) {
    return this.stock(id);
  }

  async ship(customerOrderId, itemId, eventId, transaction) {
    return this.transaction(async (t) => {
      let items = [];
      let event = await this.events.get(eventId);
      let query = { status: 'Shipped', customerOrderId };
      let opts = { where: { id: itemId }, limit: 1 };
      let batch;

      /* Update event progress. Since master and inner carton runs in
         parallel, get progress again in each iteration. */
      do {
        batch = await this._update(query, opts, { eventId: event.id });
        event.progress += 1;
        await this.events.update(event.id, event.progress,
          `Shipping units... ${event.progress}/${event.max}.`);
        items = items.concat(batch);
      } while (batch.length > 0)
      return items;
    }, transaction);
  }

  async reship(customerOrderId, eventId, transaction) {
    return this.transaction(async (t) => {
      let items = [];
      let event = await this.events.get(eventId);
      let query = { status: 'Shipped' };
      let opts = { 
        where: { customerOrderId, status: 'In Stock' }, 
        limit: 100 
      };
      let batch;

      /* Update event progress. Since master and inner carton runs in
         parallel, get progress again in each iteration. */
      do {
        batch = await this._update(query, opts, { eventId: event.id });
        event.progress += batch.length;
        await this.events.update(event.id, event.progress,
          `Reshipping units... ${event.progress}/${event.max}.`);
        items = items.concat(batch);
      } while (batch.length === 100);
      return items;
    }, transaction);
  }

  async cancel(id, bulk, eventId, transaction) {
    const Op = db.Sequelize.Op;
    let query = { status: 'Cancelled' };
    let where = { status: { [Op.ne]: 'Cancelled' } };
    if (bulk) where.factoryOrderId = id;
    else where.id = id;
    let opts = { where, limit: 1000 };

    return this.transaction(async (t) => {
      let items = [];
      let batch;

      /* Update event progress. Since master and inner carton runs in
         parallel, get progress again in each iteration. */
      do {
        let event = await this.events.get(eventId);
        batch = await this._update(query, opts, { eventId: event.id });
        event.progress += batch.length;
        await this.events.update(event.id, event.progress,
          `Cancelling units... ${event.progress}/${event.max}.`);
        items = items.concat(batch);
      } while (batch.length === 1000);
      return items;
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