const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const express = require('express');
const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Update style status. */
module.exports = (type) => {

  const styles = (type === 'color') ? new Colors() : new Sizes();

  return [

    /* Validate id. */
    param("id").trim()
      .isInt({ min: 1 }).withMessage("Invalid id."),

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

    /* Update new style statuses. If style is active and has no
       corresponding SKUs, it will be deleted. Otherwise, the 
       style is set inactive if it was active, and active if it 
       was inactive. */
    async (req, res, next) => {
      try {
        await styles.changeState(req.params.id);
        return res.json();

      } catch (err) {
        return res.json({ errors: err.errors || 'unknown' });
      }
    }

  ];

};