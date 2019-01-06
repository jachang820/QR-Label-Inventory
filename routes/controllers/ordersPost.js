const uuid = require('uuid/v4');
const { body, validationResult } = require('express-validator/check');
const setupAxios = require('../../helpers/setupAxios');

const isValidQuantity = (quantity) => {
  const quantityInt = parseInt(quantity);
  return quantity == quantityInt && quantityInt > 0;
}

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

  body().custom((body, { req }) => {
    let rowsWithErrors = [];
    let itemCount = req.body.count;

    for (let i = 1; i <= itemCount; i++) {
      if (!isValidQuantity(req.body[`quantity${i}`])) {
        rowsWithErrors.push(i);
      }
    }

    if (rowsWithErrors.length > 0) {
      throw new Error("Invalid quantity on rows: " + rowsWithErrors.join(', '));
    } else {
      return true;
    }
  }),

  async (req, res, next) => {
    try {
      const data = req.body;
      const itemCount = data.count;
      const axios = setupAxios();
      const label = data.label;
      const notes = data.notes;
      const colors = req.body.colors;
      const sizes = req.body.sizes;

      // Handle errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const factoryOrdersRes = await axios.get('/factory_orders');
        const factoryOrders = factoryOrdersRes.data;

        return res.render('orders', { factoryOrders, colors, sizes, errors: errors.array() });
      }

      // Handle request
      const factoryOrderRes = await axios.post('/factory_orders', {
        label,
        notes
      });
      const FactoryOrderId = factoryOrderRes.data.id;
      let itemsList = [];

      for (let i = 1; i <= itemCount; i++) {
        const color = data[`color${i}`];
        const size = data[`size${i}`];
        let quantity = data[`quantity${i}`];

        let sizeIndex;
        for (let j = 0; j < sizes.length; j++) {
          if (sizes[j].name === size) {
            sizeIndex = j;
          }
        }

        const outerSize = sizes[sizeIndex].outerSize;
        const innerSize = sizes[sizeIndex].innerSize;

        for (let j = 0; j < quantity; j++) {
          const outerbox = uuid();

          for (let k = 0; k < outerSize; k++) {
            const innerbox = uuid();

            for (let l = 0; l < innerSize; l++) {
              const itemId = uuid();
              let index = i * quantity * outerSize * innerSize;
              index += j * outerSize * innerSize;
              index += k * innerSize + l;
              itemsList.push({
                id: itemId,
                status: 'Ordered',
                innerbox: innerbox,
                outerbox: outerbox,
                ColorName: color,
                SizeName: size,
                FactoryOrderId: FactoryOrderId,
                qrcode: `http://www.smokebuddy.com/?id=${itemId}`
              });
            }
          }
        }
      }

      try {
        await axios.post('/items/bulk', { bulk: itemsList });
      } catch(err) {
        return next(err);
      }
      res.redirect(`/orders/${FactoryOrderId}`);
    }
    catch (err) {
      return next(err);
    }
  }
]

