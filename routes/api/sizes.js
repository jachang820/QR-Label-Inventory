const express = require('express');
const router = express.Router();
const { Sizes } = require('../../models')

// Retrieve all sizes
router.route('/')
.get((req, res, next) => {
  Sizes.findAll()
  .then((sizes) => {
    return res.json(sizes);
  })
  .catch(err => {
    console.log(err);
    return next(err)});
})
// Create size
.post((req, res, next) => {
  const name = req.body.name;
  const innerSize = parseInt(req.body.innerSize);
  const outerSize = parseInt(req.body.outerSize);
  
  Sizes.create({ name, innerSize, outerSize })
  .then((size) => {
    return res.json(size);
  })
  .catch(err => {
    console.log(err);
    return next(err)});
})

router.route('/:name')
// Retrieve single size
.get((req, res, next) => {
  const name = req.params.name;

  Sizes.findOne({ where: { name }})
  .then((size) => {
    return res.json(size);
  })
  .catch(err => next(err));
})

// Update size
.put((req, res, next) => {
  const name = req.params.name;
  const active = req.body.active;
  const used = req.body.used;

  Sizes.findOne({ where: { name } })
  .then((size) => {
    if (active !== undefined && typeof active === 'boolean') {
      size.active = active;
    }
    if (used !== undefined && typeof used === 'boolean') {
      size.used = used;
    }

    size.save().then((size) => {
      return res.json(size);
    });
  })
  .catch(err => next(err));
})
// Delete size
.delete((req, res, next) => {
  const name = req.params.name;

  Sizes.destroy({ where: { name } })
  .then((count) => {
    return res.json(count);
  })
  .catch(err => next(err));
});

module.exports = router;
