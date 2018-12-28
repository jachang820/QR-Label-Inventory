const express = require('express');
const router = express.Router();
const { Sizes } = require('../../models')

// Retrieve all sizes
router.route('/')
.get((req, res, next) => {
  Sizes.findAll()
  .then((sizes) => {
    res.json(sizes);
  })
  .catch(next);
})
// Create size
.post((req, res, next) => {
  const name = req.body.name;
  
  Sizes.create({ name })
  .then((size) => {
    res.json(size);
  })
  .catch(next);
})

router.route('/:name')
// Retrieve single size
.get((req, res, next) => {
  const name = req.params.name;

  Sizes.findOne({ where: { name }})
  .then((size) => {
    res.json(size);
  })
  .catch(next);
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
      res.json(size);
    });
  })
  .catch(next);
})
// Delete size
.delete((req, res, next) => {
  const name = req.params.name;

  Sizes.destroy({ where: { name } })
  .then((count) => {
    res.json(count);
  })
  .catch(next);
});

module.exports = router;
