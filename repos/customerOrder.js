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
      ['hidden', 'ASC'],
      ['shipped', 'DESC'],
      ['serial', 'DESC']
    ];
  }

  async list(page = 1, order, desc, filter) {
    /* Page is not an integer. */
    if (isNaN(parseInt(page))) {
      this._handleErrors(new Error("Invalid page."), 
        { critical: true });
    }

    const columns = Object.keys(this._describe(['id']));

    let sort;
    if (!order || !columns.includes(order)) {
      sort = this.defaultOrder;

    /* Sort order is not an array. */
    } else if (!order.match(/^[a-zA-Z]+$/)) {
      this._handleErrors(new Error("Invalid sort."), 
        { critical: true });
    
    } else {
      const direction = desc ? 'DESC' : 'ASC';
      sort = [[order, direction]];
    }

    let offset = '';
    if (page > 0) {
      offset = `LIMIT 21 OFFSET ${(page - 1) * 20}`;
    }
    const where = 
      CustomerOrderRepo.buildFilterString(filter, 'CustomerOrder');

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
        COALESCE("CustomerOrder".shipped::text, '') AS shipped,
        "CustomerOrder".hidden,
        COUNT("Item".id) AS count
      FROM "CustomerOrder"
        LEFT JOIN "Item" ON "CustomerOrder".id = "Item"."customerOrderId"
      ${where}
      GROUP BY "CustomerOrder".id
      ORDER BY ${buildOrder(sort)}
      ${offset}
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
      offset: (page - 1) * 20,
      where: { hidden: true }
    };
    return this._list(opts);
  }

  async get(id) {
    /* Note: Sequelize automatically pluralizes "Item" and there is no way
       around it. */
    return this._get({
      where: { id },
      group: [db.sequelize.col("CustomerOrder.id")],
      attributes: { 
        include: [
          [db.sequelize.literal(`COALESCE(shipped::text , '')`), 'shipped'],
          [db.sequelize.literal(`COUNT("Items".id)::integer`), 'count']
        ]
      },
      include: [{
        model: db.Item,
        attributes: []
      }]
    });
  }

  async expand(id) {
    return this.assoc.item.expandData(id);
  }

  /* 'items' is a list of item ids. */
  async create(serial, type, notes, items, transaction) {
    /* Get number of items to update event. */
      const count = items.length;
      let event = this.events.create("Create Customer Order", count,
        this.name, serial);
      let itemList = [];

    if (typeof serial === 'string' && serial.startsWith('C')) {
      this._handleErrors(
        new Error("Order ID cannot start with 'C'."),
        { eventId: event.id }
      );
    }

    return this.transaction(async (t) => {
      let customerOrder = await this._create({ serial, type, notes },
        { eventId: event.id });

      for (let i = 0; i < items.length; i++) {
        const item = await this.assoc.item.ship(
          customerOrder.id, items[i], event.id, t);
        itemList.push(item);
      }
      customerOrder.items = itemList;
      
      await this.events.done(event.id);
      return customerOrder;
    }, transaction);
  }

  async update(serial, notes) {
    return this._update({ notes: notes }, {
      where: { serial }
    });
  }

  async use(id, transaction) {
    /* Get number of items to update event. */
    const count = await this.assoc.item.count();
    let order = await this.get(id);
    const event = await this.events.create("Reship Customer Order", 
      count, this.name, order.serial);


    return this.transaction(async (t) => {
      order = await this._use({ where: {id} }, true,
        { eventId: event.id });
      await this.assoc.item.reship(order[0].id, event.id, transaction);

      await this.events.done(event.id);
      return order;
    }, transaction);
  }

  async hide(id, transaction) {
    /* Get number of items to update event. */
    const count = await this.assoc.item.count();
    let order = await this.get(id);
    const event = await this.events.create("Cancel Customer Order", 
      count, this.name, order.serial);

    return this.transaction(async (t) => {
      order = await this._delete({ where: {id} }, false);
      await this.assoc.item.stock(order.id, 'customer', 
        event.id, transaction);

      await this.events.done(event.id);
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

  types() {
    return this.Model.rawAttributes.type.values;
  }
};

module.exports = CustomerOrderRepo;
