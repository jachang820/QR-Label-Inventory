const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const Colors = require('../services/color');
const Sizes = require('../services/size');
const organizeQuery = require('../middleware/organizeQuery');

/* Get the necessary information to populate form. */
module.exports = (type) => {

  const styles = (type === 'color') ? new Colors() : new Sizes();

  return [

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

    organizeQuery(styles),

    async (req, res, next) => {
      return res.render('listView');
    }
  ];
};

  