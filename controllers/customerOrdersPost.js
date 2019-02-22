const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const CustomerOrders = require('../services/customerOrder');

module.exports = [

  /* Validate type. */
  body('type').trim()
    .exists().withMessage("Type must be selected.")
    .isIn(['retail', 'wholesale']).withMessage("Invalid type selected."),

  /* Validate notes. */
  body('notes').trim()
    .isLength({ max: 128 }).withMessage("Notes must be less than 128 characters."),

  /* Validate items. */
  body('items').trim()
    .exists().withMessage("Cannot find items.")
    .not().isEmpty().withMessage("Order must contain at least one item."),

  /* Validate ids. */
  body('items.*.id').trim()
    .exists().withMessage("Cannot find any items.")
    .isInt({ min: 1 }).withMessage("Invalid items."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('type').trim().escape().stripLow(),
  sanitizeBody('serial').trim().stripLow(),
  sanitizeBody('notes').trim().stripLow(),
  sanitizeBody('items.*.id').trim().escape().stripLow().toInt(),
  
  /* Handle errors. */
  async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array();
      const regex = /^items\[([0-9]+)\].serial$/;
      for (let i = 0; i < errors.length; i++) {
        let match = errors[i].param.match(regex);
        if (match) {
          errors[i].param = `Line ${match[1]} ID`;
        }
      }
      return res.json({ errors });
    }
    return next();
  },

  /* Create customer order and associated bulk items. */
  async (req, res, next) => {
    let customerOrder = new CustomerOrders();
    const items = req.body.items.map(e => e.id);
    let order;

    try {
      order = await customerOrder.add(
        req.body.serial,
        req.body.type,
        req.body.notes, 
        items 
      );

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
    
    return res.json({ order });
  }

];

