const express = require('express');
const router = express.Router();
const { Items, FactoryOrder } = require('../../models')

const markInStock = async (items) => {
  for (const item of items) {
    await item.update({ status: 'In Stock'});
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

        res.status(400).send('Item not found.');
      })
    })
  })
  .catch(next);
});

// Scan items out of the warehouse
router.post('/out', (req, res, next) => {

});

module.exports = router;
