const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Skus = require('../services/sku');

/* Updates SKU status. */
module.exports = [

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody("id").trim().escape().stripLow(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Update new SKU statuses. If SKU is active and has no
     corresponding items, it will be deleted. Otherwise, the 
     SKU is set inactive if it was active, and active if it 
     was inactive. */
  async (req, res, next) => {
    const skus = new Skus();
    try {
      await skus.changeState(req.body.id);
      return res.json();

    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.json({ errors: err.errors });
      } else {
        return res.json({ errors: 'unknown'});
      }
    }
  }

];