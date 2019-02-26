window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');

  /* Add new line to form. */
  const createNewLine = function(line) {
  	let tr = document.createElement('tr');
  	tr.classList.add('new');
  	tr.appendChild(createActionColumn());
  	tr.appendChild(createCodedColumn());

  	const sku = line.sku;
  	const master = line.master;
  	const inner = line.inner;
  	const quantity = line.quantity;
  	tr.appendChild(createDataColumn({sku}));
  	tr.appendChild(createDataColumn({master}));
  	tr.appendChild(createDataColumn({inner}));
  	tr.appendChild(createDataColumn({quantity}));
  	tbody.appendChild(tr);
  };

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
  };

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
  	for (let j = 2; j < tr.children.length; j++) {
  		const td = tr.children[j];
  		const name = td.className.split(' ')[0];
  		const text = td.textContent.trim();
  		line[name] = text;
  	}
  	return line;
  };

  /* Create object representing newly entered line. */
  const getNewItem = function() {
  	let line = {};
  	const tr = tbody.firstElementChild;
  	
  	/* Get selected SKU. */
  	const tdSku = tr.children[2];
  	const skuOption = tdSku.firstElementChild;
  	const skuIndex = skuOption.selectedIndex;
  	if (skuIndex >= 0) {
  		line['sku'] = skuOption.options[skuIndex].value;
  	}
  	
  	/* Get master carton quantity. */
  	const tdMaster = tr.children[3];
  	const masterInput = tdMaster.firstElementChild;
  	line['master'] = parseInt(masterInput.value.trim());

    return line;
  };

  /* Remove all children nodes. */
  const empty = function(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  };

  /* Propagate errors to a cell. */
  const appendErrors = function(col, errors = []) {
    /* Empty the corresponding error list. */
    let errList = col.getElementsByTagName('ul')[0];
    empty(errList);

    /* Find relevant errors and add to cell. */
    for (let k = 0; k < errors.length; k++) {
      let li = document.createElement('li');
      li.textContent = errors[k];
      errList.appendChild(li);
    }
  };

  /* Get errors of one type. */
  const getErrors = function(errs, name) {
		return errs.filter(function(e) { 
			return e.param === name;
		}).map(function(e) { 
			return e.msg; 
		});
	};

  /* Function attached to new line item event listener. */
  const createLineEvent = function(event) {
    const tr = tbody.firstElementChild;
    const line = getNewItem();

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

  	if (items.length === 0) {
  		appendErrors(itemsDiv, ["Order must contain at least one item."]);
  		return;
  	}
  	const serial = document.getElementById('serial').value;
  	const notes = document.getElementById('notes').value;

    if (serial.startsWith('F')) {
      appendErrors(serialDiv, ["Order ID cannot start with 'F'"]);
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