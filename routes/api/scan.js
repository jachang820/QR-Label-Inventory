const express = require('express');
const router = express.Router();
const { Items, FactoryOrders } = require('../../models')

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

// Scan items into the warehouse
router.post('/in/:id', (req, res, next) => {
  const id = req.params.id;

  // Assume id is outerbox
  Items.findAll({ where: { outerbox: id }})
  .then(async (items) => {
    if (items.length > 0) {
      await markInStock(items);
      res.json(items);
      return;
    }

    // Assumd id is innerbox
    Items.findAll({ where: { innerbox: id }})
    .then(async (items) => {
      if (items.length > 0) {
        await markInStock(items);
        res.json(items);
        return;
      }

      // Assume id is item
      Items.findOne({ where: { id }})
      .then(async (item) => {
        if (item) {
          await markInStock([item]);
          res.json([item]);
          return;
        }

        res.json();
      })
    })
  })
  .catch(next);
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
      res.json(items);
      return;
    }

    // Assumd id is innerbox
    Items.findAll({ where: { innerbox: id }})
    .then(async (items) => {
      if (items.length > 0) {
        await markShippedWithCustomerOrder(items, CustomerOrderId);
        res.json(items);
        return;
      }

      // Assume id is item
      Items.findOne({ where: { id }})
      .then(async (item) => {
        if (item) {
          await markShippedWithCustomerOrder([item], CustomerOrderId);
          res.json([item]);
          return;
        }

        res.json();
      })
    })
  })
  .catch(next);
});

module.exports = router;
