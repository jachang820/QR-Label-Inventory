const express = require('express');
const router = express.Router();
const setupAxios = require('../helpers/setupAxios');

router.get('/', (req, res, next) => {
  res.redirect('/inventory');
})

router.get('/edit/:id', async (req, res, next) => {
  const axios = setupAxios();
  const id = req.params.id;

  let skus;
  let item;
  try {
    skus = await axios.get('/skus');
    item = await axios.get(`/items/${id}`);
  }
  catch (err) {
    return next(err);
  }

  return res.render('item_edit', { item: item.data, skus: skus.data })
});

router.post('/update/:id', (req, res, next) => {
  const axios = setupAxios();
  const id = req.params.id;

  const status = req.body.status;
  const SKUId = req.body.sku.split(' -- ')[0];
  const FactoryOrderId = req.body.factoryOrder;
  const CustomerOrderId = req.body.customerOrder;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;

  axios.put(`/items/${id}`, {
    status,
    SKUId,
    FactoryOrderId,
    CustomerOrderId,
    innerbox,
    outerbox
  }).then(() => {
    res.redirect('/inventory');
  }).catch((err) => next(err))
});

module.exports = router;