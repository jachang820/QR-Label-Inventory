const express = require('express');
const router = express.Router();
const { FactoryOrders } = require('../../models')

router.route('/')
// Retrieve all factory orders
.get((req, res, next) => {
  FactoryOrders.findAll()
  .then((factoryOrders) => {
    return res.json(factoryOrders);
  })
  .catch(err => next(err));
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
    return res.json(factoryOrder);
  })
  .catch(err => next(err));
});

router.route('/:id')
// Retrieve single factory order
.get((req, res, next) => {
  const id = req.params.id;

  FactoryOrders.findOne({ where: { id }})
  .then((factoryOrder) => {
    return res.json(factoryOrder);
  })
  .catch(err => next(err));
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
      return res.json(factoryOrder);
    })
  })
  .catch(err => next(err));
})
.delete((req, res, next) => {
  const id = req.params.id;

  FactoryOrders.destroy({ where: { id }})
  .then((count) => {
    return res.json(count);
  })
  .catch(err => next(err));
});

module.exports = router;
