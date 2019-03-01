const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const FactoryOrders = require('../services/factoryOrder');

/* Get information to populate QR label template PDF. */
module.exports = [

  /* Validate id. */
  param('id').isInt({ min: 1 }).withMessage("Invalid id."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeParam('id').trim().escape().stripLow().toInt(),

  /* Handle errors. */
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Generate stream and prompt download PDF. */
  async (req, res, next) => {
    const id = req.params.id;
    const orders = new FactoryOrders();

    /* Initiate stream and pipe pdf write to response read. */
    const writeCallback = (doc, serial) => {
      res.writeHead(200, {
        'Content-Disposition': `attachment; filename=${serial}.pdf`,
        'Connection': 'Transfer-Encoding',
        'Content-Type': 'application/pdf',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff'
      });
      try {
        return doc.pipe(res);
      } catch (err) {
        return res.redirect('/error/500');
      }
    };

    /* End read stream only when write stream has ended. */
    const endCallback = () => {
      return res.end();
    }

    /* Start pdf write stream to generate template. */
    return orders.generateTemplate(id, writeCallback);
  }
];
