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
    { name: 'black', abbrev: 'black', used: true },
    { name: 'blue', abbrev: 'blue', used: true },
    { name: 'green', abbrev: 'green', used: true },
    { name: 'lime', abbrev: 'lime', used: true },
    { name: 'red', abbrev: 'red', used: true },
    { name: 'yellow', abbrev: 'yellow', used: true },
    { name: 'pink', abbrev: 'pink', used: true },
    { name: 'white', abbrev: 'white', used: true },
    { name: 'teal', abbrev: 'teal', used: true },
    { name: 'purple', abbrev: 'purple', used: true },
    { name: 'orange', abbrev: 'orange', used: true },
    { name: 'wood', abbrev: 'wood', used: true },
    { name: 'camo', abbrev: 'camo', used: true },
    { name: 'tie dye-yellow', abbrev: 'tdyello', used: true },
    { name: 'tie dye-orange', abbrev: 'tdorang', used: true },
    { name: 'vegas-black', abbrev: 'vgblack', used: true },
    { name: 'vegas-red', abbrev: 'vgred', used: true },
    { name: 'cares', abbrev: 'cares', used: true },
    { name: 'glow in the dark-white', abbrev: 'gdwhite', used: true },
    { name: 'glow in the dark-blue', abbrev: 'gdblack', used: true }
  ]);

  await Size.bulkCreate([
    { name: 'junior', abbrev: 'jr', innerSize: 12, masterSize: 4, used: true },
    { name: 'original', abbrev: 'og', innerSize: 12, masterSize: 4, used: true },
    { name: 'mega', abbrev: 'm', innerSize: 12, masterSize: 2, used: true }
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

  let orders = await FactoryOrder.bulkCreate([
    {},
    {}
  ], { 
    individualHooks: true,
    returning: true
  });

  orders = orders.map(e => e.get());
  let foId1 = orders[0].id;
  let foId2 = orders[1].id;

  let masters = await MasterCarton.bulkCreate([
    { factoryOrderId: foId1, sku: 'or-wood' },
    { factoryOrderId: foId2, sku: 'm-black' },
    { factoryOrderId: foId2, sku: 'jr-orange' }
  ], {
    individualHooks: true,
    returning: true
  });

  masters = masters.map(e => e.get());
  let mcId1 = masters[0].id;
  let mcId2 = masters[1].id;
  let mcId3 = masters[2].id;

  let inners = await InnerCarton.bulkCreate([
    { masterId: mcId1, sku: 'or-wood' },
    { masterId: mcId1, sku: 'or-wood' },
    { masterId: mcId1, sku: 'or-wood' },
    { masterId: mcId1, sku: 'or-wood' },
    { masterId: mcId2, sku: 'm-black' },
    { masterId: mcId2, sku: 'm-black' },
    { masterId: mcId3, sku: 'jr-orange' },
    { masterId: mcId3, sku: 'jr-orange' },
    { masterId: mcId3, sku: 'jr-orange' },
    { masterId: mcId3, sku: 'jr-orange' }
  ], {
    individualHooks: true,
    returning: true
  });

  inner = inners.map(e => e.get());

  let customers = await CustomerOrder.bulkCreate([
    { type: 'wholesale' }
  ], {
    individualHooks: true,
    returning: true
  });

  customers = customers.map(e => e.get());

  let itemsList = [];
  for (let i = 0; i < inners.length; i++) {
    for (let j = 0; j < 12; j++) {
      let item = {
        factoryOrderId: i >= 4 ? foId2 : foId1,
        masterId: inners[i].masterId,
        innerId: inners[i].id,
        sku: inners[i].sku,
        status: i >= 4 ? 'shipped' : 'in stock'
      };
      if (i >= 4) {
        item.customerOrderId = customers[0].id;
      }
      itemsList.push(item);
    }
  }

  await Item.bulkCreate(itemsList, {
    individualHooks: true
  });

  await Profile.bulkCreate([
    { firstName: 'Jonathan',
      lastName: 'Chang',
      email: 'j.a.chang820@gmail.com',
      role: 'administrator'},
    { firstName: 'Alex',
      lastName: 'Chen',
      email: 'aqchen@g.ucla.edu',
      role: 'administrator' },
    { firstName: 'Ryan',
      lastName: 'Yang',
      email: 'ryanqyang@gmail.edu',
      role: 'administrator' }
  ]);

  await Label.bulkCreate([
    { prefix: 'http://www.smokebuddy.com/', style: 'querystring'},
    { prefix: 'http://holoshield.net/a/', style: 'path'}
  ]);

  await Label.destroy({
    where: {
      prefix: 'http://www.smokebuddy.com/',
      style: 'querystring'
    }
  });

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});