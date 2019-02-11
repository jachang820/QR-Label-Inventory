const BaseRepo = require('./base');
const MasterCartonRepo = require('./masterCarton');
const SkuRepo = require('./sku');
const db = require('../models');
const Op = db.Sequelize.Op;

class FactoryOrderRepo extends BaseRepo {

  constructor(exclude = []) {
    super(db.FactoryOrder);

    exclude.push('factoryOrder');
    this.assoc = {};
    if (!exclude.includes('sku'))
      this.assoc.sku = new SkuRepo(exclude);
    if (!exclude.includes('masterCarton'))
      this.assoc.masterCarton = new MasterCartonRepo(exclude);
  }

  async list() {
    const aggregate = (column) => {
      return `(
        SELECT COALESCE(SUM(line_item."${column}"), 0)
        FROM line_item
        WHERE "FactoryOrder".id = line_item."factoryOrderId"
      ) AS "${column}"`;
    };

    let query = `
      WITH line_item AS (
        SELECT serial, "factoryOrderId",
               COUNT("MasterCarton".id) AS "masterCartons",
               SUM("Size"."masterSize") AS "innerCartons",
               SUM("Size"."innerSize" * "Size"."masterSize") AS count
        FROM "MasterCarton"
          INNER JOIN "Sku" ON "MasterCarton".sku = "Sku".id 
          INNER JOIN "Size" ON "Sku".size = "Size".name
        GROUP BY "MasterCarton"."factoryOrderId", "MasterCarton".serial
      ) 
      SELECT 
        "FactoryOrder".id AS "clickId",
        "FactoryOrder".serial,
        "FactoryOrder".notes,
        "FactoryOrder".arrival,
        "FactoryOrder".ordered,
        "FactoryOrder".hidden, 
        ${aggregate('masterCartons')},
        ${aggregate('innerCartons')},
        ${aggregate('count')}
      FROM "FactoryOrder"
      GROUP BY "FactoryOrder".id
      ORDER BY ordered DESC, "FactoryOrder".serial ASC
      `.replace(/\s+/g, ' ').trim();

    const orders = await db.sequelize.query(query);
    this.cache.list = orders;

    if (!orders[0]) return [];
    return orders[0]; 
  }

  async get(id) {
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
          "Sku".size, 
          "Sku".color,
          "Size".abbrev AS "sizeShort",
          "Color".abbrev AS "colorShort",
          (
            SELECT JSON_AGG("inner") 
            FROM "inner" 
            WHERE "MasterCarton".id = "inner"."masterId"
          ) AS "innerCartons"
        FROM "MasterCarton"
          LEFT JOIN "Sku" ON "MasterCarton".sku = "Sku".id
          LEFT JOIN "Color" ON "Sku".color = "Color".name
          LEFT JOIN "Size" ON "Sku".size = "Size".name
        WHERE "factoryOrderId" = '${id}'
      )
      SELECT
        "FactoryOrder".serial,
        "FactoryOrder".ordered,
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
    return order[0];
  }

  async expand(id) {
    return this.assoc.masterCarton.list({ factoryOrderId: id });
  }

  /* 'order' consists of a list of objects with 
     sku and quantity (in number of master cartons).
     [...{sku, quantity}] */
  async create(serial, notes, order, transaction) {
    let skusList = order.map(e => e.sku);
    skusList = [...new Set(skusList)];

    const skus = await this.assoc.sku.listSize({
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
      delete factoryOrder.id;
      return factoryOrder;
    }, transaction);
  }

  async update(serial, label, notes) {
    return this._update({ notes }, {
      where: { serial },
      attributes: { exclude: ['id'] }
    });
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._use({ where: by }, true);
      const master = await this.assoc.masterCarton.use({
        factoryOrderId: order.id
      }, transaction);
      delete order.id;
      return order;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._delete({ where: by }, false);
      const master = await this.assoc.masterCarton.hide({
        factoryOrderId: order.id
      }, transaction);
      delete order.id;
      return order;
    }, transaction);
  }

  describe() {
    let columns = this._describe(['id']); 
    columns['masterCartons'] = { type: 'integer', optional: true };
    columns['innerCartons'] = { type: 'integer', optional: true };
    columns['unitCount'] = { type: 'integer', optional: true };
    return columns;
  }

};

module.exports = FactoryOrderRepo;