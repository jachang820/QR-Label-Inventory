const { Colors, Sizes, Skus, FactoryOrders,
  CustomerOrders, Items, Users, Labels } = require('../models');
const uuidv4 = require('uuid/v4');

async function setup() {

  await Colors.bulkCreate([
    { name: 'Black' },
    { name: 'Blue' },
    { name: 'Green' },
    { name: 'Lime' },
    { name: 'Red' },
    { name: 'Yellow' },
    { name: 'Pink' },
    { name: 'White' },
    { name: 'Teal' },
    { name: 'Purple' },
    { name: 'Orange' },
    { name: 'Wood' },
    { name: 'Camo' },
    { name: 'Tie Dye-Yellow' },
    { name: 'Tie Dye-Orange' },
    { name: 'Vegas-Black' },
    { name: 'Vegas-Red' },
    { name: 'Cares' },
    { name: 'Glow in the Dark-White' },
    { name: 'Glow in the Dark-Blue' }
  ]);

  await Sizes.bulkCreate([
    { name: 'Junior', innerSize: 12, outerSize: 4 },
    { name: 'Original', innerSize: 12, outerSize: 4 },
    { name: 'MEGA', innerSize: 12, outerSize: 2 }
  ]);

  const upc_pre = '651277420';

  await Skus.bulkCreate([
    { id: 'OR-BLACK', upc: `${upc_pre}178`, ColorName: 'Black', SizeName: 'Original' },
    { id: 'OR-BLUE', upc: `${upc_pre}161`, ColorName: 'Blue', SizeName: 'Original' },
    { id: 'OR-GREEN', upc: `${upc_pre}154`, ColorName: 'Green', SizeName: 'Original' },
    { id: 'OR-LIME', upc: `${upc_pre}147`, ColorName: 'Lime', SizeName: 'Original' },
    { id: 'OR-RED', upc: `${upc_pre}116`, ColorName: 'Red', SizeName: 'Original' },
    { id: 'OR-PINK', upc: `${upc_pre}130`, ColorName: 'Pink', SizeName: 'Original' },
    { id: 'OR-WHITE', upc: `${upc_pre}185`, ColorName: 'White', SizeName: 'Original' },
    { id: 'OR-TEAL', upc: `${upc_pre}208`, ColorName: 'Teal', SizeName: 'Original' },
    { id: 'OR-PURPLE', upc: `${upc_pre}192`, ColorName: 'Purple', SizeName: 'Original' },
    { id: 'OR-WOOD', upc: `${upc_pre}253`, ColorName: 'Wood', SizeName: 'Original' },
    { id: 'OR-CAMO', upc: `${upc_pre}284`, ColorName: 'Camo', SizeName: 'Original' },
    { id: 'OR-TIEDYE-YLW', upc: `${upc_pre}291`, ColorName: 'Tie Dye-Yellow', SizeName: 'Original' },
    { id: 'OR-TIEDYE-ORG', upc: `${upc_pre}291`, ColorName: 'Tie Dye-Orange', SizeName: 'Original' },
    { id: 'OR-VEGASBLACK', upc: `${upc_pre}321`, ColorName: 'Vegas-Black', SizeName: 'Original' },
    { id: 'OR-VEGASRED', upc: `${upc_pre}321`, ColorName: 'Vegas-Red', SizeName: 'Original' },
    { id: 'OR-CARES', upc: `${upc_pre}338`, ColorName: 'Cares', SizeName: 'Original' },
    { id: 'OR-GLOW-WHITE', upc: `${upc_pre}246`, ColorName: 'Glow in the Dark-White', SizeName: 'Original' },
    { id: 'OR-GLOW-BLUE', upc: `${upc_pre}215`, ColorName: 'Glow in the Dark-Blue', SizeName: 'Original' },
    { id: 'JR-BLACK', upc: `${upc_pre}048`, ColorName: 'Black', SizeName: 'Junior' },
    { id: 'JR-BLUE', upc: `${upc_pre}093`, ColorName: 'Blue', SizeName: 'Junior' },
    { id: 'JR-RED', upc: `${upc_pre}024`, ColorName: 'Red', SizeName: 'Junior' },
    { id: 'JR-YELLOW', upc: `${upc_pre}017`, ColorName: 'Yellow', SizeName: 'Junior' },
    { id: 'JR-LIME', upc: `${upc_pre}031`, ColorName: 'Lime', SizeName: 'Junior' },
    { id: 'JR-PINK', upc: `${upc_pre}055`, ColorName: 'Pink', SizeName: 'Junior' },
    { id: 'JR-WHITE', upc: `${upc_pre}062`, ColorName: 'White', SizeName: 'Junior' },
    { id: 'JR-TEAL', upc: `${upc_pre}079`, ColorName: 'Teal', SizeName: 'Junior' },
    { id: 'JR-PURPLE', upc: `${upc_pre}086`, ColorName: 'Purple', SizeName: 'Junior' },
    { id: 'JR-ORANGE', upc: `${upc_pre}314`, ColorName: 'Orange', SizeName: 'Junior' },
    { id: 'JR-GLOW-WHITE', upc: `${upc_pre}222`, ColorName: 'Glow in the Dark-White', SizeName: 'Junior' },
    { id: 'JR-GLOW-BLUE', upc: `${upc_pre}239`, ColorName: 'Glow in the Dark-Blue', SizeName: 'Junior' },
    { id: 'M-BLACK', upc: `${upc_pre}116`, ColorName: 'Black', SizeName: 'MEGA' },
    { id: 'M-GREEN', upc: `${upc_pre}284`, ColorName: 'Green', SizeName: 'MEGA' },
    { id: 'M-WHITE', upc: `${upc_pre}352`, ColorName: 'White', SizeName: 'MEGA' }
  ]);

  let skus = await Skus.findAll();
  skus = skus.map(e => e.id );

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
    let sku;
    if (i < 48) {
      orderId = 1;
      sku = skus[10];
    } else {
      orderId = 2;
      sku = skus[26];
    }
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
      SKUId: sku,
      FactoryOrderId: orderId,
      qrcode: `http://www.smokebuddy.com/?id=${id}`
    });
  }

  await Items.bulkCreate(items);

  await Labels.bulkCreate([
    { prefix: 'http://www.smokebuddy.com/', style: 'Querystring'},
    { prefix: 'http://holoshield.net/a/', style: 'Path'}
  ]);

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});