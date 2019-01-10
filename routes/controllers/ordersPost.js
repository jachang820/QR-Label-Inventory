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

  /* Validate quantity for each line. Makes sure quantities are integers. */
  body().custom((_, { req }) => {
    const validQuantity = (body, i) => {
      let item = body.items[i];
      item.quantity = parseInt(item.quantity);
      if (isNaN(item.quantity)) {
        return false;
      }
      return Number.isInteger(item.quantity) && item.quantity > 0;
    };
    return validateProperty(req, 'quantity', validQuantity);
  }),

  // Handle errors.
  async (req, res, next) => {
    const axios = setupAxios();
    const skus = req.body.skus;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let factorOrders;
      try {
        factoryOrders = await axios.get('/factory_orders');
      } catch (err) {
        return next(err);
      }

      return res.render('factory_orders', {
        orders: factoryOrders.data, 
        skus: skus, 
        errors: errors.array() });
    }
    return next();
  },

  // Organize line items into object.
  (req, res, next) => {
    const itemCount = req.body.count;
    const sizes = req.body.sizes;
    const skus = req.body.skus;

    for (let i = 0; i < itemCount; i++) {
      
      let size;
      let sku;

      for (let j = 0; j < skus.length; j++) {
        if (skus[j].id === req.body.items[i].sku) {
          sku = skus[j];
          break;
        }
      }

      for (let j = 0; j < sizes.length; j++) {
        if (sizes[j].name === sku.SizeName) {
          size = sizes[j];
          break
        }
      }

      req.body.items[i].outerSize = size.outerSize;
      req.body.items[i].innerSize = size.innerSize;
    }

    return next();
  },

  // Create factory order.
  async (req, res, next) => {
    const axios = setupAxios();
    let factoryOrders;
    try {
      factoryOrders = await axios.post('/factory_orders', { 
        label: req.body.label, 
        notes: req.body.notes 
      });
    } catch (err) {
      return next(err);
    }

    res.locals.orderId = factoryOrders.data.id;
    return next();
  },

  // Create bulk items.
  async (req, res, next) => {
    const axios = setupAxios();

    try {
      await axios.post('/items/bulk', { items: req.body.items,
                                        orderId: res.locals.orderId });
    } catch(err) {
      return next(err);
    }
    res.redirect(`/orders/${res.locals.orderId}`);
  }
];

