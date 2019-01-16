const uuid = require('uuid/v4');

/* Create list of item objects for bulkCreate,
   given line items (sku, qty, inner, outer). */
module.exports = (items, orderId) => {
	let itemsList = [];
  for (let i = 0; i < items.length; i++) {
    
    for (let j = 0; j < items[i].quantity; j++) {
      const outerbox = uuid();
      
      for (let k = 0; k < items[i].outerSize; k++) {
        const innerbox = uuid();

        for (let l = 0; l < items[i].innerSize; l++) {
          const itemId = uuid();
          itemsList.push({
            id: itemId,
            status: 'Ordered',
            innerbox: innerbox,
            outerbox: outerbox,
            SkuId: items[i].sku,
            FactoryOrderId: orderId,
            qrcode: `http://www.smokebuddy.com/?id=${itemId}`
          });
        }
      }
    }
  }
  return itemsList;
};