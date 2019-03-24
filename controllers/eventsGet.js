const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const Events = require('../services/event');
const organizeQuery = require('../middleware/organizeQuery');

/* Get information to populate form to view existing items. */
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
  organizeQuery(new Events(), 50, ['started', 'finished']),

  async (req, res, next) => {
    res.locals.css = ['listView.css'];
    res.locals.title = 'View Events';
    res.locals.columns = 8;
    /* Path for AJAX requests. */
    res.locals.modelName = 'events';
    /* Form only displays past data, doesn't add new data. */
    res.locals.listOnly = true;
    /* Disable update actions. */
    res.locals.noUpdate = true;
    /* Show date and time. */
    res.locals.fullDate = true;
    return res.render('listView');
  }
];
