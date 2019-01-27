const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Get the necessary information to populate form. */
module.exports = (type) => {

  const types = `${type}s`;
  const styles = (type === 'color') ? new Colors() : new Sizes();

  return async (req, res, next) => {
    res.locals.list = await styles.getListView();
    res.locals.types = await styles.getSchema();
    return res.render('listView');
  }
};

  