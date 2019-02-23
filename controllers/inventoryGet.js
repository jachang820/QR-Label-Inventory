const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const Items = require('../services/item');
const organizeQuery = require('../middleware/organizeQuery');

/* Get the necessary information to populate form. */
module.exports = [

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

  organizeQuery(new Items(), 50),

  async (req, res, next) => {
    res.locals.listOnly = true;
    res.locals.modelName = 'inventory';
    res.locals.columns = 12;
    return res.render('listView');
  }
];
