const { Colors, Sizes, FactoryOrders,
  CustomerOrders, Items, Users } = require('../models');

async function setup() {
  await Colors.findOrCreate({ where: {
    name: 'blue'
  }});

  await Colors.findOrCreate({ where: {
    name: 'red'
  }});

  await Sizes.findOrCreate({ where: {
    name: 'jr'
  }});

  await Sizes.findOrCreate({ where: {
    name: 'regular'
  }});

  await FactoryOrders.findOrCreate({ where: {
    id: 1
  }});

  await FactoryOrders.findOrCreate({ where: {
    id: 2
  }});

  await CustomerOrders.findOrCreate({ where: {
    id: 'aee7514d-f202-4f9d-8212-97d9a459cbda'
  }});

  await CustomerOrders.findOrCreate({ where: {
    id: '030837e2-b120-4359-8d16-e4adab83004a'
  }});


  /**********
   * OUTER BOX 1
   */

  // Inner box 1
  await Items.findOrCreate({ where: {
    id: '89938a6e-8310-41c1-a62f-89b5b2cdeae0',
    status: 'Ordered',
    innerbox: 'c9ca6fff-1ef7-44a7-ad28-60f31672ef0e',
    outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
    ColorName: 'blue',
    SizeName: 'jr',
    FactoryOrderId: 1
  }});

  await Items.findOrCreate({ where: {
    id: '20173bd2-02be-418e-85f9-be012b9ed3ae',
    status: 'Shipped',
    innerbox: 'c9ca6fff-1ef7-44a7-ad28-60f31672ef0e',
    outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
    arrivalDate: new Date(Date.UTC(2018, 12, 27, 9, 40)),
    ColorName: 'blue',
    SizeName: 'jr',
    FactoryOrderId: 1,
    CustomerOrderId: '030837e2-b120-4359-8d16-e4adab83004a', // 2
    receivedBy: 'j.a.chang820@gmail.com'
  }});

  // Inner box 2
  await Items.findOrCreate({ where: {
    id: 'c4d657d9-c16e-4f97-b940-c3f3f45b695e',
    status: 'In Stock',
    innerbox: '90ec6e3f-98a2-44e6-9b9f-9b5c5a7bd3b2',
    outerbox: '993ea7e9-6185-4207-b5d8-5f994c6fd806',
    arrivalDate: new Date(Date.UTC(2018, 12, 27, 9, 40)),
    ColorName: 'red',
    SizeName: 'jr',
    FactoryOrderId: 1,
    receivedBy: 'j.a.chang820@gmail.com'
  }});

  /**********
   * OUTER BOX 2
   */

  // Inner box 1
  await Items.findOrCreate({ where: {
    id: 'c4896897-b8fb-4404-9fe1-aa32b1e40a9b',
    status: 'Shipped',
    innerbox: '649279f7-675e-4f8f-a94a-bff37a368695',
    outerbox: 'abb206c9-c795-4dad-bb04-74e94e8c3654',
    arrivalDate: new Date(Date.UTC(2018, 12, 24, 12, 15)),
    ColorName: 'red',
    SizeName: 'regular',
    FactoryOrderId: 2,
    CustomerOrderId: 'aee7514d-f202-4f9d-8212-97d9a459cbda', // 1
    receivedBy: 'aqchen@g.ucla.edu'
  }});


  /**********
   * USERS
   */
  await Users.findOrCreate({where: {
    firstname: 'Jonathan',
    lastname: 'Chang',
    email: 'j.a.chang820@gmail.com',
    role: 'Administrator'
  }});

  await Users.findOrCreate({where: {
    firstname: 'Alex',
    lastname: 'Chen',
    email: 'aqchen@g.ucla.edu',
    role: 'Administrator'
  }});
}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});