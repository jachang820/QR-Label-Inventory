window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');

  /* Get selected serial. */
  const getSerial = function(line, tr) {
  	const tdSerial = tr.children[2];
  	const serialInput = tdSerial.firstElementChild;
  	line.serial = serialInput.value.trim();
  };

  /* List of functions to get new item. */
  const getFields = [getSerial];

  /* Function attached to new line item event listener. */
  const createLineEvent = function(event) {
    const tr = tbody.firstElementChild;
    const line = getNewItem(getFields);

    /* Validate serial. */
    let errors = [];
    let numErrors = 0;
    if (!line.serial) errors.push("Serial must be selected.");
    numErrors += errors.length;

    /* Test QR format */
    const ws = [' ', '\n', '\t', '\r'];
    const matches = ws.some(function(e) {
      return line.serial.includes(e);
    });
    if (matches) errors.push("Serial cannot contain whitespace.");
    numErrors += errors.length;

    if (numErrors > 0) {
      appendErrors(tr.children[2], errors);
    	return;
    }

    /* Get existing item serials. */
    const existingItems = getItems().map(function(e) {
      return e.serial;
    });

    axios.get('/customer_orders/' + line.serial).then(function(response) {
      /* Errors found. Append errors to respective cell. */
      if (response.data.errors || !response.data.items) {
        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        const errors = response.data.errors.map(function(e) {
          return e.msg;
        });
        let td = tr.children[2];
        appendErrors(td, errors);

      } else {
        
        /* Look for duplicates. */
        for (let i = 0; i < response.data.items.length; i++) {
          const item = response.data.items[i];
          if (existingItems.includes(item.serial)) {
            let err = ["Duplicate item. Already scanned."];
            let td = tr.children[2];
            appendErrors(td, err);
            return;
          }
        }

        /* No errors. Add line. */
        for (let i = 0; i < response.data.items.length; i++) {
          const item = response.data.items[i];
        	const newLine = {
            clickId: item.clickId,
            serial: item.serial,
        		sku: item.sku,
            created: formatDate(item.created),
        		innerId: item.innerId,
        		masterId: item.masterId,
        		quantity: 1
        	};
        	createNewLine(newLine);
        }

      	sumItemTotal();

      	/* Erase input data. */
      	tr.children[2].firstElementChild.value = "";

        /* Clear errors. */
        appendErrors(tr.children[2]);
        
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
    let numErrors = 0;

  	if (items.length === 0) {
      appendErrors(itemsDiv, ["Order must contain at least one item."]);
      numErrors++;
    }

    const typeSelect = document.getElementById('select-type');
    const typeIndex = typeSelect.selectedIndex;
    let type;
    if (typeIndex >= 0) {
      type = typeSelect.options[typeIndex].value;
    }

  	const serial = document.getElementById('serial').value;
  	const notes = document.getElementById('notes').value;
  	
    let errors = [];
    if (serial.trim().length === 0) {
      errors.push("Order id is mandatory.");
      numErrors++;
    } else if (serial.includes(' ')) {
      errors.push("Order id cannot contain whitespace.");
      numErrors++;
    } else if (serial.startsWith('C')) {
      errors.push("Order id cannot start with 'C'");
      numErrors++;
    }
    appendErrors(serialDiv, errors);

    if (notes.length > 128) {
      appendErrors(notesDiv, ["Notes must be less than 128 characters."]);
      numErrors++;
    }

    if (numErrors > 0) return;

    const order = { type, serial, notes, items };

    let button = event.currentTarget;
    button.disabled = true;

  	axios.post('/customer_orders', order).then(function(response) {
  		const errs = response.data.errors;
  		if (errs) {
  			if (errs === 'unknown') {
          window.location.replace('/error/500');
          return;
        }

        let serialErrors = [];
        let notesErrors = [];
        let itemsErrors = [];
        for (let i = 0; i < errs.length; i++) {
          let field = errs[i].param;
          let message = errs[i].msg;
          switch (field) {
            case 'serial': 
              serialErrors.push(message);
              break;

            case 'notes':
              notesErrors.push(message);
              break;

            default:
              itemsErrors.push(message);
          }
        }
  			appendErrors(serialDiv, serialErrors);
  			appendErrors(notesDiv, notesErrors);
  			appendErrors(itemsDiv, itemsErrors);

        button.disabled = false;
        return;

  		} else {
  			window.location.replace('/customer_orders/view');
  			return;
  		}

  	}).catch(function(err) {
  		const tr = tbody.firstElementChild;
  		appendErrors(tr.children[2], ["Server error."]);
  		console.log(err);
      button.disabled = false;
  	});
  };

  /* Format created field to m/d/yyyy from ISO-8601. */
  const formatDate = function(date) {
    /* Convert to date string m/d/yyyy, h:m:s AM/PM. */
    const textDate = new Date(date.trim()).toLocaleString('en-US');

    /* Replace values with m/d/yyyy part. */
    if (textDate !== "Invalid Date") {
      return textDate.substring(0, 9);
    } else {
      return date;
    }
  };

  /* Add event listeners. */
  setupEvents(createLineEvent, createOrderEvent);

  /* Select 'Retail' to get value by JS. */
  document.getElementById('serial').selectedIndex = 0;
});