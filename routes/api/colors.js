const express = require('express');
const router = express.Router();
const { Colors } = require('../../models')

// Retrieve all colors
router.route('/')
.get((req, res, next) => {
  Colors.findAll()
  .then((colors) => {
    res.json(colors);
  })
  .catch(next);
})
// Create color
.post((req, res, next) => {
  const name = req.body.name;
  
  Colors.create({ name })
  .then((color) => {
    res.json(color);
  })
  .catch(next);
})

router.route('/:name')
// Retrieve single color
.get((req, res, next) => {
  const name = req.params.name;

  Colors.findOne({ where: { name }})
  .then((color) => {
    res.json(color);
  })
  .catch(next);
})
// Update color
.put((req, res, next) => {
  const name = req.params.name;
  const active = req.body.active;

  Colors.findOne({ where: { name } })
  .then((color) => {
    if (active !== undefined && typeof active == 'boolean') {
      color.active = active;
    }

    color.save().then((color) => {
      res.json(color);
    });
  })
  .catch(next);
})
// Delete color
.delete((req, res, next) => {
  const name = req.params.name;

  Colors.destroy({ where: { name } })
  .then((count) => {
    res.json(count);
  })
  .catch(next);
});

module.exports = router;
