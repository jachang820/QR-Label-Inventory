const Skus = require('../services/sku');

/* Get inner and master carton sizes to calculate count based on
   SKU selection. */
module.exports = async (req, res, next) => {
  const sku = req.params.sku;
  const skus = new Skus();
  const skuSize = await skus.getSize(sku);
  return res.json({ sku: skuSize });
};
