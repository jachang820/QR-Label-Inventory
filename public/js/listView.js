/* List all elements of a model. */
window.addEventListener('load', function() {

  let actions = document.getElementsByClassName('action-icon');
  let printQr = document.getElementsByClassName('print-qr');
  let expand = document.getElementsByClassName('expand');
  let stock = document.getElementsByClassName('stock');
  let tbody = document.getElementById('list-body');
  const model = document.getElementById('model-name').textContent;

  /* Create object representing one existing line. */
  const getItem = function(row) {
    let line = {};
    for (let j = 2; j < row.children.length; j++) {
      const field = row.children[j].className.split(' ')[0];
      line[field] = row.children[j].textContent.trim();
    }
    
    return line;
  };

  /* Create object representing newly entered line. */
  const getNewItem = function(row) {
    let line = {};
    for (let j = 2; j < row.children.length; j++) {
      const field = row.children[j].className.split(' ')[0];
      const inData = row.children[j].firstElementChild;

      switch(inData.tagName.toLowerCase()) {
        case 'input':
          line[field] = inData.value;
          break;
        case 'select':
          const index = inData.selectedIndex;
          if (index < 0) {
            line[field] = "";
          } else {
            line[field] = inData.options[index].value;
          }
      }
    }
    return line;
  };

  const getId = function(row) {
    let classes = row.className.split(' ');
    if (classes.length === 2 && classes[1].startsWith('id')) {
      return classes[1].substring(3);
    } else {
      return window.location.replace('/error/500');
    }
  };

  /* Remove all children nodes. */
  const empty = function(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  };

  /* Propagate errors to a cell. */
  const appendErrors = function(col, errors) {
    /* Empty the corresponding error list. */
    let errList = col.getElementsByTagName('ul')[0];
    empty(errList);

    /* Find relevant errors and add to cell. */
    let field = col.className.split(' ')[0];
    for (let k = 0; k < errors.length; k++) {
      if (errors[k].param == field) {
        let li = document.createElement('li');
        li.textContent = errors[k].msg;
        errList.appendChild(li);
      }
    }
  };

  /* Function attached to new line item event listener. */
  const createEvent = function(event) {
    let row = actions[0].parentNode.parentNode;
    let line = getNewItem(row);

    axios.post('/' + model, line).then(function(response) {
      /* Errors found. Append errors to respective cell. */
      if (response.data.errors) {

        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        const errors = response.data.errors;
        for (let j = 2; j < row.children.length; j++) {
          let td = row.children[j];
          appendErrors(td, errors);
        }
      
      } else {
        /* No errors. Add line. */  
        window.location.replace('/' + model);
      }

    }).catch(function(err) {
      console.log(err);
    });
  };

  /* Function attached to existing line action event listener. */
  const statusEvent = function(event) {
    const row = event.currentTarget.parentNode.parentNode;
    const id = getId(row);

    /* Update line status, move to appropriate place in table. */
    const path = '/' + model + '/' + id;
    axios.put(path).then(function(response) {

      if (response.data.errors) {
        window.location.replace('/error/500');
      }

      window.location.replace('/' + model);

    }).catch(function(err) {
      console.log(err);
    });
  };

  const arrivalEvent = function(event) {
    const row = event.currentTarget.parentNode.parentNode;
    const id = getId(row);

    /* Update line status, move to appropriate place in table. */
    const path = '/' + model + '/stock/' + id;
    axios.put(path).then(function(response) {

      if (response.data.errors) {
        window.location.replace('/error/500');
      }

      window.location.replace('/' + model);

    }).catch(function(err) {
      console.log(err);
    });
  };

  const expandEvent = function(event) {
    let button = event.currentTarget;
    let tr = button.parentNode.parentNode;
    let detailsRow = tr.nextElementSibling;
    let classes = detailsRow.className.split(' ');

    if (classes.length === 3) { // visible
      button.src = '/images/expand.png';
      classes.pop();
      detailsRow.className = classes.join(' ');
      return;
    }

    const id = getId(tr);
    const path = '/' + model + '/details/' + id;
    axios.get(path).then(function(response) {

      if (response.data.errors) {
        window.location.replace = '/error/500';
        return;
      }

      button.src = '/images/minimize.png';
      classes.push('show');
      detailsRow.className = classes.join(' ');
      let div = detailsRow.firstElementChild;
      let data = response.data.details;
      
      let table = document.createElement('table');
      let thead = document.createElement('thead');
      let tr = document.createElement('tr');
      let titles = Object.keys(data[0])

      for (let j = 0; j < titles.length; j++) {
        let th = document.createElement('th');
        let title = document.createTextNode(titles[j]);
        th.appendChild(title);
        tr.appendChild(th);
      }
      thead.appendChild(tr);
      table.appendChild(thead);

      let tbody = document.createElement('tbody');
      for (let i = 0; i < data.length; i++) {
        tr = document.createElement('tr');
        console.log(data[i]);
        for (let j = 0; j < titles.length; j++) {
          let td = document.createElement('td');
          console.log(titles[j]);
          console.log(data[i][titles[j]]);
          let text = document.createTextNode(data[i][titles[j]]);
          td.appendChild(text);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      
      div.appendChild(table);

    }).catch(function(err) {
      console.log(err);
    });
  };

  const showWaitMessage = function(event) {
    let bar = document.getElementById('message-bar');
    bar.style.visibility = 'visible';
    setTimeout(function() {
      bar.style.visibility = 'hidden';
    }, 6000);
  };

  /* Register event to each row representing existing line items. */
  const td = tbody.firstElementChild.firstElementChild;
  let startVal = 0;
  if (td.className.split(' ')[1] === 'add') {
    /* POST to create new. */
    actions[0].addEventListener('click', createEvent);
    startVal = 1;
  }
  for (let i = startVal; i < actions.length; i++) {
    actions[i].addEventListener('click', statusEvent);
    expand[i].addEventListener('click', expandEvent);
    printQr[i].addEventListener('click', showWaitMessage);
    stock[i].addEventListener('click', arrivalEvent);
  }

});