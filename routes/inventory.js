const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const setupAxios = require('../helpers/setupAxios');

router.get('/', (req, res, next) => {
	const axios = setupAxios();
  axios.get('/items').then((response) => {
    const items = response.data;

    res.render('inventory', { items });
  }).catch(next);
});

router.get('/filter', (req, res, next) => {
  const axios = setupAxios();
  let apiQuery = {
    id: req.query.id,
    status: req.query.status,
    innerbox: req.query.innerbox,
    outerbox: req.query.outerbox,
    CustomerOrderId: req.query.CustomerOrderId,
    FactoryOrderId: req.query.FactoryOrderId,
    ColorName: req.query.ColorName,
    SizeName: req.query.SizeName
  };

  for (prop in apiQuery) {
    if (apiQuery[prop] === undefined || apiQuery[prop] === null) {
      delete apiQuery[prop];
    }
  }

  console.log(`apiQuery ${apiQuery}`)

  const query = querystring.stringify(apiQuery);

  axios.get(`items/filter?${query}`).then((response) => {
    const items = response.data;

    res.render('inventory', { items });
  }).catch(next);
});

module.exports = router;
