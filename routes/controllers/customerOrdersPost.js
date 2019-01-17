const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const reconstructUrl = require('../../helpers/reconstructUrl');
const matchedLabel = require('../../helpers/matchedLabel');
const arrParser = require('../../middleware/arrParser');
const getModel = require('../../middleware/getModel');

module.exports = [
  /* Convert array form to object. */
  arrParser,

  /* Makes sure hidden iterator field has not been tempered with. */
  body('count').isNumeric().withMessage('Count must be a number.')
               .isInt({ min: 1 }).withMessage('Count must be positive.'),

  /* Get all labels. */
  getModel('labels', 'req'),

  /* Get all SKUs. */
  getModel('skus', 'req', 'id'),

  /* Cet all sizes. */
  getModel('sizes', 'req'),

  /* Validate SKU. */
  (req, res, next) => {
    const skus = req.body.skusId;
    return express.Router().use(body('items.*.sku').trim()
      .exists().withMessage("Form transmission failed.")
      .isString().withMessage("SKU must be a string.")
      .isIn(skus).withMessage("Invalid SKU selected.")
    )(req, res, next);
  },

  /* Get IDs from QR code that matches configured formats. */
  (req, res, next) => {
    const items = req.body.items;
    const labels = req.body.labels;
    for (let i = 0; i < items.length; i++) {
      items[i].id = matchedLabel(items[i].qrcode, labels);
    }
    return next();
  },

  /* Validate IDs from QR codes. */
  (req, res, next) => {
    const axios = setupAxios();
    req.body.usedIds = [];
    return express.Router().use(body('items.*.id').trim()
      .exists({ checkNull: true }).withMessage("Invalid QR format.")
      .custom(async (id, { req }) => {
        /* null values should be caught in previous check. */
        if (id === null) {
          return true;
        }

        /* Compare ID against new items. */
        if (req.body.usedIds.includes(id)) {
          throw new Error("Duplicate IDs entered.");
        }
        req.body.usedIds.push(id);

        /* Compare ID against old items. */
        let item;
        try { 
          item = await axios.get(`/items/${id}`);
        } catch (err) {
          throw new Error("Check unique ID failed.");
        }

        if (item.data) {
          throw new Error("Duplicate ID found.");
        }
        
        return true;
      })
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('count').trim().toInt().escape(),
  sanitizeBody('items.*.skus').trim().escape(),
  sanitizeBody('items.*.qrcode').trim().escape(),
  sanitizeBody('items.*.id').trim().escape(),

  /* Reconstruct URL from effects of sanitize. */
  (req, res, next) => {
    for (let i = 0; i < req.body.items.length; i++) {
      const qr = reconstructUrl(req.body.items[i].qrcode);
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
      console.log(errors);
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

