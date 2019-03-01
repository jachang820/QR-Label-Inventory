const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const Items = require('../services/item');

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

  /* Cancel items or move it back In Stock. */
  async (req, res, next) => {
    const items = new Items();
    try {
      await items.changeState(req.params.id);
      return res.json();

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }
];