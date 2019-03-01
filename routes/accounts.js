const express = require('express');
const router = express.Router();

const accountsGet = require('../controllers/accountsGet');
const accountsPost = require('../controllers/accountsPost');
const accountsPut = require('../controllers/accountsPut');

/* Get all users and populate user management form. */
router.get('/', accountsGet); 

/* Validates all inputs and create account. */
router.post('/', accountsPost);

/* Deletes a user account given his email. */
router.put('/:id', accountsPut);

module.exports = router;
