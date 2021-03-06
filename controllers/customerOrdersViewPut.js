const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const CustomerOrders = require('../services/customerOrder');

/* Update status or return error. */
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

  /* Hide or re-order. */
  async (req, res, next) => {
    const orders = new CustomerOrders();
    
    try {
      await orders.changeState(req.params.id);
      return res.json();

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }
];