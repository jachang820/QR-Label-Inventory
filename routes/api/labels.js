const express = require('express');
const router = express.Router();
const { Labels } = require('../../models');

router.route('/')
/* Retrieve all label URLs. */
.get(async (req, res, next) => {
  let label;

  try {
    label = await Labels.findAll({ 
      order: [
        ['createdAt', 'DESC']
      ] 
    });
  } catch (err) {
    console.log(err);
    next(err);
  }

  return res.json(label);
})
/* Create label URL. */
.post(async (req, res, next) => {
  let label;

  try {
    label = await Labels.create({
      prefix: req.body.prefix,
      style: req.body.style
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }

  return res.json(label);
});

router.route('/:id')
.delete(async (req, res, next) => {
  try {
    let label = await Labels.findOne({ where: { id: req.params.id }});

    await label.destroy();

    return res.json();

  } catch (err) {
    console.log(err);
    return next(err);
  }
});

module.exports = router;