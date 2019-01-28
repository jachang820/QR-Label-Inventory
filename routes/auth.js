const express = require('express');
const router = express.Router();
const authLoginGet = require('../controllers/authLoginGet');
const authCallbackGet = require('../controllers/authCallbackGet');
const authLogoutGet = require('../controllers/authLogoutGet');

/* Authenticate with Auth0. */
router.get('/login', authLoginGet);

/* Returned from Auth0, confirm authentication, and compute
   security token. */
router.get('/callback', authCallbackGet);

/* Remove user session from request. */
router.get('/logout', authLogoutGet);

module.exports = router;