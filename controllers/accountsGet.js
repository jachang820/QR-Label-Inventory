const Profiles = require('../services/profile');

/* Get the necessary information to populate form. */
module.exports = async (req, res, next) => {
  const profiles = new Profiles();
  res.locals.list = await profiles.getListView();
  res.locals.types = await profiles.getSchema();
  return res.render('listView');
};