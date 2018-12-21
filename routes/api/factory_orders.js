const express = require('express');
const router = express.Router();
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
  .catch(next);
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

  FactoryOrders.find({ where: { id } })
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

module.exports = router;
