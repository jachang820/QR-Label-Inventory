const SettingsRepo = require('./settings');
const ItemRepo = require('./masterCarton');
const { CustomerOrder } = require('../models');

class CustomerOrderRepo extends SettingsRepo {

  constructor(associate) {
    super(CustomerOrder);

    if (!associate) {
      this.assoc = {
        item: new ItemRepo(true)
      };
    }
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
      where: { id: serial },
      attributes: { exclude: ['id', 'hidden'] },
      include: [{ 
        model: Item,
        attributes: { exclude: ['id'] },
        order: [['serial', 'ASC']]
      }],
      paranoid: false
    });
  }

  async create(alias, type, notes, items, transaction) {
    return this.transaction(async (t) => {
      const customerOrder = await this._create({
        alias: alias,
        type: type,
        notes: notes
      });

      for (let i = 0; i < items.length; i++) {
        await this.assoc.item.ship({
          customerOrderId: items[i]
        }, customerOrder.serial, t);
      }
      
      return customerOrder;
    }, transaction);
  }

  async update(serial, label, notes) {
    return this._update({ notes: notes }, {
      where: { serial: serial }
    });
  }

  async use(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._use({ where: by }, true);
      const item = await this.assoc.item.ship({
        customerOrderId: order.serial
      }, order.serial, transaction);
      return order;
    }, transaction);
  }

  async hide(by, transaction) {
    return this.transaction(async (t) => {
      const order = await this._delete({ where: by }, false);
      const item = await this.assoc.item.stock({
        customerOrderId: order.serial
      }, transaction);
      return order;
    }, transaction);
  }

  describe() { return this._describe(); }

};

module.exports = FactoryOrderRepo;