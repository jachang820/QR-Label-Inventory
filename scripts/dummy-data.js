const { Color, Size, Sku, FactoryOrder,
  CustomerOrder, Item, Profile, Label,
  InnerCarton, MasterCarton, sequelize } = require('../models');
const uuidv4 = require('uuid/v4');

const setup = async () => {

  await sequelize.sync({ force: true });

  let cartons = [];
  for (let i = 0; i < 10; i++) {
    cartons.push({});
  }

  await Color.bulkCreate([
    { name: 'black', used: true },
    { name: 'blue', used: true },
    { name: 'green', used: true },
    { name: 'lime', used: true },
    { name: 'red', used: true },
    { name: 'yellow', used: true },
    { name: 'pink', used: true },
    { name: 'white', used: true },
    { name: 'teal', used: true },
    { name: 'purple', used: true },
    { name: 'orange', used: true },
    { name: 'wood', used: true },
    { name: 'camo', used: true },
    { name: 'tie dye-yellow', used: true },
    { name: 'tie dye-orange', used: true },
    { name: 'vegas-black', used: true },
    { name: 'vegas-red', used: true },
    { name: 'cares', used: true },
    { name: 'glow in the dark-white', used: true },
    { name: 'glow in the dark-blue', used: true }
  ]);

  await Size.bulkCreate([
    { name: 'junior', innerSize: 12, masterSize: 4, used: true },
    { name: 'original', innerSize: 12, masterSize: 4, used: true },
    { name: 'mega', innerSize: 12, masterSize: 2, used: true }
  ]);

  const upc_pre = '651277420';

  await Sku.bulkCreate([
    { id: 'or-black', upc: `${upc_pre}178`, color: 'black', size: 'original' },
    { id: 'or-blue', upc: `${upc_pre}161`, color: 'blue', size: 'original' },
    { id: 'or-green', upc: `${upc_pre}154`, color: 'green', size: 'original' },
    { id: 'or-lime', upc: `${upc_pre}147`, color: 'lime', size: 'original' },
    { id: 'or-red', upc: `${upc_pre}116`, color: 'red', size: 'original' },
    { id: 'or-pink', upc: `${upc_pre}130`, color: 'pink', size: 'original' },
    { id: 'or-white', upc: `${upc_pre}185`, color: 'white', size: 'original' },
    { id: 'or-teal', upc: `${upc_pre}208`, color: 'teal', size: 'original' },
    { id: 'or-purple', upc: `${upc_pre}192`, color: 'purple', size: 'original' },
    { id: 'or-wood', upc: `${upc_pre}253`, color: 'wood', size: 'original' },
    { id: 'or-camo', upc: `${upc_pre}284`, color: 'camo', size: 'original' },
    { id: 'or-tiedye-ylw', upc: `${upc_pre}291`, color: 'tie dye-yellow', size: 'original' },
    { id: 'or-tiedye-org', upc: `${upc_pre}291`, color: 'tie dye-orange', size: 'original' },
    { id: 'or-vegasblack', upc: `${upc_pre}321`, color: 'vegas-black', size: 'original' },
    { id: 'or-vegasred', upc: `${upc_pre}321`, color: 'vegas-red', size: 'original' },
    { id: 'or-cares', upc: `${upc_pre}338`, color: 'cares', size: 'original' },
    { id: 'or-glow-white', upc: `${upc_pre}246`, color: 'glow in the dark-white', size: 'original' },
    { id: 'or-glow-blue', upc: `${upc_pre}215`, color: 'glow in the dark-blue', size: 'original' },
    { id: 'jr-black', upc: `${upc_pre}048`, color: 'black', size: 'junior' },
    { id: 'jr-blue', upc: `${upc_pre}093`, color: 'blue', size: 'junior' },
    { id: 'jr-red', upc: `${upc_pre}024`, color: 'red', size: 'junior' },
    { id: 'jr-yellow', upc: `${upc_pre}017`, color: 'yellow', size: 'junior' },
    { id: 'jr-lime', upc: `${upc_pre}031`, color: 'lime', size: 'junior' },
    { id: 'jr-pink', upc: `${upc_pre}055`, color: 'pink', size: 'junior' },
    { id: 'jr-white', upc: `${upc_pre}062`, color: 'white', size: 'junior' },
    { id: 'jr-teal', upc: `${upc_pre}079`, color: 'teal', size: 'junior' },
    { id: 'jr-purple', upc: `${upc_pre}086`, color: 'purple', size: 'junior' },
    { id: 'jr-orange', upc: `${upc_pre}314`, color: 'orange', size: 'junior' },
    { id: 'jr-glow-white', upc: `${upc_pre}222`, color: 'glow in the dark-white', size: 'junior' },
    { id: 'jr-glow-blue', upc: `${upc_pre}239`, color: 'glow in the dark-blue', size: 'junior' },
    { id: 'm-black', upc: `${upc_pre}116`, color: 'black', size: 'mega' },
    { id: 'm-green', upc: `${upc_pre}284`, color: 'green', size: 'mega' },
    { id: 'm-white', upc: `${upc_pre}352`, color: 'white', size: 'mega' }
  ]);

  let skus = await Sku.findAll();
  skus = skus.map(e => e.id );

  await FactoryOrder.bulkCreate([
    { alias: 'one' },
    { alias: 'two' }
  ], { individualHooks: true });

  await MasterCarton.bulkCreate([
    { factoryOrderId: 1, sku: 'or-wood' },
    { factoryOrderId: 1, sku: 'or-wood' },
    { factoryOrderId: 1, sku: 'or-wood' },
    { factoryOrderId: 1, sku: 'or-wood' },
    { factoryOrderId: 1, sku: 'm-black' },
    { factoryOrderId: 1, sku: 'm-black' },
    { factoryOrderId: 1, sku: 'm-black' },
    { factoryOrderId: 1, sku: 'jr-orange' },
    { factoryOrderId: 1, sku: 'jr-orange' },
    { factoryOrderId: 1, sku: 'jr-orange' }
  ], { individualHooks: true });

  const FactoryOrderRepo = require('../repos/factoryOrder');
  let factory = new FactoryOrderRepo();
  let list = await factory.list();
  console.log(list);
  console.log(list[0].lineItems);
  console.log(list[1]);

  await CustomerOrder.bulkCreate([
    { type: 'wholesale',
      alias: 'Sample1' },
    { type: 'wholesale',
      alias: 'Sample2' }
  ]);

  await Profile.bulkCreate([
    { firstName: 'Jonathan',
      lastName: 'Chang',
      email: 'j.a.chang820@gmail.com',
      role: 'administrator'},
    { firstName: 'Alex',
      lastName: 'Chen',
      email: 'aqchen@g.ucla.edu',
      role: 'administrator' }
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

    items.push({
      status: 'ordered',
      innerId: inner,
      masterId: master,
      sku: sku,
      FactoryOrderId: orderId,
    });
  }

  await Item.bulkCreate(items);

  await Label.bulkCreate([
    { prefix: 'http://www.smokebuddy.com/', style: 'querystring'},
    { prefix: 'http://holoshield.net/a/', style: 'path'}
  ]);

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});