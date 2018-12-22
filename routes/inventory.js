const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res, next) => {
  axios.get(process.env.API_PATH.concat('items'))
    .then((response) => {
      const items = response.data;

      res.render('inventory', { items });
    })
    .catch(next);
});

module.exports = router;
