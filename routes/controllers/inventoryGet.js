const setupAxios = require('../../helpers/setupAxios');

/* Show inventory. */
module.exports = (req, res, next) => {
	const axios = setupAxios();
  axios.get('/items').then((response) => {
    const items = response.data;
    for (let i = 0; i < items.length; i++) {
    	items[i].num = i + 1;
    }

    res.render('inventory', { items });
  }).catch(next);
};