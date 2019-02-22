const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Skus = require('../services/sku');

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

  /* Validate color. */
  body('color').trim()
    .isLength({ min: 1 }).withMessage('Color not selected.'),

  /* Validate size. */
  body('size').trim()
    .isLength({ min: 1 }).withMessage('Size not selected.'),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('id').trim().escape().stripLow(),
  sanitizeBody('color').trim().escape().stripLow(),
  sanitizeBody('size').trim().escape().stripLow(),
  sanitizeBody('upc').trim().escape().stripLow(),

  /* Handle error. */
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Create new SKU in database. */
  async (req, res, next) => {
    const skus = new Skus();
    let sku;
    try {
      sku = await skus.add(
        req.body.id,
        req.body.upc,
        req.body.color,
        req.body.size
      );

      /* Return JSON. */
      return res.json({ added: sku });

    } catch(err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }
];