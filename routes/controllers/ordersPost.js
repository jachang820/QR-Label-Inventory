const axios = require('axios');
const uuid = require('uuid/v4');

module.exports = [
  async (req, res, next) => {
    axios.defaults.baseURL = process.env.LOCAL_PATH;

    let data = req.body;
    let itemCount = Object.keys(data).length / 3;

    // validate inputs
    let allErrors = [];

    for (let i = 1; i <= itemCount; i++) {
      const color = data[`color${i}`];
      const size = data[`size${i}`];
      const quantity = data[`quantity${i}`];

      const validateRes = await axios.post('/orders/validate', {
        color,
        size,
        quantity
      });

      const errors = validateRes.data;
      allErrors.push(...errors);
    }

    // Handle errors
    if (allErrors.length > 0) {
      const factoryOrdersRes = await axios.get('/api/factory_orders');
      const colorsRes = await axios.get('/api/colors');
      const sizesRes = await axios.get('/api/sizes')

      const factoryOrders = factoryOrdersRes.data;
      const colors = colorsRes.data;
      const sizes = sizesRes.data;

      return res.render('orders', { factoryOrders, colors, sizes, errors: allErrors });
    }

    // Handle request
    try {
      const factoryOrderRes = await axios.post('/api/factory_orders');
      const FactoryOrderId = factoryOrderRes.data.id;

      for (let i = 1; i <= itemCount; i++) {
        const color = data[`color${i}`];
        const size = data[`size${i}`];
        let quantity = data[`quantity${i}`];

        let innerbox;
        let outerbox;

        for (let j = 0; j < quantity; j++) {
          if (j % 12 == 0) {
            innerbox = uuid();
          }
          if (j % 48 == 0) {
            outerbox = uuid();
          }

          await axios.post('/api/items', {
            status: 'Ordered',
            innerbox: innerbox,
            outerbox: outerbox,
            ColorName: color,
            SizeName: size,
            FactoryOrderId
          });
        }
      }
      res.redirect(`/orders/${FactoryOrderId}`);
    }
    catch (err) {
      console.log(err);
      return next(err);
    }
  }
]

