const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const reconstructUrl = require('../../helpers/reconstructUrl');
const matchedLabel = require('../../helpers/matchedLabel');
const enumAttr = require('../../helpers/enumAttr');
const arrParser = require('../../middleware/arrParser');
const getModel = require('../../middleware/getModel');
const Labels = require('../../services/label');
const Skus = require('../../services/sku');
const Sizes = require('../../services/size');

module.exports = [

  /* Convert array form to object. */
  arrParser,

  /* Ignore empty new rows. */
  (req, res, next) => {
    const count = req.body.items.length;
    for (let i = count - 1; i >= 0; i--) {
      if (req.body.items[i].qrcode.trim().length === 0) {
        req.body.items.pop();
      }
    }
    return next();
  },

  /* Validate items. */
  body('items').trim()
    .not().isEmpty().withMessage("Order must contain at least one item."),

  /* Validate label. */
  body('label').trim()
    .not().isEmpty().withMessage("Invoice number empty."),

  /* Validate type. */
  (req, res, next) => {
    const types = enumAttr('customerOrders', 'type');
    return express.Router().use(body('type').trim()
      .isIn(types).withMessage("Type must be either Retail or Wholesale.")
    )(req, res, next);
  },

  /* Get all labels. */
  async (req, res, next) => {
    const labels = new Labels();
    req.body.labels = await labels.getListView();
    return next();
  },

  /* Get all SKUs. */
  async (req, res, next) => {
    const skus = new Skus();
    req.body.skus = await skus.getListView();
    req.body.skusId = Skus.mapColumn(req.body.skus, 'id');
    return next();
  },

  /* Cet all sizes. */
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

  /* Get IDs from QR code that matches configured formats. */
  (req, res, next) => {
    console.log(req.body);
    const items = req.body.items;
    const labels = req.body.labels;
    for (let i = 0; i < items.length; i++) {
      items[i].id = matchedLabel(items[i].qrcode, labels);
    }
    console.log(req.body);
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
  sanitizeBody('items.*.sku').trim().escape().stripLow(),
  sanitizeBody('items.*.qrcode').trim().stripLow(),
  sanitizeBody('items.*.id').trim().escape().stripLow(),
  sanitizeBody('label').trim().escape().stripLow(),
  sanitizeBody('notes').trim().escape().stripLow(),
  sanitizeBody('type').trim().escape().stripLow(),

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
    const count = req.body.items.length;
    let itemsList = []
    for (let i = 0; i < count; i++) {
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
        type: req.body.type,
        label: req.body.label,
        notes: req.body.notes
      });
    } catch (err) {
      return next(err);
    }
    
    res.redirect(`/customer_orders/${order.data.id}`);
  }
]

