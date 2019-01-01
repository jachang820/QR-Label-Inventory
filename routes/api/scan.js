const express = require('express');
const router = express.Router();
const { Items, FactoryOrders } = require('../../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const fn = Sequelize.fn;

const markInStock = async (items) => {
  for (const item of items) {
    await item.update({ status: 'In Stock'});

    FactoryOrders.findOne({ where: { id: item.FactoryOrderId }})
    .then((factoryOrder) => {
      if (!factoryOrder.arrival_date) {
        factoryOrder.update({ arrival_date: Date.now() })
      }
    })
  }
};

const markShippedWithCustomerOrder = async (items, CustomerOrderId) => {
  for (const item of items) {
    await item.update({ status: 'Shipped', CustomerOrderId });
  }
};

router.get('/in', async (req, res, next) => {
  const today = (new Date()).toDateString();
  try {
    userScans = await Items.findAll({
      where: {
        receivedBy: res.locals.email,
        arrivalDate: {
          [Op.between]: [today + ' 00:00:00',
                         today + ' 23:59:59']
        }
      },
      group: ['receivedBy', 'ColorName', 'SizeName'],
      attributes: ['receivedBy',
                   'ColorName', 
                   'SizeName',
                   [fn('COUNT', 'arrivalDate'), 'Quantity']],
      order: [[Sequelize.literal('ColorName', 'SizeName')]]
    });

    return res.json(userScans);

  } catch (err) {
    return next(err);
  }
})

// Scan items into the warehouse
router.post('/in/:id', async (req, res, next) => {
  const id = req.params.id;

  try{
    let items = await Items.update(
      { status: req.body.status,
        arrivalDate: req.body.arrivalDate,
        receivedBy: req.body.receivedBy },
      { where: {
        [Op.or]: [{ id: id },
                  { innerbox: id },
                  { outerbox: id }]}
    });

    return res.json(items);

  } catch (err) {
    return next(err);
  }
});

// Scan items out of the warehouse
router.post('/out/:id', (req, res, next) => {
  const id = req.params.id;
  const CustomerOrderId = req.body.CustomerOrdersId;

  // Assume id is outerbox
  Items.findAll({ where: { outerbox: id }})
  .then(async (items) => {
    if (items.length > 0) {
      await markShippedWithCustomerOrder(items, CustomerOrderId);
      return res.json(items);
    }

    // Assumd id is innerbox
    Items.findAll({ where: { innerbox: id }})
    .then(async (items) => {
      if (items.length > 0) {
        await markShippedWithCustomerOrder(items, CustomerOrderId);
        return res.json(items);
      }

      // Assume id is item
      Items.findOne({ where: { id }})
      .then(async (item) => {
        if (item) {
          await markShippedWithCustomerOrder([item], CustomerOrderId);
          return res.json([item]);
        }

        return res.json();
      })
    })
  })
  .catch(err => next(err));
});

module.exports = router;
