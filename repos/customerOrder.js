const BaseRepo = require('./base');
const ItemRepo = require('./masterCarton');
const { CustomerOrder } = require('../models');

class CustomerOrderRepo extends BaseRepo {

  constructor(exclude = []) {
    super(CustomerOrder);

    exclude.push('customerOrder');
    this.assoc = {};
    if (!exclude.includes('item'))
      this.assoc.item = new ItemRepo(exclude);
  }

  async list(by, page = 0, limit = 20) {
    let opts = { where: by, page: page, limit: limit, 
                 order: [['shipped', 'DESC']], 
                 paranoid : false };
    return this._list(opts);
  }

  async listActive(by, page = 0, limit = 20) {
    let opts = { where: by, page: page, limit: limit, 
                 order: [['shipped', 'DESC']]};
    return this._list(opts);
  }

  async get(serial) {
    return this._get({
      where: { serial },
      attributes: { exclude: ['id', 'hidden'] },
      include: [{ 
        model: Item,
        attributes: { exclude: ['id'] },
        order: [['serial', 'ASC']]
      }],
      paranoid: false
    });
  }

  async create(serial, type, notes, items, transaction) {
    return this.transaction(async (t) => {
      const customerOrder = await this._create({ serial, type, notes });

      for (let i = 0; i < items.length; i++) {
        await this.assoc.item.ship({
          customerOrderId: items[i]
        }, customerOrder.id, t);
      }
      
      return customerOrder;
    }, transaction);
  }

  async update(serial, notes) {
    return this._update({ notes: notes }, {
      where: { serial }
    });
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._use({ where: by }, true);
      const item = await this.assoc.item.ship({
        customerOrderId: order.id
      }, order.id, transaction);
      return order;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._delete({ where: by }, false);
      const item = await this.assoc.item.stock({
        customerOrderId: order.id
      }, transaction);
      return order;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = FactoryOrderRepo;
