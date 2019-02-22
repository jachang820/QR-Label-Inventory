const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Items = require('../services/item');

module.exports = [

  /* Validate items. */
  body('items').trim()
    .exists().withMessage("Cannot find items.")
    .not().isEmpty().withMessage("Order must contain at least one item."),

  /* Validate serials. */
  body('items.*.serial').trim()
    .exists().withMessage("Cannot find serial.")
    .isLength({ min: 1, max: 7 }).withMessage("Serial must be 1-7 characters.")
    .not().contains(' ').withMessage("Serial cannot contain whitespace."),

  /* Validate SKUs. */
  body('items.*.sku').trim()
    .exists().withMessage("Cannot find SKUs.")
    .isString().withMessage("SKU must be a string.")
    .isLength({ min: 1, max: 16 }).withMessage("SKU must be 1-16 characters."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('items.*.serial').trim().stripLow(),
  sanitizeBody('items.*.skus').trim().escape().stripLow(),

  /* Handle errors. */
  async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array();
      const regex = /^items\[([0-9]+)\]\.([a-z]+)$/;
      for (let i = 0; i < errors.length; i++) {
        let match = errors[i].param.match(regex);
        if (match) {
          errors[i].param = `Line ${match[1]} (${match[2]})`;
        }
      }
      return res.json({ errors });
    }
    return next();
  },

  /* Create factory order and associated bulk items. */
  async (req, res, next) => {
    let items = new Items();
    let itemsList;
    try {
      itemsList = await items.add(req.body.items);
    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
    
    return res.json({ items: itemsList });
  }

];

