const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const setupAxios = require('../../helpers/setupAxios');
const express = require('express');
const arrParser = require('../../middleware/arrParser');
const getModel = require('../../middleware/getModel');
const Sizes = require('../../services/size');
const Skus = require('../../services/sku');

module.exports = [
  /* Convert array form to object. */
  arrParser,

  /* Ignore empty new rows. */
  (req, res, next) => {
    const count = req.body.items.length;
    for (let i = count - 1; i >= 0; i--) {
      if (req.body.items[i].quantity.trim().length === 0) {
        req.body.items.pop();
      }
    }
    return next();
  },

  /* Validate items. */
  body('items').trim()
    .not().isEmpty().withMessage("Order must contain at least one item."),

  /* Get all SKUs. */
  async (req, res, next) => {
    const skus = new Skus();
    req.body.skus = await skus.getListView();
    req.body.skusId = Skus.mapColumn(req.body.skus, 'id');
    return next();
  },

  /* Get all sizes. */
  async (req, res, next) => {
    const sizes = new Sizes();
    req.body.sizes = await sizes.getListView();
    return next();
  },

  /* Validate SKU. */
  (req, res, next) => {
    const skus = req.body.skusId;
    return express.Router().use(body('items.*.sku').trim()
      .exists().withMessage("Form transmission failed.")
      .isString().withMessage("SKU must be a string.")
      .isIn(skus).withMessage("Invalid SKU selected.")
    )(req, res, next);
  },

  /* Validate quantity. */
  body('items.*.quantity').trim()
    .exists().withMessage("Form transmission failed.")
    .isInt({ min: 1 }).withMessage("Quantity must be a positive integer."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('items.*.skus').trim().escape().stripLow(),
  sanitizeBody('items.*.quantity').trim().toInt().escape().stripLow(),

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
    const count = req.body.items.length;
    const sizes = req.body.sizes;
    const skus = req.body.skus;

    for (let i = 0; i < count; i++) {
      
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
        if (sizes[j].name === sku.size) {
          size = sizes[j];
          break;
        }
      }

      /* Add packaging properties to items object. */
      req.body.items[i].outerSize = size.masterSize;
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

