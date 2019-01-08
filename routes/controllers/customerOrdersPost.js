const uuid = require('uuid/v4');
const { body, validationResult } = require('express-validator/check');
const setupAxios = require('../../helpers/setupAxios');

module.exports = [
  body('count').isNumeric().withMessage('Count must be a number.'),

  // Consolidate colors in database
  async (req, res, next) => {
    const axios = setupAxios();
    const colorsRes = await axios.get('/colors');

    req.body.colors = colorsRes.data;
    return next();
  },

  // Consolidate sizes in database
  async (req, res, next) => {
    const axios = setupAxios();
    const sizesRes = await axios.get('/sizes');

    req.body.sizes = sizesRes.data;
    return next();
  },

  body('colors').custom((colors, { req }) => {
    let rowsWithErrors = [];
    const itemCount = req.body.count;
    const colorNames = req.body.colors.map(color => color.name);

    for (let i = 1; i <= itemCount; i++) {
      if (!colorNames.includes(req.body[`color${i}`])) {
        rowsWithErrors.push(i);
      }
    }

    if (rowsWithErrors.length > 0) {
      throw new Error("Invalid color on rows: " + rowsWithErrors.join(', '));
    } else {
      return true;
    }
  }),

  body('sizes').custom((sizes, { req }) => {
    let rowsWithErrors = [];
    const itemCount = req.body.count;
    const sizeNames = req.body.sizes.map(size => size.name);

    for (let i = 1; i <= itemCount; i++) {
      if (!sizeNames.includes(req.body[`size${i}`])) {
        rowsWithErrors.push(i);
      }
    }

    if (rowsWithErrors.length > 0) {
      throw new Error("Invalid size on rows: " + rowsWithErrors.join(', '));
    } else {
      return true;
    }
  }),

  body().custom(async (body, { req }) => {
    const axios = setupAxios();

    let rowsWithErrors = [];
    let itemCount = req.body.count;

    for (let i = 1; i <= itemCount; i++) {
      const url = req.body[`item${i}`];
      const regex = /http:\/\/holoshield.net\/a\/([a-zA-Z0-9]*)/;

      const match = url.match(regex);

      if (!match) {
        rowsWithErrors.push(i);
        continue;
      }

      const itemId = match[1];
      req.body[`item${i}`] = itemId;
      let itemsRes;

      try {
        itemsRes = await axios.get(`items/${itemId}`);
      }
      catch (err) {
        throw err;
      }

      if (itemsRes.data) {
        rowsWithErrors.push(i);
      }
    }

    if (rowsWithErrors.length > 0) {
      throw new Error("Invalid item on rows: " + rowsWithErrors.join(', '));
    } else {
      return true;
    }
  }),

  async (req, res, next) => {
    const axios = setupAxios();

    const data = req.body;
    const itemCount = data.count;
    const label = data.label;
    const notes = data.notes;
    const colors = data.colors;
    const sizes = data.sizes;

    // Handle errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let customerOrdersRes;
      try {
        customerOrdersRes = await axios.get('/customer_orders');
      } catch (err) { 
        return next(err) 
      }
      const customerOrders = customerOrdersRes.data;

      return res.render('customer_orders', { customerOrders, colors, sizes, errors: errors.array() });
    }

    // Handle request
    let customerOrdersRes;
    try {
      customerOrdersRes = await axios.post('/customer_orders', {
        label,
        notes
      });
    } catch (err) {
      return next(err);
    }
    const CustomerOrderId = customerOrdersRes.data.id;

    for (let i = 1; i <= itemCount; i++) {
      const itemId = data[`item${i}`];
      const color = data[`color${i}`];
      const size = data[`size${i}`];

      try {
        await axios.post(`/items/${itemId}`, {
          id: itemId,
          status: 'Shipped',
          ColorName: color,
          SizeName: size,
          CustomerOrderId
        });
      } catch(err) {
        return next(err);
      }
    }
    res.redirect(`/customer_orders/${CustomerOrderId}`);
  }
]

