const Items = require('../services/item');

/* Get the necessary information to populate form. */
module.exports = async (req, res, next) => {
  const id = req.params.id;
  const items = new Items();
  let itemIds;
  
  try {
    itemIds = await items.getStock(id);
  } catch (err) {
    return res.json({ errors: err.errors || 'unknown' });
  }
  return res.json({ items: itemIds });
};
