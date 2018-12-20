const { Colors, Sizes, FactoryOrders, CustomerOrders, Items } = require('../models');

Colors.findOrCreate({ where: {
  id: 'fc899a5b-81b6-4091-bc96-faa154f859d9',
  color: 'blue'
}});

Colors.findOrCreate({ where: {
  id: 'bc9f1593-3763-42f6-8a43-761eadc14941',
  color: 'red'
}});

Sizes.findOrCreate({ where: {
  id: '882a4917-75c0-49d1-88a0-310cf0df5074',
  size: 'jr'
}});

Sizes.findOrCreate({ where: {
  id: '63a559aa-1920-4afe-936d-16ad1b0822f6',
  size: 'regular'
}});

FactoryOrders.findOrCreate({ where: {
  id: 1
}});

FactoryOrders.findOrCreate({ where: {
  id: 2
}});

CustomerOrders.findOrCreate({ where: {
  id: 'aee7514d-f202-4f9d-8212-97d9a459cbda'
}});

CustomerOrders.findOrCreate({ where: {
  id: '030837e2-b120-4359-8d16-e4adab83004a'
}});

/**********
 * OUTER BOX 1
 */

// Inner box 1
Items.findOrCreate({ where: {
  id: '89938a6e-8310-41c1-a62f-89b5b2cdeae0',
  status: 'Ordered',
  innerbox: 'c9ca6fff-1ef7-44a7-ad28-60f31672ef0e',
  outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
  ColorId: 'fc899a5b-81b6-4091-bc96-faa154f859d9', // blue
  SizeId: '882a4917-75c0-49d1-88a0-310cf0df5074', // jr
  FactoryOrderId: 1
}});

Items.findOrCreate({ where: {
  id: '20173bd2-02be-418e-85f9-be012b9ed3ae',
  status: 'Shipped',
  innerbox: 'c9ca6fff-1ef7-44a7-ad28-60f31672ef0e',
  outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
  ColorId: 'fc899a5b-81b6-4091-bc96-faa154f859d9', // blue
  SizeId: '882a4917-75c0-49d1-88a0-310cf0df5074', // jr
  FactoryOrderId: 1,
  CustomerOrderId: '030837e2-b120-4359-8d16-e4adab83004a' // 2
}});

// Inner box 2
Items.findOrCreate({ where: {
  id: 'c4d657d9-c16e-4f97-b940-c3f3f45b695e',
  status: 'In Stock',
  innerbox: '90ec6e3f-98a2-44e6-9b9f-9b5c5a7bd3b2',
  outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
  ColorId: 'bc9f1593-3763-42f6-8a43-761eadc14941', // red
  SizeId: '882a4917-75c0-49d1-88a0-310cf0df5074', // jr
  FactoryOrderId: 1
}});

/**********
 * OUTER BOX 2
 */

// Inner box 1
Items.findOrCreate({ where: {
  id: 'c4896897-b8fb-4404-9fe1-aa32b1e40a9b',
  status: 'Shipped',
  innerbox: '649279f7-675e-4f8f-a94a-bff37a368695',
  outerbox: 'abb206c9-c795-4dad-bb04-74e94e8c3654',
  ColorId: 'bc9f1593-3763-42f6-8a43-761eadc14941', // red
  SizeId: '63a559aa-1920-4afe-936d-16ad1b0822f6', // regular
  FactoryOrderId: 2,
  CustomerOrderId: 'aee7514d-f202-4f9d-8212-97d9a459cbda' // 1
}});