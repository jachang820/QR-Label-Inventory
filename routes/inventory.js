const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
  axios.get('http://localhost:3000/api/items')
    .then((response) => {
      res.render('inventory', {
        data: response.data
      });
    })
    .catch(() => {
      console.err("Error: Internal API call failed");
    });
});

module.exports = router;
