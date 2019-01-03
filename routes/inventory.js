const express = require('express');
const router = express.Router();
const setupAxios = require('../helpers/setupAxios');

router.get('/', (req, res, next) => {
	const axios = setupAxios();
  axios.get('/items').then((response) => {
    const items = response.data;

    res.render('inventory', { items });
  }).catch(next);
});


/* AJAX view of the inventory. */
router.get('/view', async (req, res, next) => {
	const axios = setupAxios();
	let response;
	try {
		response = await axios.post('/inventory/view', { 
			sort: 'color',
			sortDirection: 'ASC'
		});
	} catch (err) {
		return next(err);
	}
	console.log(response.data);
	return res.json(response.data);
})

module.exports = router;
