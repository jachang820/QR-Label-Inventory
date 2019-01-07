const { body, validationResult } = require('express-validator/check');
const setupAxios = require('../../helpers/setupAxios');

const validateProperty = (req, property, validTest) => {
  let rowsWithErrors = [];
  const itemCount = req.body.count;

  for (let i = 1; i <= itemCount; i++) {
    if (!validTest(req.body[`${property}${i}`])) {
      rowsWithErrors.push(i);
    }
  }

  if (rowsWithErrors.length > 0) {
    throw new Error(`Invalid ${property} on rows: ${rowsWithErrors.join(', ')}`);
  } else {
    return true;
  }
}

module.exports = [
  body('count').isNumeric().withMessage('Count must be a number.'),

  // Consolidate colors in database.
  async (req, res, next) => {
    const axios = setupAxios();
    const colorsRes = await axios.get('/colors');
    req.body.colors = colorsRes.data;
    return next();
  },

  // Consolidate sizes in database.
  async (req, res, next) => {
    const axios = setupAxios();
    const sizesRes = await axios.get('/sizes');
    req.body.sizes = sizesRes.data;
    return next();
  },

  // Validate color for each line.
  body('colors').custom((colors, { req }) => {
    const colorNames = req.body.colors.map(color => color.name);
    const validColor = function(color) {
      return colorNames.includes(color);
    }
    return validateProperty(req, 'color', validColor);
  }),

  // Validate size for each line.
  body('sizes').custom((sizes, { req }) => {
    const sizeNames = req.body.sizes.map(size => size.name);
    const validSize = function(size) {
      return sizeNames.includes(size);
    }
    return validateProperty(req, 'size', validSize);
  }),

  body().custom((body, { req }) => {
    const validQuantity = function(quantity) {
      return Number.isInteger(parseInt(quantity)) && quantity > 0;
    }
    return validateProperty(req, 'quantity', validQuantity);
  }),

  // Organize line items into object.
  (req, res, next) => {
    const itemCount = req.body.count;
    const sizes = req.body.sizes;
    res.locals.items = [];
    for (let i = 1; i <= itemCount; i++) {

      let sizeIndex;
      for (let j = 0; j < sizes.length; j++) {
        if (sizes[j].name === req.body[`size${i}`]) {
          sizeIndex = j;
        }
      }

      res.locals.items.push({
        color: req.body[`color${i}`],
        size: req.body[`size${i}`],
        quantity: parseInt(req.body[`quantity${i}`]),
        outerSize: sizes[sizeIndex].outerSize,
        innerSize: sizes[sizeIndex].innerSize
      });
    }
    return next();
  },

  // Handle errors.
  async (req, res, next) => {
    const axios = setupAxios();
    const colors = req.body.colors;
    const sizes = req.body.sizes;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let factorOrdersRes;
      try {
        factoryOrdersRes = await axios.get('/factory_orders');
      } catch (err) {
        return next(err);
      }
      const factoryOrders = factoryOrdersRes.data;

      return res.render('orders', { factoryOrders, colors, sizes, 
                                    errors: errors.array() });
    }
    return next();
  },

  // Create factory order.
  async (req, res, next) => {
    const axios = setupAxios();
    const label = req.body.label;
    const notes = req.body.notes;
    let factoryOrdersRes;
    try {
      factoryOrdersRes = await axios.post('/factory_orders', { label, notes });
    } catch (err) {
      return next(err);
    }
    res.locals.orderId = factoryOrdersRes.data.id;
    return next();
  },

  // Create bulk items.
  async (req, res, next) => {
    const axios = setupAxios();
    try {
      await axios.post('/items/bulk', { items: res.locals.items,
                                        orderId: res.locals.orderId });
    } catch(err) {
      return next(err);
    }
    res.redirect(`/orders/${res.locals.orderId}`);
  }
];

