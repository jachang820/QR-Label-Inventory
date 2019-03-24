const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const FactoryOrders = require('../services/factoryOrder');

module.exports = [

  /* Validate items. */
  body('items').trim()
    .exists().withMessage("Cannot find items.")
    .not().isEmpty().withMessage("Order must contain at least one item."),

  /* Validate SKUs. */
  body('items.*.sku').trim()
    .exists().withMessage("Cannot find SKUs.")
    .isString().withMessage("SKU must be a string.")
    .isLength({ min: 1, max: 16}).withMessage("SKU must be 1-16 characters."),

  /* Validate master. */
  body('items.*.master').trim()
    .exists().withMessage("Cannot find quantities.")
    .isInt({ min: 1}).withMessage("Quantity must be a positive integer.")
    .isInt({ max: 1200 }).withMessage("Cannot exceed 1200 master cartons."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('serial').trim().stripLow(),
  sanitizeBody('notes').trim().stripLow(),
  sanitizeBody('items.*.skus').trim().escape().stripLow(),
  sanitizeBody('items.*.master').trim().toInt().escape().stripLow(),
  sanitizeBody('items.*.inner').trim().toInt().escape().stripLow(),
  sanitizeBody('items.*.quantity').trim().toInt().escape().stripLow(),

  /* Handle errors. */
  async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array();
      const regex = /^items\[([0-9]+)\]\.([a-z]+)$/;
      for (let i = 0; i < errors.length; i++) {
        let match = errors[i].param.match(regex);
        if (match) {
          errors[i].param = match[2];
        }
      }
      console.log(errors);
      return res.json({ errors });
    }
    return next();
  },

  /* Create factory order and associated bulk items. */
  async (req, res, next) => {
    let factoryOrders = new FactoryOrders();
    let order;

    res.writeHead(200, {
      'Connection': 'Transfer-Encoding',
      'Content-Type': 'text/json',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff'
    });
    res.flush();

    const callback = (progress, max, message) => {
      if (progress !== undefined && progress >= 0) {
        console.log(message);
        const obj = JSON.stringify({ progress, max, message });
        const text = `${obj.length}\r\n${obj}\r\n`;
        res.write(text);
        res.flush();
      } else {
        console.log("END");
        res.end();
      }
    };

    try {
      console.log("before post");
      res.write('');
      order = await factoryOrders.add(
        req.body.serial,
        req.body.notes, 
        req.body.items,
        callback 
      );
      console.log("after post");
      res.end();
    } catch (err) {
      console.log(err);
      return res.json({ errors: err.errors || 'unknown' });
    }
  }

];

