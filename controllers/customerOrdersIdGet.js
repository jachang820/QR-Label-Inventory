const Items = require('../services/item');

/* Get id based on scanned or entered item and display information. */
module.exports = async (req, res, next) => {
  const id = req.params.id;
  const items = new Items();
  let itemIds;
  
  try {
    itemIds = await items.getStock(id);
    for (let i = 0; i < itemIds.length; i++) {
    	const date = new Date(itemIds[i].created);
    	itemIds[i].created = date.toISOString();
    }
  } catch (err) {
    return res.json({ errors: err.errors || 'unknown' });
  }
  return res.json({ items: itemIds });
};
