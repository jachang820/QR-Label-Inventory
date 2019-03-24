const db = require('../models');
const Colors = require('../services/color');
const Sizes = require('../services/size');
const Skus = require('../services/sku');
const FactoryOrders = require('../services/factoryOrder');
const CustomerOrders = require('../services/customerOrder');
const Items = require('../services/item');
const Profiles = require('../services/profile');
const Labels = require('../services/label');
const uuidv4 = require('uuid/v4');

const setup = async () => {

  await db.sequelize.sync({ force: true });

  console.log("Loading profiles...");
  const profiles = new Profiles();
  await profiles.add(
    'Jonathan', 'Chang', 
    'j.a.chang820@gmail.com',
    'Administrator'
  );
  await profiles.add(
    'Alex', 'Chen',
    'aqchen@g.ucla.edu',
    'Administrator'
  );
  await profiles.add(
    'Ryan', 'Yang',
    'ryanqyang@gmail.edu',
    'Administrator'
  );

  console.log("Loading labels...");
  const labels = new Labels();
  await labels.add('http://www.smokebuddy.com/', 'Querystring');
  await labels.add('http://holoshield.net/a/', 'Path');
  await labels.changeState(1);

  console.log("Loading colors...");
  const colors = [
    { name: 'Black', abbrev: 'BLACK', used: true },
    { name: 'Blue', abbrev: 'BLUE', used: true },
    { name: 'Green', abbrev: 'GREEN', used: true },
    { name: 'Lime', abbrev: 'LIME', used: true },
    { name: 'Red', abbrev: 'RED', used: true },
    { name: 'Yellow', abbrev: 'YELLOW', used: true },
    { name: 'Pink', abbrev: 'PINK', used: true },
    { name: 'White', abbrev: 'WHITE', used: true },
    { name: 'Teal', abbrev: 'TEAL', used: true },
    { name: 'Purple', abbrev: 'PURPLE', used: true },
    { name: 'Orange', abbrev: 'ORANGE', used: true },
    { name: 'Wood', abbrev: 'WOOD', used: true },
    { name: 'Camo', abbrev: 'CAMO', used: true },
    { name: 'Tie Dye-yellow', abbrev: 'TDYELLO', used: true },
    { name: 'Tie Dye-orange', abbrev: 'TDORANG', used: true },
    { name: 'Vegas-black', abbrev: 'VGBLACK', used: true },
    { name: 'Vegas-red', abbrev: 'VGRED', used: true },
    { name: 'Cares', abbrev: 'CARES', used: true },
    { name: 'Glow In The Dark-white', abbrev: 'GDWHITE', used: true },
    { name: 'Glow In The Dark-blue', abbrev: 'GDBLACK', used: true },
    { name: 'Grenade', abbrev: 'GRENADE', used: true}
  ];

  let colorService = new Colors();
  for (let i = 0; i < colors.length; i++) {
    await colorService.add(colors[i].name, colors[i].abbrev);
  }

  let colorsDict = {};
  for (let i = 0; i < colors.length; i++) {
    colorsDict[colors[i].name] = i + 1;
  }

  console.log("Loading sizes...");
  let sizes = [
    { name: 'Junior', abbrev: 'JR', innerSize: 12, masterSize: 4, used: true },
    { name: 'Original', abbrev: 'OG', innerSize: 12, masterSize: 4, used: true },
    { name: 'Mega', abbrev: 'M', innerSize: 12, masterSize: 2, used: true }
  ];

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
    Junior: 1,
    Original: 2,
    Mega: 3
  };

  console.log("Loading SKUs...");
  const upc_pre = '651277420';

  let skus = [
    { id: 'OR-BLACK', upc: `${upc_pre}178`, colorId: colorsDict['Black'], sizeId: sizesDict['Original'] },
    { id: 'OR-BLUE', upc: `${upc_pre}161`, colorId: colorsDict['Blue'], sizeId: sizesDict['Original'] },
    { id: 'OR-GREEN', upc: `${upc_pre}154`, colorId: colorsDict['Green'], sizeId: sizesDict['Original'] },
    { id: 'OR-LIME', upc: `${upc_pre}147`, colorId: colorsDict['Lime'], sizeId: sizesDict['Original'] },
    { id: 'OR-RED', upc: `${upc_pre}116`, colorId: colorsDict['Red'], sizeId: sizesDict['Original'] },
    { id: 'OR-PINK', upc: `${upc_pre}130`, colorId: colorsDict['Pink'], sizeId: sizesDict['Original'] },
    { id: 'OR-WHITE', upc: `${upc_pre}185`, colorId: colorsDict['White'], sizeId: sizesDict['Original'] },
    { id: 'OR-TEAL', upc: `${upc_pre}208`, colorId: colorsDict['Teal'], sizeId: sizesDict['Original'] },
    { id: 'OR-PURPLE', upc: `${upc_pre}192`, colorId: colorsDict['Purple'], sizeId: sizesDict['Original'] },
    { id: 'OR-WOOD', upc: `${upc_pre}253`, colorId: colorsDict['Wood'], sizeId: sizesDict['Original'] },
    { id: 'OR-CAMO', upc: `${upc_pre}284`, colorId: colorsDict['Camo'], sizeId: sizesDict['Original'] },
    { id: 'OR-TIEDYE-YLW', upc: `${upc_pre}291`, colorId: colorsDict['Tie Dye-yellow'], sizeId: sizesDict['Original'] },
    { id: 'OR-TIEDYE-ORG', upc: `${upc_pre}291`, colorId: colorsDict['Tie Dye-orange'], sizeId: sizesDict['Original'] },
    { id: 'OR-VEGASBLACK', upc: `${upc_pre}321`, colorId: colorsDict['Vegas-black'], sizeId: sizesDict['Original'] },
    { id: 'OR-VEGASRED', upc: `${upc_pre}321`, colorId: colorsDict['Vegas-red'], sizeId: sizesDict['Original'] },
    { id: 'OR-CARES', upc: `${upc_pre}338`, colorId: colorsDict['Cares'], sizeId: sizesDict['Original'] },
    { id: 'OR-GLOW-WHITE', upc: `${upc_pre}246`, colorId: colorsDict['Glow In The Dark-white'], sizeId: sizesDict['Original'] },
    { id: 'OR-GLOW-BLUE', upc: `${upc_pre}215`, colorId: colorsDict['Glow In The Dark-blue'], sizeId: sizesDict['Original'] },
    { id: 'OR-GRENADE', upc: `${upc_pre}307`, colorId: colorsDict['Grenade'], sizeId: sizesDict['Original'] },
    { id: 'JR-BLACK', upc: `${upc_pre}048`, colorId: colorsDict['Black'], sizeId: sizesDict['Junior'] },
    { id: 'JR-BLUE', upc: `${upc_pre}093`, colorId: colorsDict['Blue'], sizeId: sizesDict['Junior'] },
    { id: 'JR-RED', upc: `${upc_pre}024`, colorId: colorsDict['Red'], sizeId: sizesDict['Junior'] },
    { id: 'JR-YELLOW', upc: `${upc_pre}017`, colorId: colorsDict['Yellow'], sizeId: sizesDict['Junior'] },
    { id: 'JR-LIME', upc: `${upc_pre}031`, colorId: colorsDict['Lime'], sizeId: sizesDict['Junior'] },
    { id: 'JR-PINK', upc: `${upc_pre}055`, colorId: colorsDict['Pink'], sizeId: sizesDict['Junior'] },
    { id: 'JR-WHITE', upc: `${upc_pre}062`, colorId: colorsDict['White'], sizeId: sizesDict['Junior'] },
    { id: 'JR-TEAL', upc: `${upc_pre}079`, colorId: colorsDict['Teal'], sizeId: sizesDict['Junior'] },
    { id: 'JR-PURPLE', upc: `${upc_pre}086`, colorId: colorsDict['Purple'], sizeId: sizesDict['Junior'] },
    { id: 'JR-ORANGE', upc: `${upc_pre}314`, colorId: colorsDict['Orange'], sizeId: sizesDict['Junior'] },
    { id: 'JR-GLOW-WHITE', upc: `${upc_pre}222`, colorId: colorsDict['Glow In The Dark-white'], sizeId: sizesDict['Junior'] },
    { id: 'JR-GLOW-BLUE', upc: `${upc_pre}239`, colorId: colorsDict['Glow In The Dark-blue'], sizeId: sizesDict['Junior'] },
    { id: 'M-BLACK', upc: `${upc_pre}116`, colorId: colorsDict['Black'], sizeId: sizesDict['Mega'] },
    { id: 'M-GREEN', upc: `${upc_pre}284`, colorId: colorsDict['Green'], sizeId: sizesDict['Mega'] },
    { id: 'M-WHITE', upc: `${upc_pre}352`, colorId: colorsDict['White'], sizeId: sizesDict['Mega'] }
  ];

  let skuService = new Skus();
  for (let i = 0; i < skus.length; i++) {
    await skuService.add(
      skus[i].id, skus[i].upc, skus[i].colorId, skus[i].sizeId
    );
  }

  let skuIds = await db.Sku.findAll();
  skuIds = skuIds.map(e => e.id );
  let numSkus = skuIds.length;

  console.log("Loading factory orders...");
  let factoryService = new FactoryOrders();
  const numFactoryOrders = 5;
  let factoryList = [];
  for (let i = 0; i < numFactoryOrders; i++) {
    const skuIndex = Math.floor(Math.random() * numSkus);
    await factoryService.add('', '', [{
      sku: skuIds[skuIndex],
      master: 3
    }]);
  }

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});