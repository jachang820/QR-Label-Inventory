const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Generates middleware list to view SKU settings. */
module.exports = [

  /* Get all colors. */
  getModel('colors', 'res', 'name'),

  /* Get all sizes. */
  getModel('sizes', 'res', 'name'),

  /* Get all SKUs. */
  getModel('skus', 'res', 'id'),

  /* Get object necessary for list all. */
  prepareList('skus'),

  /* Render page. */
  (req, res, next) => {
    return res.render('listAll');
  }

];
