const express = require('express');
const router = express.Router();
const axios = require('axios');
const uuid = require('uuid/v4');
const { FactoryOrders } = require('../../models')

router.route('/')
// Retrieve all factory orders
.get((req, res, next) => {
  FactoryOrders.findAll()
  .then((factoryOrders) => {
    res.json(factoryOrders);
  })
  .catch(next);
})
// Create factory order
.post((req, res, next) => {
  const label = req.body.label;
  const arrival_date = req.body.arrival_date;
  const notes = req.body.notes;

  FactoryOrders.create({
    label,
    arrival_date,
    notes
  })
  .then((factoryOrder) => {
    res.json(factoryOrder);
  })
  .catch(err => next(err));
});

router.route('/:id')
// Retrieve single factory order
.get((req, res, next) => {
  const id = req.params.id;

  FactoryOrders.findOne({ where: { id }})
  .then((factoryOrder) => {
    res.json(factoryOrder);
  })
  .catch(next);
})
// Update factory order
.put((req, res, next) => {
  const id = req.params.id;
  const label = req.body.label;
  const arrival_date = req.body.arrival_date;
  const notes = req.body.notes;

  FactoryOrders.findOne({ where: { id } })
  .then((factoryOrder) => {
    if (label !== undefined)
      factoryOrder.label = label;
    if (arrival_date !== undefined)
      factoryOrder.arrival_date = arrival_date;
    if (notes !== undefined)
      factoryOrder.notes = notes;

    factoryOrder.save()
    .then((factoryOrder) => {
      res.json(factoryOrder);
    })
  })
  .catch(next);
})
.delete((req, res, next) => {
  const id = req.params.id;

  FactoryOrders.destroy({ where: { id }})
  .then((count) => {
    res.json(count);
  })
  .catch(next);
});

router.post('/parse_order', async (req, res, next) => {
  let data = req.body;
  let itemCount = Object.keys(data).length / 3;

  axios.defaults.baseURL = process.env.API_PATH;

  try {
    const factoryOrderRes = await axios.post('/factory_orders');
    const FactoryOrderId = factoryOrderRes.data.id;

    for (let i = 1; i <= itemCount; i++) {
      const color = data[`color${i}`];
      const size = data[`size${i}`];
      let quantity = data[`quantity${i}`];

      let innerbox;
      let outerbox;

      for (let j = 0; j < quantity; j++) {
        if (j % 12 == 0) {
          innerbox = uuid();
          console.log(innerbox);
        }
        if (j % 48 == 0) {
          outerbox = uuid();
        }

        await axios.post('/items', {
          status: 'Ordered',
          innerbox: innerbox,
          outerbox: outerbox,
          ColorName: color,
          SizeName: size,
          FactoryOrderId
        });
      }
    }
    res.redirect(`/orders/${FactoryOrderId}`);
  }
  catch (err) {
    console.log(err);
    return next(err);
  }
});

module.exports = router;
