const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const setupAxios = require('../helpers/setupAxios');

router.all('*', secured());

router.get('/', (req, res, next) => {
	const axios = setupAxios();
  axios.get('/items').then((response) => {
    const items = response.data;

    res.render('inventory', { items });
  }).catch(next);
});

module.exports = router;
