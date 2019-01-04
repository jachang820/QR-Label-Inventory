const express = require('express');
const router = express.Router();
const setupAxios = require('../helpers/setupAxios');

router.get('/', (req, res, next) => {
  res.redirect('/inventory');
})

router.get('/edit/:id', async (req, res, next) => {
  const axios = setupAxios();
  const id = req.params.id;

  let colorsRes;
  let sizesRes;
  let itemsRes;

  try {
    colorsRes = await axios.get('/colors');
    sizesRes = await axios.get('/sizes');
    itemsRes = await axios.get(`/items/${id}`);
  }
  catch (err) {
    return next(err);
  }

  const colors = colorsRes.data;
  const sizes = sizesRes.data;
  const item = itemsRes.data;

  console.log(`item ${JSON.stringify(item)}`);

  return res.render('item_edit', { item, colors, sizes })
});

router.post('/update/:id', (req, res, next) => {
  const axios = setupAxios();
  const id = req.params.id;

  const status = req.body.status;
  const ColorName = req.body.color;
  const SizeName = req.body.size;
  const FactoryOrderId = req.body.factoryOrder;
  const CustomerOrderId = req.body.customerOrder;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;

  axios.put(`/items/${id}`, {
    status,
    ColorName,
    SizeName,
    FactoryOrderId,
    CustomerOrderId,
    innerbox,
    outerbox
  }).then(() => {
    res.redirect('/inventory');
  }).catch((err) => next(err))
});

module.exports = router;