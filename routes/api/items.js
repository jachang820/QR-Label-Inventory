const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const { Items } = require('../../models');
const uuid = require('uuid/v4');

router.route('/')
// Retrieve all items
.get((req, res, next) => {
  Items.findAll({where: req.query })
  .then((items) => {
    return res.json(items);
  })
  .catch((err) => next(err));
})
// Create item
.post((req, res, next) => {
  const status = req.body.status;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;
  const FactoryOrderId = req.body.FactoryOrderId;
  const CustomerOrderId = req.body.CustomerOrderId;
  const qrcode = req.body.qrcode;

  Items.create({
    status,
    innerbox,
    outerbox,
    ColorName,
    SizeName,
    FactoryOrderId,
    CustomerOrderId,
    qrcode
  })
  .then((item) => {
    return res.json(item);
  })
  .catch(err => {
    console.log(err);
    next(err)}
    );
});

router.route('/bulk')
.post((req, res, next) => {
  const items = req.body.items;
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
            ColorName: items[i].color,
            SizeName: items[i].size,
            FactoryOrderId: req.body.orderId,
            qrcode: `http://www.smokebuddy.com/?id=${itemId}`
          });
        }
      }
    }
  }
  console.log(itemsList);
  Items.bulkCreate(itemsList).then(() => {
    return res.json({});
  }).catch(err => next(err));
});

router.get('/filter', (req, res, next) => {
  Items.findAll({ where: req.query })
  .then((items) => {
    return res.json(items);
  })
  .catch(err => next(err));
})

router.route('/:id')
// Retrieve single item
.get((req, res, next) => {
  const id = req.params.id;

  Items.findOne({ where: { id }})
  .then((item) => {
    return res.json(item);
  })
  .catch((err) => next(err));
})
// Create item with id
.post((req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;
  const FactoryOrderId = req.body.FactoryOrderId;
  const CustomerOrderId = req.body.CustomerOrderId;

  Items.create({
    id,
    status,
    innerbox,
    outerbox,
    ColorName,
    SizeName,
    FactoryOrderId,
    CustomerOrderId
  })
  .then((item) => {
    return res.json(item);
  })
  .catch(err => next(err));
})
// Update item
.put((req, res, next) => {
  const id = req.params.id;

  const status = req.body.status;
  const innerbox = req.body.innerbox;
  const outerbox = req.body.outerbox;
  const ColorName = req.body.ColorName;
  const SizeName = req.body.SizeName;
  const FactoryOrderId = req.body.FactoryOrderId;
  const CustomerOrderId = req.body.CustomerOrderId;
  const qrcode = req.body.qrcode;

  console.log(`status ${status}`)
  console.log(`innerbox ${innerbox}`)
  console.log(`outerbox ${outerbox}`)
  console.log(`ColorName ${ColorName}`)
  console.log(`SizeName ${SizeName}`)
  console.log(`FactoryOrderId ${FactoryOrderId}`)
  console.log(`CustomerOrderId ${CustomerOrderId}`)

  Items.findOne({ where: { id } })
  .then((item) => {
    if (statuses.includes(status)) {
      item.status = status;
    if (innerbox > 0)
      item.innerbox = innerbox;
    if (outerbox > 0)
      item.outerbox = outerbox;
    if (arrivalDate > 0)
      item.arrivalDate = arrivalDate;
    if (typeof ColorName === 'string' && ColorName.length > 0)
      item.ColorName = ColorName;
    }
    if (typeof SizeName === 'string' && SizeName.length > 0) {
      item.SizeName = SizeName;
    if (FactoryOrderId > 0)
      item.FactoryOrderId = FactoryOrderId;
    if (CustomerOrderId > 0)
      item.CustomerOrderId = CustomerOrderId;
    if (typeof qrcode === 'string' && qrcode.length > 0)
      item.qrcode = qrcode;
    }

    item.save().then((item) => {
      return res.json(item);
    });
  })
  .catch((err) => next(err));
})
// Delete item
.delete((req, res, next) => {
  const id = req.params.id;

  Items.destroy({ where: { id } })
  .then((count) => {
    return res.json(count);
  })
  .catch(err => next(err));
});

module.exports = router;
