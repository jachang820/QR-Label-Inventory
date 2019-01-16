const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Generates middleware lists for creating SKUs. */
module.exports = [

  /* Validate new SKU. */
  body('id').trim()
    .isLength({ min: 1 }).withMessage('SKU empty.')
    .isLength({ max: 16 }).withMessage('SKU too long.'),

  /* Validate UPC. */
  body('upc').trim()
    .isLength({ min: 12, max: 12 }).withMessage('UPC must be 12 digits.')
    .isNumeric().withMessage('UPC must be numeric.'),

  /* Get all colors. */
  getModel('colors', 'res', 'name'),

  /* Get all sizes. */
  getModel('sizes', 'res', 'name'),

  /* Get all SKUs. */
  getModel('skus', 'res', 'id'),

  /* Ensure that SKU is not in use. */
  (req, res, next) => {
    return express.Router().use(body('id').trim()
      .not().isIn(res.locals.skusId).withMessage('SKU already in use.')
    )(req, res, next);
  },

  /* Ensure selected color exists. */
  (req, res, next) => {
    return express.Router().use(body('color').trim()
      .isIn(res.locals.colorsName).withMessage('Invalid color selected.')
    )(req, res, next);
  },

  /* Ensure selected size exists. */
  (req, res, next) => {
    return express.Router().use(body('size').trim()
      .isIn(res.locals.sizesName).withMessage('Invalid size selected.')
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('id').trim().escape(),
  sanitizeBody('color').trim().escape(),
  sanitizeBody('size').trim().escape(),
  sanitizeBody('upc').trim().escape(),

  /* Handle error. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Create new SKU in database. */
  async (req, res, next) => {
    const axios = setupAxios();

    /* This is the new SKU. */
    let sku = {
      id: req.body.id,
      ColorName: req.body.color,
      SizeName: req.body.size,
      upc: req.body.upc      
    };

    let response;
    try {
      response = await axios.post('/skus', sku);
    } catch(err) {
      err.custom = 'Error adding new SKU to database.';
      return next(err);
    }
    res.locals.skus = [response.data];
    return next();
  },

  /* Get object necessary for list all. */
  prepareList('skus'),

  /* Return JSON. */
  (req, res, next) => {
    return res.json({
      added: res.locals.list[0]
    });
  }
];