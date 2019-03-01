window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');

  /* Get selected SKU. */
  const getSku = function(line, tr) {
  	const tdSku = tr.children[2];
  	const skuOption = tdSku.firstElementChild;
  	const skuIndex = skuOption.selectedIndex;
  	if (skuIndex >= 0) {
  		line.sku = skuOption.options[skuIndex].value;
  	}
  };

  /* Get master carton quantity. */
  const getMaster = function(line, tr) {
  	const tdMaster = tr.children[3];
  	const masterInput = tdMaster.firstElementChild;
  	line.master = parseInt(masterInput.value.trim());
  };

  /* List of functions to get new item. */
  const getFields = [getSku, getMaster];

  /* Function attached to new line item event listener. */
  const createLineEvent = function(event) {
    const tr = tbody.firstElementChild;
    const line = getNewItem(getFields);

    /* Validate SKU. */
    let errors = [];
    let numErrors = 0;
    if (!line.sku) errors.push("SKU must be selected.");
    numErrors += errors.length;
    appendErrors(tr.children[2], errors);

    /* Validate quantity. */
    errors = [];
    if (!line.master) errors.push("Quantity cannot be empty.");
    if (isNaN(line.master)) errors.push("Quantity must be integer.");
    if (line.master < 1) errors.push("Quantity must be positive.");
    numErrors += errors.length;
    appendErrors(tr.children[3], errors);

    if (numErrors > 0) {
    	return;
    }

    axios.get('/factory_orders/size/' + line.sku).then(function(response) {
      /* Errors found. Append errors to respective cell. */
      if (response.data.errors || !response.data.sku) {
        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        const errors = response.data.errors;
        for (let j = 2; j < tr.children.length; j++) {
          let td = tr.children[j];
          appendErrors(td, errors);
        }

      /* No errors. Add line. */
      } else {
      	const innerSize = response.data.sku.innerSize;
      	const masterSize = response.data.sku.masterSize;
      	const newLine = {
      		sku: response.data.sku.id,
      		master: line.master,
      		inner: masterSize * line.master,
      		quantity: innerSize * masterSize * line.master
      	};
      	createNewLine(newLine);
      	sumItemTotal();

      	/* Erase input data. */
      	tr.children[2].firstElementChild.selectedIndex = -1;
      	tr.children[3].firstElementChild.value = "";

        /* Clear errors. */
        appendErrors(tr.children[2]);
        appendErrors(tr.children[3]);
        
      }
    }).catch(function(err) {
      appendErrors(tr.children[2], ["Server error."]);
    });
  };

  /* Send new order to database. */
  const createOrderEvent = function(event) {
  	const items = getItems();
  	const serialDiv = document.getElementById('serial-box');
  	const notesDiv = document.getElementById('notes-box');
  	const itemsDiv = document.getElementById('items-box');

  	if (items.length === 0) {
  		appendErrors(itemsDiv, ["Order must contain at least one item."]);
  		return;
  	}
  	const serial = document.getElementById('serial').value;
  	const notes = document.getElementById('notes').value;

    if (serial.startsWith('F')) {
      appendErrors(serialDiv, ["Order id cannot start with 'F'"]);
      return;
    }

  	const order = { items, serial, notes };

    let button = event.currentTarget;
    button.disabled = true;

  	axios.post('/factory_orders', order).then(function(response) {
  		const errs = response.data.errors;
  		if (errs) {
  			if (errs === 'unknown') {
          window.location.replace('/error/500');
          return;
        }

  			appendErrors(serialDiv, getErrors(errs, 'serial'));
  			appendErrors(notesDiv, getErrors(errs, 'notes'));
  			appendErrors(itemsDiv, getErrors(errs, 'sku')
  				.append(getErrors(errs, 'quantity')));

        button.disabled = false;

  		} else {
  			window.location.replace('/factory_orders/view');
  			return;
  		}

  	}).catch(function(err) {
  		const tr = tbody.firstElementChild;
  		appendErrors(tr.children[2], ["Server error."]);
      button.disabled = false;
  	});
  };

  /* Add event listeners. */
  setupEvents(createLineEvent, createOrderEvent);
});