const { query, validationResult } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Get the necessary information to populate form. */
module.exports = (type) => {

  const types = `${type}s`;
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

    async (req, res, next) => {
  		res.locals.page = req.query.page || 1;
      res.locals.sort = req.query.sort || null;
      res.locals.desc = req.query.desc === "true";

      res.locals.list = await styles.getListView(
        res.locals.page,
        res.locals.sort,
        res.locals.desc
      );
      if (res.locals.list.length < 21) res.locals.last = true;
    	else res.locals.list.pop();
      res.locals.types = await styles.getSchema();
      return res.render('listView');
    }
  ];
};

  