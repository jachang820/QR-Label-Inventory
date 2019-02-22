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


  const colors = [
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
  ];

  const Colors = require('../services/color');
  let colorService = new Colors();
  for (let i = 0; i < colors.length; i++) {
    await colorService.add(colors[i].name, colors[i].abbrev);
  }

  let colorsDict = {};
  for (let i = 0; i < colors.length; i++) {
    colorsDict[colors[i].name] = i + 1;
  }

  let sizes = [
    { name: 'junior', abbrev: 'jr', innerSize: 12, masterSize: 4, used: true },
    { name: 'original', abbrev: 'og', innerSize: 12, masterSize: 4, used: true },
    { name: 'mega', abbrev: 'm', innerSize: 12, masterSize: 2, used: true }
  ];

  const Sizes = require('../services/size');
  let sizeService = new Sizes();
  for (let i = 0; i < sizes.length; i++) {
    await sizeService.add(
      sizes[i].name,
      sizes[i].abbrev,
      sizes[i].innerSize,
      sizes[i].masterSize
    );
  }

  let sizesDict = {
    junior: 1,
    original: 2,
    mega: 3
  };

  const upc_pre = '651277420';

  let skus = [
    { id: 'or-black', upc: `${upc_pre}178`, colorId: colorsDict['black'], sizeId: sizesDict['original'] },
    { id: 'or-blue', upc: `${upc_pre}161`, colorId: colorsDict['blue'], sizeId: sizesDict['original'] },
    { id: 'or-green', upc: `${upc_pre}154`, colorId: colorsDict['green'], sizeId: sizesDict['original'] },
    { id: 'or-lime', upc: `${upc_pre}147`, colorId: colorsDict['lime'], sizeId: sizesDict['original'] },
    { id: 'or-red', upc: `${upc_pre}116`, colorId: colorsDict['red'], sizeId: sizesDict['original'] },
    { id: 'or-pink', upc: `${upc_pre}130`, colorId: colorsDict['pink'], sizeId: sizesDict['original'] },
    { id: 'or-white', upc: `${upc_pre}185`, colorId: colorsDict['white'], sizeId: sizesDict['original'] },
    { id: 'or-teal', upc: `${upc_pre}208`, colorId: colorsDict['teal'], sizeId: sizesDict['original'] },
    { id: 'or-purple', upc: `${upc_pre}192`, colorId: colorsDict['purple'], sizeId: sizesDict['original'] },
    { id: 'or-wood', upc: `${upc_pre}253`, colorId: colorsDict['wood'], sizeId: sizesDict['original'] },
    { id: 'or-camo', upc: `${upc_pre}284`, colorId: colorsDict['camo'], sizeId: sizesDict['original'] },
    { id: 'or-tiedye-ylw', upc: `${upc_pre}291`, colorId: colorsDict['tie dye-yellow'], sizeId: sizesDict['original'] },
    { id: 'or-tiedye-org', upc: `${upc_pre}291`, colorId: colorsDict['tie dye-orange'], sizeId: sizesDict['original'] },
    { id: 'or-vegasblack', upc: `${upc_pre}321`, colorId: colorsDict['vegas-black'], sizeId: sizesDict['original'] },
    { id: 'or-vegasred', upc: `${upc_pre}321`, colorId: colorsDict['vegas-red'], sizeId: sizesDict['original'] },
    { id: 'or-cares', upc: `${upc_pre}338`, colorId: colorsDict['cares'], sizeId: sizesDict['original'] },
    { id: 'or-glow-white', upc: `${upc_pre}246`, colorId: colorsDict['glow in the dark-white'], sizeId: sizesDict['original'] },
    { id: 'or-glow-blue', upc: `${upc_pre}215`, colorId: colorsDict['glow in the dark-blue'], sizeId: sizesDict['original'] },
    { id: 'jr-black', upc: `${upc_pre}048`, colorId: colorsDict['black'], sizeId: sizesDict['junior'] },
    { id: 'jr-blue', upc: `${upc_pre}093`, colorId: colorsDict['blue'], sizeId: sizesDict['junior'] },
    { id: 'jr-red', upc: `${upc_pre}024`, colorId: colorsDict['red'], sizeId: sizesDict['junior'] },
    { id: 'jr-yellow', upc: `${upc_pre}017`, colorId: colorsDict['yellow'], sizeId: sizesDict['junior'] },
    { id: 'jr-lime', upc: `${upc_pre}031`, colorId: colorsDict['lime'], sizeId: sizesDict['junior'] },
    { id: 'jr-pink', upc: `${upc_pre}055`, colorId: colorsDict['pink'], sizeId: sizesDict['junior'] },
    { id: 'jr-white', upc: `${upc_pre}062`, colorId: colorsDict['white'], sizeId: sizesDict['junior'] },
    { id: 'jr-teal', upc: `${upc_pre}079`, colorId: colorsDict['teal'], sizeId: sizesDict['junior'] },
    { id: 'jr-purple', upc: `${upc_pre}086`, colorId: colorsDict['purple'], sizeId: sizesDict['junior'] },
    { id: 'jr-orange', upc: `${upc_pre}314`, colorId: colorsDict['orange'], sizeId: sizesDict['junior'] },
    { id: 'jr-glow-white', upc: `${upc_pre}222`, colorId: colorsDict['glow in the dark-white'], sizeId: sizesDict['junior'] },
    { id: 'jr-glow-blue', upc: `${upc_pre}239`, colorId: colorsDict['glow in the dark-blue'], sizeId: sizesDict['junior'] },
    { id: 'm-black', upc: `${upc_pre}116`, colorId: colorsDict['black'], sizeId: sizesDict['mega'] },
    { id: 'm-green', upc: `${upc_pre}284`, colorId: colorsDict['green'], sizeId: sizesDict['mega'] },
    { id: 'm-white', upc: `${upc_pre}352`, colorId: colorsDict['white'], sizeId: sizesDict['mega'] }
  ];

  const Skus = require('../services/sku');
  let skuService = new Skus();

  for (let i = 0; i < skus.length; i++) {
    await skuService.add(
      skus[i].id, skus[i].upc, skus[i].colorId, skus[i].sizeId
    );
  }

  let skuIds = await Sku.findAll();
  skuIds = skuIds.map(e => e.id );

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
    { factoryOrderId: foId1, sku: 'OR-WOOD' },
    { factoryOrderId: foId2, sku: 'M-BLACK' },
    { factoryOrderId: foId2, sku: 'JR-ORANGE' }
  ], {
    individualHooks: true,
    returning: true
  });

  masters = masters.map(e => e.get());
  let mcId1 = masters[0].id;
  let mcId2 = masters[1].id;
  let mcId3 = masters[2].id;

  let inners = await InnerCarton.bulkCreate([
    { masterId: mcId1, sku: 'OR-WOOD' },
    { masterId: mcId1, sku: 'OR-WOOD' },
    { masterId: mcId1, sku: 'OR-WOOD' },
    { masterId: mcId1, sku: 'OR-WOOD' },
    { masterId: mcId2, sku: 'M-BLACK' },
    { masterId: mcId2, sku: 'M-BLACK' },
    { masterId: mcId3, sku: 'JR-ORANGE' },
    { masterId: mcId3, sku: 'JR-ORANGE' },
    { masterId: mcId3, sku: 'JR-ORANGE' },
    { masterId: mcId3, sku: 'JR-ORANGE' }
  ], {
    individualHooks: true,
    returning: true
  });

  inner = inners.map(e => e.get());

  let customers = await CustomerOrder.bulkCreate([
    { type: 'Wholesale' }
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
        status: i >= 4 ? 'Shipped' : 'In Stock'
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
      role: 'Administrator'},
    { firstName: 'Alex',
      lastName: 'Chen',
      email: 'aqchen@g.ucla.edu',
      role: 'Administrator' },
    { firstName: 'Ryan',
      lastName: 'Yang',
      email: 'ryanqyang@gmail.edu',
      role: 'Administrator' }
  ]);

  await Label.bulkCreate([
    { prefix: 'http://www.smokebuddy.com/', style: 'Querystring'},
    { prefix: 'http://holoshield.net/a/', style: 'Path'}
  ]);

  await Label.destroy({
    where: {
      prefix: 'http://www.smokebuddy.com/',
      style: 'Querystring'
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