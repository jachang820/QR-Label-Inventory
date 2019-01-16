const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Generates middleware list to view color and size settings. */
module.exports = (type) => {

  const types = `${type}s`;

  return [

    /* Get all of the style type. */
    getModel(types, 'res', 'name'),

    /* Get object necessary for list all. */
    prepareList(types),

    /* Render page. */
    (req, res, next) => {
      return res.render('listAll');
    }

  ];
};

  