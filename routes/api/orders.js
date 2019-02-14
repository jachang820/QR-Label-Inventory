const express = require('express');
const { FactoryOrder, CustomerOrders, MasterCarton, Sku, Items,
        sequelize } = require('../../models')
const Sequelize = require('sequelize');

module.exports = (orderType) => {
  const router = express.Router();
  const Orders = orderType === 'factory' ? FactoryOrder : CustomerOrders;
  orderType = orderType.charAt(0).toUpperCase() + orderType.substr(1);
  orderType += 'Order';
  let created = 'created';
  if (orderType === 'CustomerOrder') {
    orderType += 's';
    created += 'At';
  }

  router.route('/')
  // Retrieve all orders
  .get((req, res, next) => {
    Orders.findAll({
      attributes: {
        include: [[Sequelize.fn("COUNT", Sequelize.col('Items.id')), "size"]]
      },
      include: [{ model: Items, attributes: [] }],
      order: [[created, 'ASC']],
      group: [`${orderType}.id`]
    })
    .then((orders) => {
      return res.json(orders);
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
  })
  // Create order
  .post(async (req, res, next) => {
    let transaction;
    let newOrder = {
      label: req.body.label,
      notes: req.body.notes
    };

    if (req.body.itemsList) {
      newOrder.type = req.body.type;
    }

    try {
      transaction = await sequelize.transaction();

      let order = await Orders.create(newOrder);

      let itemsList;
      /* Customer orders. */
      
      itemsList = req.body.itemsList;
      for (let i = 0; i < itemsList.length; i++) {
        itemsList[i].CustomerOrderId = order.dataValues.id;
      }


      await Items.bulkCreate(itemsList);

      await transaction.commit();

      return res.json(order);

    } catch (err) {
      console.log(err);
      await transaction.rollback();
      return next(err);
    }
  });

  router.route('/:id')
  // Retrieve single order
  .get((req, res, next) => {
    const id = req.params.id;
    Orders.findOne({ 
      where: { id },
      include: [{ 
        model: Items,
        include: [{ model: Sku }] 
      }]
    })
    .then((order) => {
      return res.json(order);
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
  })
  // Update order
  .put((req, res, next) => {
    const id = req.params.id;
    const label = req.body.label;
    const arrival = req.body.arrivalDate;
    const notes = req.body.notes;

    Orders.findOne({ where: { id } })
    .then((order) => {
      if (label !== undefined)
        order.label = label;
      if (orderType === 'FactoryOrder' && arrival !== undefined)
        order.arrival = arrivalDate;
      if (notes !== undefined)
        order.notes = notes;

      order.save()
      .then((order) => {
        return res.json(order);
      })
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
  })
  .delete((req, res, next) => {
    const id = req.params.id;

    Orders.destroy({ where: { id }})
    .then((count) => {
      return res.json(count);
    })
    .catch(err => next(err));
  });

  return router;
};
