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
  .catch(err => next(err));
})
// Create size
.post((req, res, next) => {
  const name = req.body.name;
  
  Sizes.create({ name })
  .then((size) => {
    return res.json(size);
  })
  .catch(err => next(err));
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

  Sizes.findOne({ where: { name } })
  .then((size) => {
    if (active !== undefined && typeof active == 'boolean') {
      size.active = active;
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
