/* List all elements of a model. */
window.addEventListener('load', function() {

  let actions = document.getElementsByClassName('action-icon');
  let printQr = document.getElementsByClassName('print-qr');
  let details = document.getElementsByClassName('expand');
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

  /* Remove all children nodes. */
  const empty = function(root) {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  };

  /* Give row a different status. */
  const reclassifyRow = function(row, status) {
    /* Make copy of row, change class name and action. */
    let newRow = row.cloneNode(true);
    newRow.className = status;
    let img = newRow.firstElementChild.firstElementChild;
    if (status === 'new') {
      img.src = '/images/remove.png';
    } else if (status === 'used') {
      img.src = 'images/hide.png';
    } else if (status === 'hidden') {
      img.src = 'images/restore.png';
    } else {
      img.remove();
    }

    /* Change class name for each column. */
    for (let j = 0; j < newRow.children.length; j++) {
      const field = newRow.children[j].className.split(' ')[0];
      newRow.children[j].className = [field, status].join(' ');
    }

    /* Insert before first of the category. */
    if (status === 'new') {
      tbody.insertBefore(newRow, tbody.firstElementChild.nextSibling);
    } else {
      const ref = document.getElementsByClassName(status)[0];
      tbody.insertBefore(newRow, ref);
    }

    /* Register event on new row. */
    if (img != undefined && img != null) {
      img.addEventListener('click', editEvent);
    }

    return newRow;
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

      /* No errors. Add line. */
      } else {
        let newState = response.data.added.state;
        let newRow = reclassifyRow(row, newState);
        for (let j = 2; j < newRow.children.length; j++) {
          let col = newRow.children[j];
          let field = col.className.split(' ')[0];

          /* Erase any errors. */
          appendErrors(row.children[j], []);

          /* Write new line item to each column. */
          col.textContent = response.data.added[field];

          /* Erase input data. */
          let inData = row.children[j].firstElementChild;
          let inTag = inData.tagName.toLowerCase();
          if (inTag === 'input') {
            inData.value = "";
          } else if (inTag === 'select') {
            inData.selectedIndex = -1;
          }
        }
      }
      actions = document.getElementsByClassName('action-icon');
    }).catch(function(err) {
      console.log(err);
    });
  };

  /* Function attached to existing line action event listener. */
  const editEvent = function(event) {
    const row = event.currentTarget.parentNode.parentNode;
    const line = getItem(row);

    /* Update line status, move to appropriate place in table. */
    axios.put('/' + model, line).then(function(response) {

      if (response.data.errors === 'unknown') {
        window.location.replace('/error/500');
      }

      switch(row.className) {
        case 'used':
          reclassifyRow(row, 'hidden');
          break;

        case 'hidden':
          reclassifyRow(row, 'used');
          break;
      }

      /* Remove original row. */
      if (row.className !== 'eternal') {
        row.remove();
      }

      /* Rebuild rows with new index. */
      actions = document.getElementsByClassName('action-icon');
    }).catch(function(err) {
      console.log(err);
    });
  };

  /* POST to create new. */
  actions[0].addEventListener('click', createEvent);

  /* Register event to each row representing existing line items. */
  const td = tbody.firstElementChild.firstElementChild;
  let startVal = 0;
  if (td.className[1] === 'add') {
    startVal = 1;
  }
  for (let i = startVal; i < actions.length; i++) {
    actions[i].addEventListener('click', editEvent);
  }

  for (let i = 0; i < printQr.length; i++) {
    printQr[i].addEventListener('click', function(event) {
      let bar = document.getElementById('message-bar');
      bar.style.visibility = 'visible';
      setTimeout(function() {
        bar.style.visibility = 'hidden';
      }, 6000);
    });
  }

  for (let i = 0; i < details.length; i++) {
    details[i].addEventListener('click', function(event) {
      let modal = document.getElementById('details-modal');
      if (modal.style.visibility === 'hidden') {
        event.currentTarget.src = '/images/minimize.png';
        modal.style.visibility = 'visible';
        let table = document.createElement('table');

      } else {
        event.currentTarget.src = '/images/expand.png';
        while (modal.firstChild) {
          modal.removeChild(modal.firstChild);
        }
        modal.style.visibility = 'hidden';
      }
    })
  }

});