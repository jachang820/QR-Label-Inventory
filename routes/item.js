const express = require('express');
const router = express.Router();
const setupAxios = require('../helpers/setupAxios');
const getModel = require('../middleware/getModel');

router.get('/', (req, res, next) => {
  res.redirect('/inventory');
})

router.get('/edit/:id', [

  /* Get all SKUs. */
  getModel('skus', 'res'),

  /* Render edit items page. */
  async (req, res, next) => {
    const axios = setupAxios();
    let item;
    try {
      item = await axios.get(`/items/${req.params.id}`);
    }
    catch (err) {
      return next(err);
    }

    return res.render('item_edit', { 
      item: item.data 
    });
  }
]);

/* Edit item. */
router.post('/update/:id', async (req, res, next) => {
  const axios = setupAxios();
  let response;
  try {
    response = await axios.put(`/items/${req.params.id}`, {
      status: req.body.status,
      SkuId: req.body.sku.split(' -- ')[0],
      FactoryOrderId: req.body.factoryOrder,
      CustomerOrderId: req.body.customerOrder,
      innerbox: req.body.innerbox,
      outerbox: req.body.outerbox
    });
  } catch (err) {
    return next(err);
  }

  return res.redirect('/inventory');
});

module.exports = router;