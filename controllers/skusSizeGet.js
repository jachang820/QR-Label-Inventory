const Skus = require('../services/sku');

/* Get the necessary information to populate form. */
module.exports = async (req, res, next) => {
	const sku = req.params.sku;
  const skus = new Skus();
  const skuSize = await skus.getSize(sku);
  return res.json({ sku: skuSize });
};
