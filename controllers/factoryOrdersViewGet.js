const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const FactoryOrders = require('../services/factoryOrder');
const organizeQuery = require('../middleware/organizeQuery');

/* Get information to populate form to view existing factory orders. */
module.exports = [

  /* Validate querystring parameters passed to req.query. */
  query('page').optional().trim()
    .isInt({ min: 1 }).withMessage("Invalid page."),

  query('sort').optional().trim()
    .isAlpha().withMessage("Sort column must be alphabetical."),

  query('desc').optional().trim()
    .isBoolean().withMessage("Sort must be ascending or descending."),

  sanitizeQuery('page').trim().escape().stripLow().toInt(),
  sanitizeQuery('sort').trim().escape().stripLow(),
  sanitizeQuery('desc').trim().escape().stripLow(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let err = new Error(errors.array()[0].msg);
      return next(err);
    }
    return next();
  },

  /* Convert all querystring parameters to right format to query
     database and display. */
  organizeQuery(new FactoryOrders(), 20, ['ordered', 'arrival']),

  async (req, res, next) => {
    res.locals.css = ['listView.css'];
    res.locals.title = 'Factory Orders';
    res.locals.columns = 9;
    /* Path for AJAX requests. */
    res.locals.modelName = 'factory_orders/view';
    /* Form only displays past data, doesn't add new data. */
    res.locals.listOnly = true;
    /* Add action to print QR templates. */
    res.locals.printQr = true;
    /* Allow expansion to see details. */
    res.locals.expand = true;
    /* Add action to receive shipments. */
    res.locals.stock = true;
    return res.render('listView');
  }
];
