/* List all elements of a model. */
window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');
  const model = document.getElementById('model-name').textContent;

  /* Add new line to form. */
  const createNewLine = function(line) {
  	let tr = document.createElement('tr');
  	tr.classList.add('new');
  	tr.appendChild(createActionColumn());
  	tr.appendChild(createCodedColumn());

    const serial = line.serial;
  	const sku = line.sku;
  	const quantity = line.quantity;
  	tr.appendChild(createDataColumn({serial}));
    tr.appendChild(createDataColumn({sku}));
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
  	line.serial = serialInput.value.trim();

    /* Get selected SKU. */
    const tdSku = tr.children[3];
    const skuOption = tdSku.firstElementChild;
    const skuIndex = skuOption.selectedIndex;
    if (skuIndex >= 0) {
      line.sku = skuOption.options[skuIndex].value;
    }

    line.quantity = 1;
  	
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
    }

    if (numErrors > 0) return;

    /* No errors. Add line. */
  	const newLine = {
      serial: line.serial,
  		sku: line.sku.toUpperCase(),
  		quantity: 1
  	};
    createNewLine(newLine);

  	sumItemTotal();

  	/* Erase input data. */
    tr.children[2].firstElementChild.value = "";
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