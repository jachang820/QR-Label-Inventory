/* List all elements of a model. */
window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');
  const model = document.getElementById('model-name').textContent;

  /* Add new line to form. */
  const createNewLine = function(line) {
  	let tr = document.createElement('tr');
  	tr.classList.add('new', 'id-' + line.clickId);
  	tr.appendChild(createActionColumn());
  	tr.appendChild(createCodedColumn());

    const serial = line.serial;
  	const sku = line.sku;
    const created = line.created;
  	const innerId = line.innerId;
  	const masterId = line.masterId;
  	const quantity = line.quantity;
  	tr.appendChild(createDataColumn({serial}));
    tr.appendChild(createDataColumn({sku}));
    tr.appendChild(createDataColumn({created}));
  	tr.appendChild(createDataColumn({innerId}));
  	tr.appendChild(createDataColumn({masterId}));
  	tr.appendChild(createDataColumn({quantity}));
  	tbody.appendChild(tr);
  }

  /* Create action column. */
  const createActionColumn = function() {
  	let tdAction = document.createElement('td');
  	tdAction.classList.add('new', 'action-col');

  	let img = document.createElement('img');
  	img.classList.add('action-icon');
  	img.src = '/images/remove.png';
  	img.addEventListener('click', deleteRowEvent);
  	tdAction.appendChild(img);
  	return tdAction;
  };

  /* Create coded column. */
  const createCodedColumn = function() {
  	let tdCoded = document.createElement('td');
  	tdCoded.classList.add('new', 'color-coded');
  	return tdCoded;
  };

  /* Create data column. */
  const createDataColumn = function(data) {
  	const name = Object.keys(data)[0];
  	const value = Object.values(data)[0];
  	let tdData = document.createElement('td');
  	tdData.classList.add(name, 'new');

  	const text = document.createTextNode(value);
  	tdData.appendChild(text);
  	return tdData;
  };

  /* Sum total. */
  const sumItemTotal = function() {
  	const rows = tbody.children;
  	let sum = 0;
  	for (let i = 0; i < rows.length; i++) {
  		const quantity = parseInt(rows[i].lastChild.textContent);
  		if (!isNaN(quantity)) {
  			sum += quantity;
  		}
  	}
  	const text = document.createTextNode(sum);
  	let total = document.getElementById('total');
  	total.textContent = '';
  	document.getElementById('total').appendChild(text);
  };

  /* Event to delete clicked row. */
  const deleteRowEvent = function(event) {
  	const tr = event.currentTarget.parentNode.parentNode;
  	tbody.removeChild(tr);
  }

  /* Create list representing all the line items. */
  const getItems = function() {
    let lines = [];
    for (let i = 1; i < tbody.children.length; i++) {
    	const tr = tbody.children[i];
      lines.push(getItem(tr));
    }
    return lines;
  };

  /* Create object representing one line item. */
  const getItem = function(tr) {
  	let line = {};
    line.id = tr.classList.item(1).substring(3);
  	for (let j = 2; j < tr.children.length; j++) {
  		const td = tr.children[j];
  		const name = td.className.split(' ')[0];
  		const text = td.textContent.trim();
  		line[name] = text;
  	}
  	return line;
  }

  /* Create object representing newly entered line. */
  const getNewItem = function() {
  	let line = {};
  	const tr = tbody.firstElementChild;
  	
  	/* Get selected serial. */
  	const tdSerial = tr.children[2];
  	const serialInput = tdSerial.firstElementChild;
  	line['serial'] = serialInput.value.trim();
  	
    return line;
  };

  /* Remove all children nodes. */
  const empty = function(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  };

  /* Propagate errors to a cell. */
  const appendErrors = function(col, errors) {
  	if (!errors || errors.length == 0) return;

    /* Empty the corresponding error list. */
    let errList = col.getElementsByTagName('ul')[0];
    if (errList) {
      empty(errList);

      /* Find relevant errors and add to cell. */
      for (let k = 0; k < errors.length; k++) {
        let li = document.createElement('li');
        li.textContent = errors[k];
        errList.appendChild(li);
      }
    }
  };

  /* Function attached to new line item event listener. */
  const createLineEvent = function(event) {
    const tr = tbody.firstElementChild;
    const line = getNewItem();

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
    appendErrors(tr.children[2], errors);

    if (numErrors > 0) {
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

        const errors = response.data.errors;
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
        		sku: item.sku.toUpperCase(),
            created: item.created,
        		innerId: item.innerSerial,
        		masterId: item.masterSerial,
        		quantity: 1
        	};
        	createNewLine(newLine);
        }

      	sumItemTotal();

      	/* Erase input data. */
      	tr.children[2].firstElementChild.value = "";
        
      }
    }).catch(function(err) {
      console.log(err);
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
      errors.push("Order ID is mandatory.");
      numErrors++;
    } else if (serial.includes(' ')) {
      errors.push("Order ID cannot contain whitespace.");
      numErrors++;
    } else if (serial.startsWith('C')) {
      errors.push("Order ID cannot start with 'C'");
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
  }

  /* POST to create new. */
  let addImg = document.getElementsByClassName('action-icon')[0];
  addImg.addEventListener('click', createLineEvent);

  let submitBtn = document.getElementById('submit-order-btn');
  submitBtn.addEventListener('click', createOrderEvent);

  /* Add new line on enter key. */
  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      createLineEvent(event);
    }
  });

});