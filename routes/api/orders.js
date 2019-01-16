const express = require('express');
const { FactoryOrders, CustomerOrders, Items, Skus,
        sequelize } = require('../../models')
const Sequelize = require('sequelize');
const expandLineItems = require('../../helpers/expandLineItems');

module.exports = (orderType) => {
  const router = express.Router();
  const Orders = orderType === 'factory' ? FactoryOrders : CustomerOrders;
  orderType = orderType.charAt(0).toUpperCase() + orderType.substr(1);

  router.route('/')
  // Retrieve all orders
  .get((req, res, next) => {
    Orders.findAll({
      attributes: {
        include: [[Sequelize.fn("COUNT", Sequelize.col("Items.id")), "size"]]
      },
      include: [{ model: Items, attributes: [] }],
      order: [['createdAt', 'ASC']],
      group: [`${orderType}Orders.id`]
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

    try {
      transaction = await sequelize.transaction();

      let order = await Orders.create(newOrder);

      let itemsList;
      /* Factory orders. */
      if (req.body.itemsList === undefined) {
        itemsList = expandLineItems(
          req.body.items, 
          order.dataValues.id
        );

      /* Customer orders. */
      } else {
        itemsList = req.body.itemsList;
        for (let i = 0; i < itemsList.length; i++) {
          itemsList[i].CustomerOrderId = order.dataValues.id;
        }
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
        include: [{ model: Skus }] 
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
    const arrivalDate = req.body.arrivalDate;
    const notes = req.body.notes;

    Orders.findOne({ where: { id } })
    .then((order) => {
      if (label !== undefined)
        order.label = label;
      if (orderType === 'Factory' && arrivalDate !== undefined)
        order.arrivalDate = arrivalDate;
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
