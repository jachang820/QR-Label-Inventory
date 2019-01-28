const express = require('express');
const router = express.Router();
const { Items, FactoryOrder, CustomerOrders, Sku } = require('../../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fn = Sequelize.fn;

// Scan items out of the warehouse
router.post('/out/:id', async (req, res, next) => {
  const id = req.params.id;
  let items;
  try {
    items = await Items.findOne({
      where: { id: id },
      include: [
        { model: FactoryOrder },
        { model: CustomerOrders },
        { model: Sku}
      ] 
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  return res.json(items);
});

module.exports = router;
