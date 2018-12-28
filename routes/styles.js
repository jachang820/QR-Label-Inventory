const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');

const stylesGet = require('./controllers/stylesGet');
const stylesPost = require('./controllers/stylesPost');
const stylesPut = require('./controllers/stylesPut');

/* Make sure logged in user is a valid user. */
router.all('*', secured());

/* Show form for managing styles. */
router.get('/', stylesGet);

/* Add a new style. */
router.post('/color', stylesPost('color'));
router.post('/size', stylesPost('size'));

/* Change active status of style. If style has no items,
   then delete style. */
router.put('/color', stylesPut('color'));
router.put('/size', stylesPut('size'));

module.exports = router;
