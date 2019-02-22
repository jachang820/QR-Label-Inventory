const BaseRepo = require('./base');
const db = require('../models');

class CustomerOrderRepo extends BaseRepo {

  constructor(exclude = []) {
    super(db.CustomerOrder);

    exclude.push('customerOrder');
    this.assoc = {};
    if (!exclude.includes('item')) {
      const ItemRepo = require('./item');
      this.assoc.item = new ItemRepo(exclude);
    }

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['shipped', 'DESC NULLS FIRST'],
      ['serial', 'DESC']
    ];
  }

  async list(page = 1, order, desc) {
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

    const offset = (page - 1) * 20;
    const buildOrder = (order) => {
      order = order.map(e => `"CustomerOrder"."${e[0]}" ${e[1]}`);
      return order.join(', ');
    };

    let query = `
      SELECT 
        "CustomerOrder".id AS "clickId",
        "CustomerOrder".serial,
        "CustomerOrder".type,
        "CustomerOrder".notes,
        "CustomerOrder".shipped,
        "CustomerOrder".hidden,
        COUNT("Item".id) AS count
      FROM "CustomerOrder"
        LEFT JOIN "Item" ON "CustomerOrder".id = "Item"."customerOrderId"
      GROUP BY "CustomerOrder".id
      ORDER BY ${buildOrder(sort)}
      LIMIT 21 OFFSET ${offset}
      `.replace(/\s+/g, ' ').trim();

    const orders = await db.sequelize.query(query);
    this.cache.list = orders;

    if (!orders[0]) return [];
    return orders[0]; 
  }

  async listActive(page = 1, order, desc) {
    const direction = desc ? 'DESC' : 'ASC';
    order = order ? [[order, direction]] : this.defaultOrder;
    let opts = {
      order,
      offset: (page - 1) * 20
    };
    return this._list(opts);
  }

  async get(id) {
    return this._get({
      where: { id },
      attributes: { exclude: ['id'] },
      paranoid: false
    });
  }

  async expand(id) {
    return this.assoc.item.expandData(id);
  }

  /* 'items' is a list of item ids. */
  async create(serial, type, notes, items, transaction) {
    if (typeof serial === 'string' && serial.startsWith('C')) {
      FactoryOrderRepo._handleErrors(
        new Error("Order ID cannot start with 'C'.")
      );
    }

    return this.transaction(async (t) => {
      let customerOrder = await this._create({ serial, type, notes });
      let itemList = [];

      for (let i = 0; i < items.length; i++) {
        const item = await this.assoc.item.ship(
          customerOrder.id, items[i], t);
        itemList.push(item);
      }
      customerOrder.items = itemList;
      
      return customerOrder;
    }, transaction);
  }

  async update(serial, notes) {
    return this._update({ notes: notes }, {
      where: { serial }
    });
  }

  async use(id, transaction) {
    return this.transaction(async (t) => {
      const order = await this._use({ where: {id} }, true);
      const item = await this.assoc.item.reship(order.id, transaction);
      return order;
    }, transaction);
  }

  async hide(id, transaction) {
    return this.transaction(async (t) => {
      const order = await this._delete({ where: {id} }, false);
      const item = await this.assoc.item.stock(order.id, transaction);
      return order;
    }, transaction);
  }

  describe() {
    let columns = this._describe(['id']); 
    columns['count'] = {
      type: 'integer', 
      unsortable: true,
      optional: false 
    };
    return columns;
  }
};

module.exports = CustomerOrderRepo;
