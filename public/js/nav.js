window.addEventListener('load', function() {

  /* All navigation elements. */
  let settings = document.getElementById('nav-settings');
  let settingsMenu = document.getElementById('nav-settings-menu');
  if (settingsMenu) {
    const settingsPos = settings.getBoundingClientRect();
    settingsMenu.style.left = parseInt(settingsPos.left + 5) + 'px';
    settingsMenu.style.top = parseInt(settingsPos.bottom) + 'px';
  }

  let inventory = document.getElementById('nav-inventory');
  let inventoryMenu = document.getElementById('nav-inventory-menu');
  if (inventoryMenu) {
    const inventoryPos = inventory.getBoundingClientRect();
    inventoryMenu.style.left = parseInt(inventoryPos.left + 5) + 'px';
    inventoryMenu.style.top = parseInt(inventoryPos.bottom) + 'px';
  }

  let customer = document.getElementById('nav-customer');
  let customerMenu = document.getElementById('nav-customer-menu');
  if (customerMenu) {
    const customerPos = customer.getBoundingClientRect();
    customerMenu.style.left = parseInt(customerPos.left + 5) + 'px';
    customerMenu.style.top = parseInt(customerPos.bottom) + 'px';
  }

  let factory = document.getElementById('nav-factory');
  let factoryMenu = document.getElementById('nav-factory-menu');
  if (factoryMenu) {
    const factoryPos = factory.getBoundingClientRect();
    factoryMenu.style.left = parseInt(factoryPos.left + 5) + 'px';
    factoryMenu.style.top = parseInt(factoryPos.bottom) + 'px';
  }

  const INACTIVE = '#0C7436';
  const ACTIVE = '#0C4426';

  /* Hide all submenus. */
  const hideAllMenus = function() {
    if (settings && settingsMenu) {
      settings.style.backgroundColor = INACTIVE;
      settingsMenu.style.display = 'none';
    }
    if (inventory && inventoryMenu) {
      inventory.style.backgroundColor = INACTIVE;
      inventoryMenu.style.display = 'none';
    }
    if (customer && customerMenu) {
      customer.style.backgroundColor = INACTIVE;
      customerMenu.style.display = 'none';
    }
    if (factory && factoryMenu) {
      factory.style.backgroundColor = INACTIVE;
      factoryMenu.style.display = 'none';
    }
  }

  /* Show a particular submenu, and hide all others, if clicked. */
  if (settings && settingsMenu) {
    settings.addEventListener('click', function(event) {
      hideAllMenus();
      settings.style.backgroundColor = ACTIVE;
      settingsMenu.style.display = 'block';
      event.stopPropagation();
    });
  }

  if (inventory && inventoryMenu) {
    inventory.addEventListener('click', function(event) {
      hideAllMenus();
      inventory.style.backgroundColor = ACTIVE;
      inventoryMenu.style.display = 'block';
      event.stopPropagation();
    });
  }

  if (customer && customerMenu) {
    customer.addEventListener('click', function(event) {
      hideAllMenus();
      customer.style.backgroundColor = ACTIVE;
      customerMenu.style.display = 'block';
      event.stopPropagation();
    });
  }

  if (factory && factoryMenu) {
    factory.addEventListener('click', function(event) {
      hideAllMenus();
      factory.style.backgroundColor = ACTIVE;
      factoryMenu.style.display = 'block';
      event.stopPropagation();
    });
  }

  document.addEventListener('click', function() {
    hideAllMenus();
  });

});