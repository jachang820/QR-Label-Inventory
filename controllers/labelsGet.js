const Labels = require('../services/label');

/* Get the necessary information to populate form. */
module.exports = async (req, res, next) => {
	const labels = new Labels();
	res.locals.list = await labels.getListView();
	res.locals.types = await labels.getSchema();
  return res.render('listView');
};
