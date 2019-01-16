const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const setupAxios = require('../../helpers/setupAxios');
const express = require('express');
const arrParser = require('../../middleware/arrParser');
const getModel = require('../../middleware/getModel');

module.exports = [
  /* Convert array form to object. */
  arrParser,

  /* Makes sure hidden iterator field has not been tempered with. */
  body('count').isNumeric().withMessage('Count must be a number.')
               .isInt({ min: 1 }).withMessage('Count must be positive.'),

  /* Consolidate SKUs in database. */
  getModel('skus', 'req', 'id'),

  /* Consolidate sizes in database. */
  getModel('sizes', 'req'),

  /* Validate SKU. */
  (req, res, next) => {
    const skus = req.body.skusId;
    return express.Router().use(body('items.*.sku').trim()
      .exists().withMessage("Form transmission failed.")
      .isString().withMessage("SKU must be a string.")
      .isIn(skus).withMessage("SKU does not exist.")
    )(req, res, next);
  },

  /* Validate quantity. */
  (req, res, next) => {
    return express.Router().use(body('items.*.quantity').trim()
      .exists().withMessage("Form transmission failed.")
      .isInt({ min: 1 }).withMessage("Quantity must be a positive integer.")
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('count').trim().toInt().escape(),
  sanitizeBody('items.*.skus').trim().escape(),
  sanitizeBody('items.*.quantity').trim().toInt().escape(),

  /* Get all factory orders. */
  getModel('factory_orders', 'res'),

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

      return res.render('factory_orders', {
        orders: res.locals.factory_orders, 
        skus: req.body.skus, 
        errors: errors
      });
    }
    return next();
  },

  // Organize line items into object.
  (req, res, next) => {
    const itemCount = req.body.count;
    const sizes = req.body.sizes;
    const skus = req.body.skus;

    for (let i = 0; i < itemCount; i++) {
      
      let size;
      let sku;

      /* Get SKU from database corresponding to current line item. */
      for (let j = 0; j < skus.length; j++) {
        if (skus[j].id === req.body.items[i].sku) {
          sku = skus[j];
          break;
        }
      }

      /* Get size from database corresponding to current SKU. */
      for (let j = 0; j < sizes.length; j++) {
        if (sizes[j].name === sku.SizeName) {
          size = sizes[j];
          break;
        }
      }

      /* Add packaging properties to items object. */
      req.body.items[i].outerSize = size.outerSize;
      req.body.items[i].innerSize = size.innerSize;
    }

    return next();
  },

  /* Create factory order and associated bulk items. */
  async (req, res, next) => {
    const axios = setupAxios();
    let order;
    try {
      order = await axios.post('/factory_orders', {
        items: req.body.items,
        label: req.body.label, 
        notes: req.body.notes 
      });
    } catch (err) {
      return next(err);
    }

    return res.redirect(`/orders/${order.data.id}`);
  }

];

