const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const CustomerOrders = require('../services/customerOrder');

/* Get the necessary information to populate details. */
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

  /* Retrieve all the items attached to a particular customer order. */
  async (req, res, next) => {
    const id = req.params.id;
    const orders = new CustomerOrders();
    let details = await orders.getDetails(id);
    for (let i = 0; i < details.length; i++) {
      details[i].created = new Date(details[i].created).toISOString();
    }
    return res.json({ details });
  }
];