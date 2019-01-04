const express = require('express');
const router = express.Router();
const { Items, FactoryOrders, CustomerOrders } = require('../../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fn = Sequelize.fn;

// Scan items out of the warehouse
router.post('/out/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const items = await Items.get({
      where: { 
        [Op.or]: [{ id: id },
                  { innerbox: id },
                  { outerbox: id }]},
      include: [
        { model: FactoryOrders },
        { model: CustomerOrders }
      ] 
    });
  } catch (err) {
    return next(err);
  }

  return res.json(items);
});

module.exports = router;
