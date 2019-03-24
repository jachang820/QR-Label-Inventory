let tbody = document.getElementById('list-body');

/* Add new line to form. */
const createNewLine = function(line) {
	let tr = document.createElement('tr');
	tr.classList.add('new');
  if (line.clickId) {
    tr.classList.add('id-' + line.clickId);
    delete line.clickId;
  }
	tr.appendChild(createActionColumn());
	tr.appendChild(createCodedColumn());

  const keys = Object.keys(line);
  for (let i = 0; i < keys.length; i++) {
    let obj = {};
    obj[keys[i]] = line[keys[i]];
    tr.appendChild(createDataColumn(obj));
  }
	tbody.appendChild(tr);
  return;
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
  let total = document.getElementById('total');
  total.textContent = sum === 0 ? '' : sum;
  return sum;
};

/* Event to delete clicked row. */
const deleteRowEvent = function(event) {
  const tr = event.currentTarget.parentNode.parentNode;
  tbody.removeChild(tr);
  sumItemTotal();
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
  if (tr.classList.length > 1) {
    line.id = tr.classList.item(1).substring(3);
  }
  for (let j = 2; j < tr.children.length; j++) {
    const td = tr.children[j];
    const name = td.className.split(' ')[0];
    const text = td.textContent.trim();
    line[name] = text;
  }
  return line;
};

/* Create object representing newly entered line. */
const getNewItem = function(columnFuns = []) {
  let line = {};
  const tr = tbody.firstElementChild;
  
  for (let i = 0; i < columnFuns.length; i++) {
    columnFuns[i](line, tr);
  }

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

/* Get errors of one type. */
const getErrors = function(errs, name) {
  return errs.filter(function(e) { 
    return e.param === name;
  }).map(function(e) { 
    return e.msg; 
  });
};

/* Set up some events. */
const setupEvents = function(lineEvent, orderEvent) {
  let addImg = document.getElementsByClassName('action-icon')[0];
  addImg.addEventListener('click', lineEvent);

  let submitBtn = document.getElementById('submit-order-btn');
  submitBtn.addEventListener('click', orderEvent);

  /* Add new line on enter key. */
  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      lineEvent(event);
    }
  });
};

/* Show a message on the bottom of the page. */
const showWaitMessage = function(event) {
  let bar = document.getElementById('message-bar');
  bar.style.visibility = 'visible';
  setTimeout(function() {
    bar.style.visibility = 'hidden';
  }, 4000);
};