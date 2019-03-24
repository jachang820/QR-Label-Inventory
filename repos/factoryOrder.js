const BaseRepo = require('./base');
const db = require('../models');
const Op = db.Sequelize.Op;

class FactoryOrderRepo extends BaseRepo {

  constructor(exclude = []) {
    super(db.FactoryOrder);

    exclude.push('factoryOrder');

    this.assoc = {};
    if (!exclude.includes('sku')) {
      const SkuRepo = require('./sku');
      this.assoc.sku = new SkuRepo(exclude);
    }
    if (!exclude.includes('masterCarton')) {
      const MasterCartonRepo = require('./masterCarton');
      this.assoc.masterCarton = new MasterCartonRepo(exclude);
    }
    const EventRepo = require('./event');
    this.events = new EventRepo();

    this.defaultOrder = [
      ['hidden', 'ASC'],
      ['arrival', 'DESC NULLS FIRST'],
      ['id', 'DESC']
    ];

  }

  async list(page = 1, order, desc, filter) {
    /* Page is not an integer. */
    if (isNaN(parseInt(page))) {
      this._handleErrors(new Error("Invalid page."),
        null, true);
    }

    const columns = Object.keys(this._describe(['id']));

    let sort;
    if (!order || !columns.includes(order)) {
      sort = this.defaultOrder;

    /* Sort order is not an array. */
    } else if (!order.match(/^[a-zA-Z]+$/)) {
      this._handleErrors(new Error("Invalid sort."),
        null, true);
    
    } else {
      const direction = desc ? 'DESC' : 'ASC';
      sort = [[order, direction]];
    }

    let offset = '';
    if (page > 0) {
      offset = `LIMIT 21 OFFSET ${(page - 1) * 20}`;
    }
    const where = 
      FactoryOrderRepo.buildFilterString(filter, 'FactoryOrder');
      
    const aggregate = (column) => {
      return `(
        SELECT COALESCE(SUM(line_item."${column}"), 0)
        FROM line_item
        WHERE "FactoryOrder".id = line_item."factoryOrderId"
      ) AS "${column}"`;
    };
    const buildOrder = (order) => {
      order = order.map(e => `"FactoryOrder"."${e[0]}" ${e[1]}`);
      return order.join(', ');
    };

    let query = `
      WITH line_item AS (
        SELECT serial, "factoryOrderId",
               COUNT("MasterCarton".id) AS "masterCartons",
               SUM("Size"."masterSize") AS "innerCartons",
               SUM("Size"."innerSize" * "Size"."masterSize") AS count
        FROM "MasterCarton"
          INNER JOIN "Sku" ON "MasterCarton".sku = "Sku".id 
          INNER JOIN "Size" ON "Sku"."sizeId" = "Size".id
        GROUP BY "MasterCarton"."factoryOrderId", "MasterCarton".serial
      ) 
      SELECT 
        "FactoryOrder".id AS "clickId",
        "FactoryOrder".serial,
        "FactoryOrder".notes,
        COALESCE("FactoryOrder".arrival::text, '') AS arrival,
        COALESCE("FactoryOrder".ordered::text, '') AS ordered,
        "FactoryOrder".hidden, 
        ${aggregate('masterCartons')},
        ${aggregate('innerCartons')},
        ${aggregate('count')}
      FROM "FactoryOrder"
      ${where}
      GROUP BY "FactoryOrder".id
      ORDER BY ${buildOrder(sort)}
      ${offset}
      `.replace(/\s+/g, ' ').trim();

    const orders = await db.sequelize.query(query);
    this.cache.list = orders;

    if (!orders[0]) return [];
    return orders[0]; 
  }

  async get(id) {
    return this._get({ where: { id } });
  }

  async getDepth(id) {
    if (isNaN(parseInt(id))) {
      this._handleErrors(new Error("Invalid id."),
        null, true);
    }

    let query = `
      WITH unit AS (
        SELECT "innerId", serial
        FROM "Item"
      ), "inner" AS (
        SELECT "masterId", serial,
          (
            SELECT JSON_AGG(unit) 
            FROM unit 
            WHERE "InnerCarton".id = unit."innerId"
          ) AS items
        FROM "InnerCarton"
      ), "master" AS (
        SELECT "factoryOrderId", serial, 
          "Size".name AS size, 
          "Color".name AS color,
          "Size".abbrev AS "sizeShort",
          "Color".abbrev AS "colorShort",
          (
            SELECT JSON_AGG("inner") 
            FROM "inner" 
            WHERE "MasterCarton".id = "inner"."masterId"
          ) AS "innerCartons"
        FROM "MasterCarton"
          LEFT JOIN "Sku" ON "MasterCarton".sku = "Sku".id
          LEFT JOIN "Color" ON "Sku"."colorId" = "Color".id
          LEFT JOIN "Size" ON "Sku"."sizeId" = "Size".id
        WHERE "factoryOrderId" = '${id}'
      )
      SELECT
        "FactoryOrder".serial,
        COALESCE("FactoryOrder".ordered::text, '') AS ordered,
        COALESCE("FactoryOrder".arrival::text, '') AS arrival,
        "FactoryOrder".hidden,
        (
          SELECT JSON_AGG(master) FROM master
        ) AS "masterCartons"
      FROM "FactoryOrder" 
      WHERE "FactoryOrder".id = '${id}'
      GROUP BY "FactoryOrder".id
      ORDER BY "FactoryOrder".serial DESC 
      LIMIT 1
    `.replace(/\s+/g, ' ').trim();
    const order = await db.sequelize.query(query);

    this.cache.get = order;
    if (!order) return null;
    return order[0][0];
  }

  async expand(id) {
    return this.assoc.masterCarton.expandData(id);
  }

  /* 'order' consists of a list of objects with 
     sku and quantity (in number of master cartons).
     [...{sku, master}] */
  async create(serial, notes, order, transaction) {
    if (typeof serial === 'string' && serial.startsWith('F')) {
      this._handleErrors(
        new Error("Order ID cannot start with 'F'.")
      );
    }
    
    /* Array of skus used in order. */
    let skusList = order.map(e => e.sku);
    skusList = [...new Set(skusList)];

    /* Inner and master carton size of skus used in order. */
    const skus = await this.assoc.sku.listSize(1, null, null, {
      id: { [Op.or]: skusList }
    });

    /* Dictionary of { id: { innerSize, masterSize } } per sku. */
    let skuDict = {};
    for (let i = 0; i < skus.length; i++) {
      skuDict[skus[i].id] = {
        innerSize: skus[i].innerSize,
        masterSize: skus[i].masterSize
      };
    }

    /* Count the number of records to create. */
    let count = 1;
    for (let i = 0; i < order.length; i++) {
      let sku = skuDict[order[i].sku];
      let numInner = sku.masterSize;
      let numUnit = numInner * sku.innerSize;
      count += order[i].master * (1 + numInner + numUnit);
    }
    count += skus.length;

    let event = await this.events.create("Create Factory Order", 
      count, this.name, serial);

    return this.transaction(async (t) => {
      /* Create factory order. */;
      const factoryOrder = await this._create({ serial, notes },
        { eventId: event.id });
      serial = factoryOrder.serial;
      this.events.setTarget(event.id, { targetId: serial });
      
      /* Create master cartons. */
      let masterList = [];
      const MasterCartonRepo = this.assoc.masterCarton;
      for (let i = 0; i < order.length; i++) {
        for (let j = 0; j < order[i].master; j++) {
          masterList.push({
            sku: order[i].sku,
            factoryOrderId: factoryOrder.id
          });
        }
      }

      const masterCartons = await MasterCartonRepo.create(
        masterList, event.id, t);
      event.progress += masterList.length;
      await this.events.update(event.id, event.progress, 
        `Created master cartons... ${masterList.length}/${masterList.length}.`);

      /* Create inner cartons. */
      let innerList = [];
      let innerCartons = [];
      const InnerCartonRepo = MasterCartonRepo.assoc.innerCarton;
      for (let i = 0; i < masterCartons.length; i++) {
        const masterSku = masterCartons[i].sku;
        const masterSize = skuDict[masterSku].masterSize;
        for (let j = 0; j < masterSize; j++) {
          innerList.push({
            sku: masterCartons[i].sku,
            masterId: masterCartons[i].id
          });
        }

        /* Update event and save results. */
        if (i % 100 === 0 || i === masterCartons.length - 1) {
          let batch;
          if (innerList.length > 0) {
            batch = await InnerCartonRepo.create(innerList, event.id, t);
            innerCartons.concat(batch);
            event.progress += batch.length;
            await this.events.update(event.id, event.progress,
              `Created inner cartons... ${batch.length}/${innerList.length}.`);
            innerList = [];
          }
        }
      }

      /* Create items. */
      let itemList = [];
      const ItemRepo = InnerCartonRepo.assoc.item;
      for (let i = 0; i < innerCartons.length; i++) {
        const innerSku = innerCartons[i].sku;
        const innerSize = skuDict[innerSku].innerSize;
        for (let j = 0; j < innerSize; j++) {
          itemList.push({
            status: 'Ordered',
            sku: innerCartons[i].sku,
            factoryOrderId: factoryOrder.id,
            masterId: innerCartons[i].masterId,
            innerId: innerCartons[i].id
          });
        }

        /* Update event and save results. */
        if (i % 100 === 0 || i === innerCartons.length - 1) {
          if (itemList.length > 0) {
            let batch = await ItemRepo.create(itemList, event.id, t);
            event.progress += batch.length;
            await this.events.update(event.id, event.progress,
              `Created units... ${batch.length}/${itemList.length}.`);
            itemList = [];
          }
        }
      }

      /* Use SKUs. */
      await this.events.update(event.id, event.progress, 
        "Use SKUs... ");
      if (this.assoc.sku) {
        for (let i = 0; i < skus.length; i++) {
          await this.assoc.sku.use(skusList[i], { eventId: event.id });
        }
      }

      delete factoryOrder.id;
      await this.events.done(event.id);
      return factoryOrder;
    }, transaction);
  }

  async stock(id, transaction) {
    const arrival = new Date();

    /* Get number of items to update event. */
    const MasterCartons = this.assoc.masterCarton;
    const InnerCartons = MasterCartons.assoc.innerCarton;
    const Items = InnerCartons.assoc.item;
    const items = ItemRepo.list(0, null, null, { factoryOrderId: id });
    const count = items.length;

    let order = await this.get(id);
    const event = await this.events.create("Mark Order Arrival", 
      count, this.name, order.serial);

    return this.transaction(async (t) => {
      order = await this._update({ arrival }, { where: { id } },
        { eventId: event.id });
      items = await Items.stock(id, 'factory', event.id, t);

      delete order[0].id
      await this.events.done(event.id);
      return order[0];
    }, transaction);
  }

  async use(id, transaction) {
    const MasterCartonRepo = this.assoc.masterCarton;
    const InnerCartonRepo = MasterCartonRepo.assoc.innerCarton;
    const ItemRepo = InnerCartonRepo.assoc.item;

    /* Get number of items to update event. */
    const items = ItemRepo.list(0, null, null, { factoryOrderId: id });
    const count = items.length;

    let order = await this.get(id);
    const event = await this.events.create("Reorder Factory Order", 
      count, this.name, order.serial);

    return this.transaction(async (t) => {
      order = await this._use({ where: { id } }, true,
        { eventId: event.id });
      await Promise.all([
        MasterCartonRepo.use(id, event.id, t),
        InnerCartonRepo.use(id, event.id, t),
        ItemRepo.order(id, event.id, t)
      ]);

      delete order[0].id;
      await this.events.done(event.id);
      return order[0];
    }, transaction);
  }

  async hide(id, transaction) {
    const MasterCartonRepo = this.assoc.masterCarton;
    const InnerCartonRepo = MasterCartonRepo.assoc.innerCarton;
    const ItemRepo = InnerCartonRepo.assoc.item;

    /* Get number of items to update event. */
    const items = ItemRepo.list(0, null, null, { factoryOrderId: id });
    const count = items.length;

    let order = await this.get(id);
    const event = await this.events.create("Cancel Factory Order", 
      count, this.name, order.serial);

    return this.transaction(async (t) => {
      order = await this._delete({ where: { id } }, false);
      if (order.arrival) {
        this._handleErrors(
          new Error("Received orders cannot be deleted."),
          { critical: true, eventId: event.id }
        );
      }
      await Promise.all([
        MasterCartonRepo.hide(id, event.id, t),
        InnerCartonRepo.hide(id, event.id, t),
        ItemRepo.cancel(id, true, event.id, t)
      ]);

      delete order.id;
      await this.events.done(event.id);
      return order;
    }, transaction);
  }

  describe() {
    let columns = this._describe(['id']); 
    columns['masterCartons'] = {
      type: 'integer', 
      unsortable: true,
      optional: true 
    };
    columns['innerCartons'] = { 
      type: 'integer', 
      unsortable: true,
      optional: true 
    };
    columns['count'] = { 
      type: 'integer', 
      unsortable: true, 
      optional: false 
    };
    return columns;
  }

};

module.exports = FactoryOrderRepo;