const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const setupAxios = require('../helpers/setupAxios');
const inventoryGet = require('./controllers/inventoryGet');
const inventoryViewPost = require('./controllers/inventoryViewPost');

router.get('/', inventoryGet);

router.post('/view', inventoryViewPost);

router.get('/filter', (req, res, next) => {
  const axios = setupAxios();
  let apiQuery = {
    id: req.query.id,
    status: req.query.status,
    innerbox: req.query.innerbox,
    outerbox: req.query.outerbox,
    CustomerOrderId: req.query.CustomerOrderId,
    FactoryOrderId: req.query.FactoryOrderId,
    SKUId: req.query.SKUId
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
