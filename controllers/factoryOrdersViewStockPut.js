const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const FactoryOrders = require('../services/factoryOrder');

/* Update status or return error. */
module.exports = [

  param('id').isInt({ min: 1 }).withMessage("Invalid id."),

  sanitizeParam('id').trim().escape().stripLow().toInt(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  async (req, res, next) => {
    const orders = new FactoryOrders();
    
    try {
      await orders.stock(req.params.id);
      return res.json();

    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        return res.json({ errors: err.errors });
      } else {
        return res.json({ errors: 'unknown'});
      }
    }
  }
];