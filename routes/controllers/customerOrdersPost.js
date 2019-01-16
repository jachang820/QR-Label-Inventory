const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
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

  /* Validate QR code. */
  (req, res, next) => {
    const axios = setupAxios();
    const regex = /http:\/\/[\w\/\.]+\/([a-zA-Z0-9]*)/;
    req.body.usedIds = [];
    return express.Router().use(body('items.*.qrcode').trim()
      .matches(regex, 'i').withMessage("Invalid QR code format.")
      .custom(async (qrcode, { req }) => {
        /* Compare ID against other new items. */
        const match = qrcode.match(regex);
        if (req.body.usedIds.includes(match[1])) {
          throw new Error("Duplicate ID.");
        }

        /* Add ID to new items list. */
        req.body.usedIds.push(match[1]);

        /* Compare ID against old items. */
        let items;
        try {
          items = await axios.get(`/items/${match[1]}`);
        } catch (err) {
          throw new Error("Check unique ID failed.");
        }

        if (items.data) {
          throw new Error("Duplicate ID.");
        }

        return true;
      })
    )(req, res, next);
  },

  /* Get Id from QR code. */
  (req, res, next) => {
    const regex = /http:\/\/[\w\/\.]+\/([a-zA-Z0-9]*)/;
    for (let i = 0; i < req.body.items.length; i++) {
      const match = req.body.items[i].qrcode.match(regex);
      req.body.items[i].id = match[1];
    }
    return next();
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('count').trim().toInt().escape(),
  sanitizeBody('items.*.skus').trim().escape(),
  sanitizeBody('items.*.qrcode').trim().escape(),

  /* Reconstruct URL from effects of sanitize. */
  (req, res, next) => {
    for (let i = 0; i < req.body.items.length; i++) {
      const qr = req.body.items[i].qrcode.replace(/&#x2F;/g, '/');
      req.body.items[i].qrcode = qr;
    }
    return next();
  },

  /* Get all customer orders. */
  getModel('customer_orders', 'res'),

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

      return res.render('customer_orders', { 
        orders: res.locals.customer_orders, 
        skus: req.body.skus, 
        errors: errors
      });
    }
    return next();
  },

  // Create customer order.
  async (req, res, next) => {
    const axios = setupAxios();
    const itemCount = req.body.count;
    let itemsList = []
    for (let i = 0; i < itemCount; i++) {
      itemsList.push({
        id: req.body.items[i].id,
        status: 'Shipped',
        SkuId: req.body.items[i].sku,
        qrcode: req.body.items[i].qrcode
      });
    }

    let order;
    try {
      order = await axios.post('/customer_orders', {
        itemsList: itemsList,
        label: req.body.label,
        notes: req.body.notes
      });
    } catch (err) {
      return next(err);
    }
    
    res.redirect(`/customer_orders/${order.data.id}`);
  }
]

