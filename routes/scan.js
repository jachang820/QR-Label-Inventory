const express = require('express');
const router = express.Router();
const scanGet = require('./controllers/scanGet');
const scanPost = require('./controllers/scanPost');

router.get('/', scanGet);

router.post('/', scanPost);

router.get('/test', (req, res, next) => {
	axios.defaults.baseURL = process.env.API_PATH;
})

module.exports = router;