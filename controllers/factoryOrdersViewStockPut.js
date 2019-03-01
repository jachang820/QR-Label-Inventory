const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const FactoryOrders = require('../services/factoryOrder');

/* Receive order to mark it as In Stock. */
module.exports = [

  /* Validate id. */
  param('id').isInt({ min: 1 }).withMessage("Invalid id."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeParam('id').trim().escape().stripLow().toInt(),

  /* Handle errors. */
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Stock orders to move it from Ordered to In Stock status. */
  async (req, res, next) => {
    const orders = new FactoryOrders();
    
    try {
      await orders.stock(req.params.id);
      return res.json();

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }
];