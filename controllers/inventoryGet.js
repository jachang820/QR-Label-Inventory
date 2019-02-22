const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const Items = require('../services/item');

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

  async (req, res, next) => {
    const items = new Items();
    res.locals.page = req.query.page || 1;
    res.locals.sort = req.query.sort || null;
    res.locals.desc = req.query.desc === "true";

    res.locals.listOnly = true;
    res.locals.modelName = 'inventory';
    res.locals.columns = 12;
    
    res.locals.list = await items.getListView(
      null,
      res.locals.page,
      res.locals.sort,
      res.locals.desc
    );
    
    if (res.locals.list.length < 51) res.locals.last = true;
    else res.locals.list.pop();

    res.locals.types = await items.getSchema();

    return res.render('listView');
  }
];
