const express = require('express');
const router = express.Router();
const { Skus, Colors, Sizes, sequelize } = require('../../models');

router.route('/')
/* Retrieve all SKUs. */
.get((req, res, next) => {
  Skus.findAll({ 
    order: [
      ['active', 'DESC'],
      ['used', 'ASC'],
      ['id', 'ASC']
    ] 
  })
  .then((skus) => {
    return res.json(skus);
  })
  .catch(err => {
    console.log(err);
    next(err);
  });
})
/* Create SKU. */
.post(async (req, res, next) => {
  let transaction;
  let sku;

  try {
    transaction = await sequelize.transaction();

    let sku = await Skus.create({
      id: req.body.id,
      upc: req.body.upc,
      ColorName: req.body.ColorName,
      SizeName: req.body.SizeName    
    });

    let color = await Colors.findOne({
      where: { name: req.body.ColorName }
    });

    let size = await Sizes.findOne({
      where: { name: req.body.SizeName }
    });

    await color.update({ used: true });

    await size.update({ used: true });

    await transaction.commit();

    return res.json(sku);

  } catch (err) {
    console.log(err);
    await transaction.rollback();
    return next(err);
  }

});

router.route('/:id')
.delete(async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    let sku = await Skus.findOne({ where: { id: req.params.id }});

    await sku.destroy();

    let colors = await Skus.findAll({
      where: { ColorName: sku.dataValues.ColorName }
    });

    let sizes = await Skus.findAll({
      where: { SizeName: sku.dataValues.SizeName }
    });

    if (colors.length === 0) {
      let color = await Colors.findOne({
        where: { name: sku.dataValues.ColorName }
      });

      if (color.active) {
        await color.update({ used: false });
      } else {
        await color.destroy();
      }
    }

    if (sizes.length === 0) {
      let size = await Sizes.findOne({
        where: { name: sku.dataValues.SizeName }
      });

      if (size.active) {
        await size.update({ used: false });
      } else {
        await size.destroy();
      }
    }

    await transaction.commit();

    return res.json();

  } catch (err) {
    console.log(err);
    await transaction.rollback();
    return next(err);
  }
});

module.exports = router;