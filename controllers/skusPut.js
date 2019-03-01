const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const express = require('express');
const Skus = require('../services/sku');

/* Update SKU status. */
module.exports = [

  /* Validate id. */
  param("id").trim()
    .isLength({ min: 1, max: 32}).withMessage("SKU ID must be between 1-32 characters.")
    .not().contains(' ').withMessage("SKU ID cannot contain whitespace."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeParam("id").trim().escape().stripLow(),

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
      await skus.changeState(req.params.id);
      return res.json();

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }

];