const express = require('express');
const router = express.Router();

const stylesGet = require('../controllers/stylesGet');
const stylesPost = require('../controllers/stylesPost');
const stylesPut = require('../controllers/stylesPut');

/* Show form for managing colors. */
router.get('/', stylesGet('color'));

/* Add a new color. */
router.post('/', stylesPost('color'));

/* Change active status of color. If color has no items,
   then delete color. */
router.put('/:id', stylesPut('color'));

module.exports = router;
