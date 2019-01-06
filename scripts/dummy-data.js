const { Colors, Sizes, FactoryOrders,
  CustomerOrders, Items, Users } = require('../models');
const uuidv4 = require('uuid/v4');

async function setup() {

  await Colors.bulkCreate([
    { name: 'blue' },
    { name: 'red' },
    { name: 'glow-in-the-dark' },
    { name: 'Halloween' }
  ]);

  colors = await Colors.findAll();
  colors = colors.map((e) => { return e.name; });

  await Sizes.bulkCreate([
    { name: 'junior', innerSize: 12, outerSize: 4 },
    { name: 'original', innerSize: 12, outerSize: 4 },
    { name: 'MEGA', innerSize: 12, outerSize: 2 }
  ]);

  sizes = await Sizes.findAll();
  sizes = sizes.map((e) => { return e.name });

  await FactoryOrders.bulkCreate([
    { },
    { }
  ]);

  await CustomerOrders.bulkCreate([
    { id: 'aee7514d-f202-4f9d-8212-97d9a459cbda' },
    { id: '030837e2-b120-4359-8d16-e4adab83004a' }
  ]);

  await Users.bulkCreate([
    { firstname: 'Jonathan',
      lastname: 'Chang',
      email: 'j.a.chang820@gmail.com',
      role: 'Administrator'},
    { firstname: 'Alex',
      lastname: 'Chen',
      email: 'aqchen@g.ucla.edu',
      role: 'Administrator' }
  ]);

  let items = []
  for (let i = 0; i < 72; i++) {
    let orderId;
    if (i < 48) {
      orderId = 1;
    } else {
      orderId = 2;
    }
    let color = colors[i % 4];
    let size = sizes[i % 3];
    if (i % 12 == 0) {
      var inner = uuidv4();
      if (i % 48 == 0) {
        var master = uuidv4();
      }
    }

    let id = uuidv4();

    items.push({
      id: id,
      status: 'Ordered',
      innerbox: inner,
      outerbox: master,
      ColorName: color,
      SizeName: size,
      FactoryOrderId: orderId,
      qrcode: `http://www.smokebuddy.com/?id=${id}`
    });
  }

  await Items.bulkCreate(items);

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});