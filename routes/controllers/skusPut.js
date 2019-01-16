const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');

/* Updates SKU status. */
module.exports = [

  /* Get all SKUs. */
  getModel('skus', 'res', 'id'),

  /* Ensure that SKUs have been selected. */
  (req, res, next) => {
    return express.Router().use(body('id').trim()
      .isIn(res.locals.skusId).withMessage('SKU does not exist.')
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody("id").trim().escape(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    
    return next();
  },

  /* Get matching SKU from database. */
  (req, res, next) => {
    for (let i = 0; i < res.locals.skus.length; i++) {
      if (req.body.id == res.locals.skus[i].id) {
        res.locals.sku = res.locals.skus[i];
        break;
      }
    }
    return next();
  },

  /* Update new SKU statuses. If SKU is active and has no
     corresponding items, it will be deleted. Otherwise, the 
     SKU is set inactive if it was active, and active if it 
     was inactive. */
  async (req, res, next) => {
    const axios = setupAxios();
    const sku = res.locals.sku;
    let response;

    /* New, unused SKU. */
    if (sku.active && !sku.used) {
      try {
        response = await axios.delete(`/skus/${sku.id}`);
      } catch (err) {
        err.custom = `Unable to delete ${sku.id}.`;
        return next(err);
      }

    /* SKU is used, so toggle active. */
    } else {
      try {
        response = await axios.put(`/skus/${sku.id}`, {
          active: !sku.active
        });
      } catch (err) {
        err.custom = `Unable to change status for ${sku.id}.`;
        return next(err);
      }
    }

    return res.json();
  }

];