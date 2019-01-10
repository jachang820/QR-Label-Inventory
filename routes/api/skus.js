const express = require('express');
const router = express.Router();
const { SKUs, Sizes } = require('../../models')
const Sequelize = require('sequelize');

router.route('/')
// Retrieve all SKUs
.get((req, res, next) => {
  SKUs.findAll({ 
    include: [{ model: Sizes }],
    order: [['id', 'ASC']] })
  .then((factoryOrders) => {
    return res.json(factoryOrders);
  })
  .catch(err => {
    console.log(err);
    next(err);
  });
})
// Create factory order
.post((req, res, next) => {
  const id = req.body.id;
  const upc = req.body.upc;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;

  FactoryOrders.create({
    id,
    upc,
    ColorName,
    SizeName
  })
  .then((factoryOrder) => {
    return res.json(factoryOrder);
  })
  .catch(err => {
    console.log(err);
    next(err);
  });
});

module.exports = router;