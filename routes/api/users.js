const express = require('express');
const router = express.Router();
const { User } = require('../../models')

router.get('/', (req, res) => {
  res.send('in api');
});

// Creates new user
router.post('/create', (req, res) => {
  res.send('in api');
});

// Retrieves all users
router.get('/all', (req, res) => {
  res.send('in api');
});

module.exports = router;
