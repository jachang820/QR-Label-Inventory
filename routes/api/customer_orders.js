const express = require('express');
const router = express.Router();
const { CustomerOrders, Items } = require('../../models');

router.route('/')
// Retrieve all customer orders
.get((req, res, next) => {
  CustomerOrders.findAll({
    order: [['createdAt', 'ASC']]
  })
  .then((customerOrders) => {
    return res.json(customerOrders);
  })
  .catch((err) => next(err));
})
// Create customer order
.post((req, res, next) => {
  const label = req.body.label;
  const notes = req.body.notes;

  CustomerOrders.create({
    label,
    notes
  })
  .then((customerOrder) => {
    return res.json(customerOrder);
  })
  .catch(err => next(err));
});

router.route('/:id')
// Retrieve single customer order
.get((req, res, next) => {
  const id = req.params.id;

  CustomerOrders.findOne({ 
    where: { id },
    include: [{model: Items}]
  })
  .then((customerOrder) => {
    return res.json(customerOrder);
  })
  .catch(err => next(err));
})
// Update customer order
.put((req, res, next) => {
  const id = req.params.id;
  const label = req.body.label;
  const notes = req.body.notes;

  CustomerOrders.findOne({ where: { id } })
  .then((customerOrder) => {
    if (label !== undefined)
      customerOrder.label = label;
    if (notes !== undefined)
      customerOrder.notes = notes;

    customerOrder.save()
    .then((customerOrder) => {
      return res.json(customerOrder);
    })
  })
  .catch(err => next(err));
})
.delete((req, res, next) => {
  const id = req.params.id;

  CustomerOrders.destroy({ where: { id }})
  .then((count) => {
    return res.json(count);
  })
  .catch(err => next(err));
});

module.exports = router;