const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const FactoryOrders = require('../services/factoryOrder');

/* Get the necessary information to populate form. */
module.exports = [

  param('id').isInt({ min: 1 }).withMessage("Invalid id."),

  sanitizeParam('id').trim().escape().stripLow().toInt(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  async (req, res, next) => {
    const id = req.params.id;
    const orders = new FactoryOrders();
    let template = await orders.generateTemplate(id);
    
    return orders.print(template.document, (response) => {
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=${template.serial}.pdf`
      );
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.send(response);
    });
  }
];
