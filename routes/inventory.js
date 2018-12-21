const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res, next) => {
  axios.get('http://localhost:3000/api/items')
    .then((response) => {
      res.render('inventory', {
        data: response.data
      });
    })
    .catch(next);
});

module.exports = router;
