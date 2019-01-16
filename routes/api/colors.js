const express = require('express');
const router = express.Router();
const { Colors } = require('../../models');

// Retrieve all colors
router.route('/')
.get((req, res, next) => {
  Colors.findAll()
  .then((colors) => {
    return res.json(colors);
  })
  .catch((err) => {
    return next(err);
  });
})
// Create color
.post((req, res, next) => {
  const name = req.body.name;
  
  Colors.create({ name })
  .then((color) => {
    return res.json(color);
  })
  .catch((err) => {
    return next(err);
  });
});

router.route('/:name')
// Retrieve single color
.get((req, res, next) => {
  const name = req.params.name;

  Colors.findOne({ where: { name }})
  .then((color) => {
    return res.json(color);
  })
  .catch((err) => {
    return next(err);
  });
})
// Update color
.put((req, res, next) => {
  const name = req.params.name;
  const active = req.body.active;
  const used = req.body.used;

  Colors.findOne({ where: { name } })
  .then((color) => {
    if (active !== undefined && typeof active === 'boolean') {
      color.active = active;
    }
    if (used !== undefined && typeof used === 'boolean') {
      color.used = used;
    }

    color.save().then((color) => {
      return res.json(color);
    });
  })
  .catch((err) => {
    return next(err);
  });
})
// Delete color
.delete((req, res, next) => {
  const name = req.params.name;

  Colors.destroy({ where: { name } })
  .then((count) => {
    return res.json(count);
  })
  .catch((err) => {
    return next(err);
  });
});

module.exports = router;
