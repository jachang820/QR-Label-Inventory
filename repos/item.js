const BaseRepo = require('./base');
const db = require('../models');

class ItemRepo extends BaseRepo {

  constructor(exclude = []) {
    super(db.Item);

    exclude.push('item');
    console.log('ITEM: ' + exclude);
    this.assoc = {};
    if (!exclude.includes('sku')) {
      const SkuRepo = require('./sku');
      this.assoc.sku = new SkuRepo(exclude);
    }
    if (!exclude.includes('innerCarton')) {
      const InnerCartonRepo = require('./innerCarton');
      this.assoc.innerCarton = new InnerCartonRepo(exclude);
    }

    this.defaultOrder = [
      ['hidden', 'DESC NULLS FIRST'],
      ['status', 'ASC'],
      ['customerOrderId', 'DESC']
    ];
  }

  async list(by, page = 1, order, desc) {
    const offset = (page - 1) * 50;
    const query = `
      SELECT
        serial, status, created, 
        "CustomerOrder".serial AS "CustomerSerial"
      FROM "Item"
        LEFT JOIN "CustomerOrder" ON "customerOrderId" = "CustomerOrder".id
      LIMIT 50 OFFSET ${offset}
    `
    const direction = desc ? 'DESC' : 'ASC';

    if (!by) by = {};
    order = order ? [[order, direction]] : this.defaultOrder;
    return this._list({
      where: by,
      order,
      attributes: { exclude: ['id'] },
      limit: 50,
      offset: (page - 1) * 50 
    }); 
  }

  async expandData(customerOrderId) {
    return this._list({
      where: { customerOrderId: customerOrderId },
      order: [['serial', 'ASC']],
      attributes: [
        'serial', 
        'status', 
        [db.sequelize.literal(`UPPER(sku)`), 'sku'], 
        'created', 
        [db.sequelize.literal(`COALESCE("FactoryOrder".serial, '')`), 
          'factoryOrderId']
      ],
      include: [{
        model: db.FactoryOrder,
        attributes: []
      }],
      offset: -1
    }); 
  }

  async get(serial) {
    // Not sure how to implement this yet.
  }

  /* Cartons is a list in the format
     [...{carton: {sku, innerId, masterId, factoryOrderId}, quantity}] */
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

  async order(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'ordered' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  async stock(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'in stock' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  async ship(by, orderId, transaction) {
    return this.transaction(async (t) => {
      return this._update({
        status: 'shipped',
        customerOrderId: orderId
      }, { 
        paranoid: false, 
        where: by
      });
    }, transaction);
  }

  async cancel(by, transaction) {
    return this.transaction(async (t) => {
      return this._update({ status: 'cancelled' },
                          { paranoid: false, 
                            where: by }
      );
    }, transaction);
  }

  describe() { return this._describe(['id']); }

};

module.exports = ItemRepo;