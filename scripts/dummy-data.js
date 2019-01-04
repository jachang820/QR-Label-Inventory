const { Colors, Sizes, FactoryOrders,
  CustomerOrders, Items, Users } = require('../models');
const uuidv4 = require('uuid/v4');

async function setup() {

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

}

setup().then(() => {
  process.exit();
}).catch((err) => {
  console.log('Error loading dummy data.');
  console.log(err);
  process.exit();
});
