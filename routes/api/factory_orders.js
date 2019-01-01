const express = require('express');
const router = express.Router();
const { FactoryOrders } = require('../../models');

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
  const arrivalDate = req.body.arrivalDate;
  const numItems = req.body.numItems;
  const receivedItems = req.body.receivedItems;
  const notes = req.body.notes;

  FactoryOrders.create({
    label,
    arrivalDate,
    numItems,
    receivedItems,
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
  const numItems = req.body.numItems;
  const receivedItems = req.body.receivedItems;
  const arrivalDate = req.body.arrivalDate;
  const notes = req.body.notes;

  FactoryOrders.findOne({ where: { id } })
  .then((factoryOrder) => {
    if (label !== undefined)
      factoryOrder.label = label;
    if (arrivalDate !== undefined)
      factoryOrder.arrivalDate = arrivalDate;
    if (numItems !== undefined)
      factoryOrder.numItems = numItems;
    if (receivedItems !== undefined)
      factoryOrder.receivedItems = receivedItems;
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
