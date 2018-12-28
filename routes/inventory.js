const express = require('express');
const axios = require('axios');
const router = express.Router();
const secured = require('../middleware/secured');

router.all('*', secured());

router.get('/', (req, res, next) => {
	axios.defaults.baseURL = process.env.API_PATH;
  axios.get('/items').then((response) => {
    const items = response.data;

    res.render('inventory', { items });
  }).catch(next);
});

module.exports = router;
