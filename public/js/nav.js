window.addEventListener('load', function() {

  let settings = document.getElementById('nav-settings');
  let settings_menu = document.getElementById('nav-settings-menu');
  let inventory = document.getElementById('nav-inventory');
  let inventory_menu = document.getElementById('nav-inventory-menu');
  let customer = document.getElementById('nav-customer');
  let customer_menu = document.getElementById('nav-customer-menu');
  let factory = document.getElementById('nav-factory');
  let factory_menu = document.getElementById('nav-factory-menu');

  const hideAllMenus = function() {
    settings.style.backgroundColor = '#0C7436';
    settings_menu.style.display = 'none';
    inventory.style.backgroundColor = '#0C7438';
    inventory_menu.style.display = 'none';
    customer.style.backgroundColor = '#0C7436';
    customer_menu.style.display = 'none';
    factory.style.backgroundColor = '#0C7436';
    factory_menu.style.display = 'none';
  }

  settings.addEventListener('click', function(event) {
    hideAllMenus();
    settings.style.backgroundColor = '#0C4426';
    settings_menu.style.display = 'block';
    event.stopPropagation();
  });

  inventory.addEventListener('click', function(event) {
    hideAllMenus();
    inventory.style.backgroundColor = '#0C4426';
    inventory_menu.style.display = 'block';
    event.stopPropagation();
  });

  customer.addEventListener('click', function(event) {
    hideAllMenus();
    customer.style.backgroundColor = '#0C4426';
    customer_menu.style.display = 'block';
    event.stopPropagation();
  });

  factory.addEventListener('click', function(event) {
    hideAllMenus();
    factory.style.backgroundColor = '#0C4426';
    factory_menu.style.display = 'block';
    event.stopPropagation();
  })

  document.addEventListener('click', function() {
    hideAllMenus();
  });

});