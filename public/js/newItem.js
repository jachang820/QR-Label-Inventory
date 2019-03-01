/* List all elements of a model. */
window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');

  /* Get selected serial. */
  const getSerial = function(line, tr) {
    const tdSerial = tr.children[2];
    const serialInput = tdSerial.firstElementChild;
    line.serial = serialInput.value.trim();
  };

  /* Get selected SKU. */
  const getSku = function(line, tr) {
    const tdSku = tr.children[3];
    const skuOption = tdSku.firstElementChild;
    const skuIndex = skuOption.selectedIndex;
    if (skuIndex >= 0) {
      line.sku = skuOption.options[skuIndex].value;
    }
  };

  const getQuantity = function(line, tr) {
    line.quantity = 1;
  };

  /* List of functions to get new item. */
  const getFields = [getSerial, getSku, getQuantity];

  /* Function attached to new line item event listener. */
  const createLineEvent = function(event) {
    const tr = tbody.firstElementChild;
    const line = getNewItem(getFields);

    /* Validate serial. */
    let errors = [];
    let numErrors = 0;
    if (!line.serial) errors.push("Serial must be entered.");
    if (line.serial.startsWith('U')) {
      errors.push("Serial cannot start with 'U'.");
    }

    /* Get existing item serials. */
    const existingItems = getItems().map(function(e) {
      return e.serial;
    });

    /* Look for duplicates. */
    if (existingItems.includes(line.serial)) {
      errors.push("Duplicate item. Already scanned.");
    }

    /* Test QR format. */
    const ws = [' ', '\n', '\t', '\r'];
    const matches = ws.some(function(e) {
      return line.serial.includes(e);
    });
    if (matches) errors.push("Serial cannot contain whitespace.");
    numErrors += errors.length;
    appendErrors(tr.children[2], errors);

    /* Test SKU. */
    if (!line.sku || line.sku.length === 0) {
      appendErrors(tr.children[3], ["SKU must be selected."]);
      numErrors += 1;
    }

    if (numErrors > 0) return;

    /* No errors. Add line. */
  	const newLine = {
      serial: line.serial.toUpperCase(),
  		sku: line.sku.toUpperCase(),
  		quantity: 1
  	};
    createNewLine(newLine);

  	const numLines = sumItemTotal();
    let submitButton = document.getElementById('submit-order-btn');
    if (numLines > 1) {
      submitButton.value = "Add Items";
    } else {
      submitButton.value = "Add Item";
    }

  	/* Erase input data. */
    tr.children[2].firstElementChild.value = "";

    /* Clear errors. */
    appendErrors(tr.children[2]);
    appendErrors(tr.children[3]);
  };

  /* Send new order to database. */
  const createOrderEvent = function(event) {
  	const items = getItems();
  	const itemsDiv = document.getElementById('items-box');
    let numErrors = 0;

  	if (items.length === 0) {
      appendErrors(itemsDiv, ["Must create at least one item."]);
      numErrors++;
    }

    if (numErrors > 0) return;

    let button = event.currentTarget;
    button.disabled = true;

  	axios.post('/inventory', { items }).then(function(response) {
  		const errs = response.data.errors;
  		if (errs) {
  			if (errs === 'unknown') {
          window.location.replace('/error/500');
          return;
        }

        let errors = [];
        for (let i = 0; i < errs.length; i++) {
          errors.push(errs[i].msg);
        }
  			appendErrors(itemsDiv, errors);

        button.disabled = false;
        return;

  		} else {
  			window.location.replace('/inventory');
  			return;
  		}

  	}).catch(function(err) {
  		const tr = tbody.firstElementChild;
  		appendErrors(tr.children[2], ["Server error."]);
      button.disabled = false;
  	});
  }

  /* Add event listeners. */
  setupEvents(createLineEvent, createOrderEvent);

});