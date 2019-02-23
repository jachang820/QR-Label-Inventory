const BaseService = require('./base');
const ItemRepo = require('../repos/item');

class Items extends BaseService {

  constructor() {
    super(ItemRepo);
  }

  async getListView(page = 1, order, desc, filter) {
    if (filter.serial) {
      const labels = await this.repo.associate.label.listActive(0);
      filter.serial = this._matchLabelURLs(qrcode, labels);
    }
    return this._getListView(page, order, desc, filter, 
      Items._addListStatus);
  }

  async getSchema() {
    let schema = await this._getSchema();
    schema.serial.alias = 'Unit';
    schema.sku.alias = 'SKU';
    schema.innerId.alias = 'Inner';
    schema.masterId.alias = 'Master';
    schema.factoryOrderId.alias = 'Factory Order';
    schema.customerOrderId.alias = 'Customer Order';
    schema.serial.explanation = "Item unit serial number.";
    schema.innerId.explanation = "Inner carton serial number.";
    schema.masterId.explanation = "Master carton serial number.";
    schema.factoryOrderId.explanation = "Factory order serial number.";
    schema.customerOrderId.explanation = "Customer order serial number.";
    return schema;
  }

  async get(id) {
    return this._get(id, Items._addListStatus);
  }

  async changeState(id) {
    const item = await this.get(id);
    return this._changeState(item, id);
  }

  /* 'items' is in format of [...{qrcode, sku, quantity}] */
  async add(items) {
    const labels = await this.repo.associate.label.listActive(0);
    let cartons = [];
    for (let i = 0; i < items.length; i++) {
      let id = this._matchLabelURLs(items[i].serial, labels);
      items[i].status = "In Stock";
      delete items[i].quantity;
      cartons.push({ carton: items[i], quantity: 1 });
    }
    return this.repo.create(cartons);
  }

  /* 'qrcode' could be QR code or ID. */
  async getStock(qrcode) {
    const labels = await this.repo.associate.label.listActive(0);
    let id = this._matchLabelURLs(qrcode, labels);
    return this.repo.getStock(id);
  }

  /* Compares scanned QR code against each label pattern to
   determine if format is matched.
   qrcode: STRING -- scanned url + id text
   labels: OBJECT -- returned from GET Labels call 

   RETURNS ID if prefix and style matches, otherwise null.
   Note that ID might not be valid even if URL matches. */
  _matchLabelURLs(qrcode, labels) {
    if (typeof qrcode !== 'string') return qrcode;

    for (let i = 0; i < labels.length; i++) {
      let prefix = labels[i].prefix;
      const style = labels[i].style;

      /* QR code should start with one of the prefixes. */
      if (!qrcode.startsWith(prefix)) {
        continue;
      }

      const suffix = qrcode.slice(prefix.length);

      /* ID is the next term in the path, or the remaining part of
         last term. */
      if (style === 'Path') {
        return suffix.split('/')[0];

      /* ID is in the querystring, with key='id'. */
      } else {
        /* Split suffix into path and querystring. */
        const parts = suffix.split('?');

        /* Querystring delimited by exactly one '?'. */
        if (parts.length === 2) {
          const querystring = parts[1];

          /* Split querystring into key/value pairs. */
          const pairs = querystring.split('&');

          /* Look for value with key='id'. */
          for (let j = 0; j < pairs.length; j++) {
            const pair = pairs[j].split('=');
            if (pair.length === 2 && pair[0] === 'id') { 
              if (pair[1].length > 0 && pair[1].length <= 8) {
                return pair[1];
              }
            }
          }
        }
      }
    }
    return qrcode;
  };

  async getDetails(id) {
    return this.repo.expand(id);
  }

  static _addListStatus(list) {
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].status === 'In Stock') list[i].state = 'used';
      else list[i].state = 'eternal';
      delete list[i].hidden;
    }
    return list;
  }

};

module.exports = Items;