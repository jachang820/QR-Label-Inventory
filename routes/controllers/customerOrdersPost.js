const uuid = require('uuid/v4');
const { body, validationResult } = require('express-validator/check');
const setupAxios = require('../../helpers/setupAxios');
const validateProperty = require('../../helpers/validateOrderProperty');
const arrParser = require('../../middleware/arrParser');

module.exports = [
  /* Convert array form to object. */
  arrParser,

  /* Makes sure hidden iterator field has not been tempered with. */
  body('count').isNumeric().withMessage('Count must be a number.')
               .isInt({ min: 1 }).withMessage('Count must be positive.'),

  /* Consolidate SKUs in database. */
  async (req, res, next) => {
    const axios = setupAxios();
    const skus = await axios.get('/skus');
    req.body.skus = skus.data;
    return next();
  },

  /* Consolidate sizes in database. */
  async (req, res, next) => {
    const axios = setupAxios();
    const sizes = await axios.get('/sizes');
    req.body.sizes = sizes.data;
    return next();
  },

  /* Validate SKU for each line. Formats SKU at the same time. */
  body().custom((_, { req }) => {
    const skus = req.body.skus.map(sku => sku.id);
    const validSKU = (body, i) => {
      let item = body.items[i];
      if (item.sku === undefined || typeof item.sku !== 'string') {
        return false;
      }
      item.sku = item.sku.split(' -- ')[0];

      return skus.includes(item.sku);
    };
    return validateProperty(req, 'sku', validSKU);
  }),

  /* Validate QR code for each line. Test if QR is well-formed. */
  body().custom((_, { req }) => {
    const regex = /http:\/\/[\w\/\.]+\/([a-zA-Z0-9]*)/;
    const validQR = (body, i) => {
      const match = body.items[i].qrcode.match(regex);
      if (!match) {
        body.items[i].id = null;
        return false;
      }

      body.items[i].qrcode = body.items[i].id;
      body.items[i].id = match[1];
      return true;
    };

    return validateProperty(req, 'id', validQR);
  }),

  // Check if ID exists.
  body().custom( async (_, { req }) => {
    const axios = setupAxios();
    const itemCount = req.body.count;
    let rowsWithErrors = [];
    let usedIds = [];

    for (let i = 0; i < itemCount; i++) {
      const id = req.body.items[i].id;
      if (id !== null) {
        let item;
        try {
          item = await axios.get(`/items/${id}`);
        } catch (err) {
          console.log(err);
          throw err;
        }
        if (item.data !== null || usedIds.includes(id)) {
          rowsWithErrors.push(i);
        }
        usedIds.push(id);
      }
    }

    if (rowsWithErrors.length > 0) {
      const err = `Ids already exist on rows: ${rowsWithErrors.join(', ')}`;
      throw new Error(err);
    }
    return true;
  }),

  // Handle errors.
  async (req, res, next) => {
    const axios = setupAxios();
    const skus = req.body.skus;

    const errors = validationResult(req);
    let customerOrders;
    if (!errors.isEmpty()) {
      try {
        customerOrders = await axios.get('/customer_orders');
      } catch (err) { 
        return next(err) 
      }

      return res.render('customer_orders', { 
        orders: customerOrders.data, 
        skus: skus, 
        errors: errors.array() 
      });
    }
    return next();
  },

  // Create customer order.
  async (req, res, next) => {
    const axios = setupAxios();
    let customerOrders;
    try {
      customerOrders = await axios.post('/customer_orders', {
        label: req.body.label,
        notes: req.body.notes
      });
    } catch (err) {
      return next(err);
    }
    res.locals.orderId = customerOrders.data.id;
    return next();
  },

  // Create customer order items.
  async (req, res, next) => {
    const axios = setupAxios();
    const itemCount = req.body.count;
    const orderId = res.locals.orderId;

    for (let i = 0; i < itemCount; i++) {
      try {
        await axios.post('/items', {
          id: req.body.items[i].id,
          status: 'Shipped',
          SKUId: req.body.items[i].sku,
          CustomerOrderId: orderId,
          qrcode: req.body.items[i].qrcode
        });
      } catch(err) {
        return next(err);
      }
    }
    res.redirect(`/customer_orders/${orderId}`);
  }
]

