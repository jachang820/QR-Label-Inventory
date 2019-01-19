const setupAxios = require('../../helpers/setupAxios');

/* Retrieve order info and items for details page. */
module.exports = (orderType) => {

  return async (req, res, next) => {
    const axios = setupAxios();
    const orderId = req.params.id;
    res.locals.orderType = orderType;

    /* Get data of a specific order. */
    let order;
    try {
      order = await axios.get(`/${orderType}_orders/${orderId}`);
      order = order.data;
      
    } catch (err) {
      console.log(err);
      return next(err);
    }

    /* Assign numbers to items for visualization. */
    for (let i = 0; i < order.Items.length; i++) {
      order.Items[i].num = i + 1;
    }

    res.locals.type = order.type;

    res.render('orders_detail', { order });
  };
};