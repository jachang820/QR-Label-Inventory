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

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['arrival', 'DESC NULLS FIRST'],
      ['id', 'DESC']
    ];

  }

  async list(page = 1, order, desc, filter) {
    /* Page is not an integer. */
    if (isNaN(parseInt(page))) {
      FactoryOrderRepo._handleErrors(new Error("Invalid page."),
        null, true);
    }

    const columns = Object.keys(this._describe(['id']));

    let sort;
    if (!order || !columns.includes(order)) {
      sort = this.defaultOrder;

    /* Sort order is not an array. */
    } else if (!order.match(/^[a-zA-Z]+$/)) {
      FactoryOrderRepo._handleErrors(new Error("Invalid sort."),
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
    if (isNaN(parseInt(id))) {
      FactoryOrderRepo._handleErrors(new Error("Invalid id."),
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
     [...{sku, quantity}] */
  async create(serial, notes, order, transaction) {
    if (typeof serial === 'string' && serial.startsWith('F')) {
      FactoryOrderRepo._handleErrors(
        new Error("Order ID cannot start with 'F'.")
      );
    }

    let skusList = order.map(e => e.sku);
    skusList = [...new Set(skusList)];

    const skus = await this.assoc.sku.listSize(1, null, null, {
      id: { [Op.or]: skusList }
    });

    let skuDict = {};
    for (let i = 0; i < skus.length; i++) {
      skuDict[skus[i].id] = {
        innerSize: skus[i].innerSize,
        masterSize: skus[i].masterSize
      };
    }

    return this.transaction(async (t) => {
      const factoryOrder = await this._create({ serial, notes });

      let masterList = [];
      for (let i = 0; i < order.length; i++) {
        const carton = {
          sku: order[i].sku,
          factoryOrderId: factoryOrder.id 
        };

        const sku = skuDict[carton.sku];

        masterList.push({
          carton: carton,
          quantity: order[i].master,
          innerSize: sku.innerSize,
          masterSize: sku.masterSize
        });
      }

      await this.assoc.masterCarton.create(masterList, t);

      for (let i = 0; i < skus.length; i++) {
        await this.assoc.sku.use(skus[i].id);
      }

      delete factoryOrder.id;
      return factoryOrder;
    }, transaction);
  }

  async stock(id, transaction) {
    return this.transaction(async (t) => {
      const arrival = new Date();
      let order = await this._update({ arrival }, {
        where: { id }
      });
      const items = await this.assoc.masterCarton.stock(
        id, 'factory', t);
      delete order[0].id
      return order[0];
    }, transaction);
  }

  async use(id, transaction) {
    return this.transaction(async (t) => {
      let order = await this._use({
        where: { id }
      }, true);
      const master = await this.assoc.masterCarton.use(id, t);
      delete order[0].id;
      return order[0];
    }, transaction);
  }

  async hide(id, transaction) {
    return this.transaction(async (t) => {
      let order = await this._delete({ 
        where: { id }
      }, false);
      if (order.arrival) {
        FactoryOrderRepo._handleErrors(
          new Error("Received orders cannot be deleted."),
          null, true
        );
      }
      
      const master = await this.assoc.masterCarton.hide(id, t);
      delete order.id;
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