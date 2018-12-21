const express = require('express');
const router = express.Router();
const { Items } = require('../../models')

router.get('/', (req, res) => {
  res.send('in items api');
});

module.exports = router;
