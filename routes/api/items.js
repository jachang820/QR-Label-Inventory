const express = require('express');
const router = express.Router();
const { Items } = require('../../models')

router.route('/')
// Retrieve all items
.get((req, res, next) => {
  Items.findAll()
  .then((items) => {
    res.json(items);
  })
  .catch(next);
})
// Create item
.post((req, res, next) => {
  const status = req.body.status;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;
  const FactoryOrderId = req.body.FactoryOrderId;
  const CustomerOrderId = req.body.CustomerOrderId;

  Items.create({
    status,
    innerbox,
    outerbox,
    ColorName,
    SizeName,
    FactoryOrderId,
    CustomerOrderId
  })
  .then((item) => {
    res.json(item);
  })
  .catch(next);
});

router.route('/:id')
// Retrieve single item
.get((req, res, next) => {
  const id = req.params.id;

  Items.findOne({ where: { id }})
  .then((item) => {
    res.json(item);
  })
  .catch(next);
})
// Update item
.put((req, res, next) => {
  const id = req.params.id;

  const status = req.body.status;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;
  const FactoryOrderId = req.body.FactoryOrderId;
  const CustomerOrderId = req.body.CustomerOrderId;

  Items.findOne({ where: { id } })
  .then((item) => {
    if (status !== undefined)
      item.status = status;
    if (innerbox !== undefined)
      item.innerbox = innerbox;
    if (outerbox !== undefined)
      item.outerbox = outerbox;
    if (ColorName !== undefined)
      item.ColorName = ColorName;
    if (SizeName !== undefined)
      item.SizeName = SizeName;
    if (FactoryOrderId !== undefined)
      item.FactoryOrderId = FactoryOrderId;
    if (CustomerOrderId !== undefined)
      item.CustomerOrderId = CustomerOrderId;

    item.save().then((item) => {
      res.json(item);
    });
  })
  .catch(next);
})
// Delete item
.delete((req, res, next) => {
  const id = req.params.id;

  Items.destroy({ where: { id } })
  .then((count) => {
    res.json(count);
  })
  .catch(next);
});

module.exports = router;
