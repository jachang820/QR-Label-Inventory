/* List all elements of a model. */
window.addEventListener('load', function() {

  let tbody = document.getElementById('list-body');
  const model = document.getElementById('model-name').textContent;
  const page = parseInt(document.getElementById('page-input').value);
  let enableActions = true;

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

      /* Get input data depending on type of input element. */
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

  /* Parse id from row classes. */
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
  const appendErrors = function(col, errors, strict = true) {
    /* Empty the corresponding error list. */
    let errList = col.getElementsByTagName('ul')[0];
    if (errList) {
      empty(errList);

      /* Find relevant errors and add to cell. */
      let field = col.className.split(' ')[0];
      for (let k = 0; k < errors.length; k++) {
        if (errors[k].param == field || !strict) {
          let li = document.createElement('li');
          li.textContent = errors[k].msg;
          errList.appendChild(li);
        }
      }
    }
  };

  /* Add errors to each column. */
  const appendErrorsForEach = function(errors, row) {
    for (let j = 2; j < row.children.length; j++) {
      let td = row.children[j];
      appendErrors(td, errors);
    }
  };

  /* Construct query string part of url. */
  const buildQueryString = function(instructions = {}) {
    let query = [];
    let dirIcon = document.getElementsByClassName('asc')[0] ||
                  document.getElementsByClassName('desc')[0];

    /* Check for default setting and remove sort if so. */
    if (instructions.desc !== 'default') {
      /* New sort instructions given. */
      if ('sort' in instructions) {
        query.push('sort=' + instructions.sort);
      
      /* No new instructions, use current settings. */
      } else if (dirIcon) {
        let th = dirIcon.parentNode;
        query.push('sort=' + th.classList.item(0));
      }

      /* New sort direction instructions given. */
      if ('desc' in instructions) {
        query.push('desc=' + instructions.desc);  
      
      /* No new instructions, get current settings. */
      } else if (dirIcon) {
        /* Cycle through settings. */
        if (dirIcon.className === 'desc') {
          query.push('desc=true');
        } else {
          query.push('desc=false');
        }
      }
    }

    /* Build pagination options. */
    if ('page' in instructions) {
      /* Next page. */
      if (instructions.page === "+") {
        query.push('page=' + (page + 1));

      /* Previous page. */
      } else if (instructions.page === "-") {
        query.push('page=' + (page - 1));

      /* Specified page. */
      } else {
        query.push('page=' + instructions.page);
      }

    /* No new instructions, use current settings. */
    } else {
      query.push('page=' + page);
    }

    /* Retrieve filters already applied. */
    let pastFilters = document.getElementsByClassName('past-filters');
    let filters = {};
    for (let i = 0; i < pastFilters.length; i++) {
      const text = pastFilters[i].childNodes[0].nodeValue.trim();
      const pair = text.split(' = ');
      if (pair.length === 2) {
        filters['filter-' + pair[0]] = pair[1];
      }
    }

    /* Build filter options */
    let keys = Object.keys(instructions);
    for (let i = 0; i < keys.length; i++) {
      /* Find filter instructions. */
      if (keys[i].startsWith('filter-')) {
        let value = instructions[keys[i]];

        /* Join date array with comma separator. */
        if (Array.isArray(instructions[keys[i]])) {
          value = instructions[keys[i]].join(',');
        }

        /* Filter previously used, ignore previous setting. */
        if (filters.hasOwnProperty(keys[i])) {
          delete filters[keys[i]];
        }

        /* Add new instruction.
           Empty instructions are ignored, and effectively
           removes the key-value pair, since previous
           settings are deleted. */
        if (value !== '') {
          query.push(keys[i] + '=' + value);
        }
      }
    }

    /* Apply previous filters. */
    keys = Object.keys(filters);
    for (let i = 0; i < keys.length; i++) {
      query.push(keys[i] + '=' + filters[keys[i]]);
    }

    /* encodeURI converts whitespaces into %20, etc. */
    return '?' + encodeURI(query.join('&'));
  };

  /* Function attached to new line item event listener. */
  const createEvent = function(event) {
    let row = event.currentTarget.parentNode.parentNode;
    let line = getNewItem(row);

    axios.post('/' + model, line).then(function(response) {
      /* Errors found. Append errors to respective cell. */
      if (response.data.errors) {

        /* Uncaught, unformatted errors. */
        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        /* Display all errors. */
        const errors = response.data.errors;
        appendErrorsForEach(errors, row);
      
      } else {
        /* No errors. Add line. */  
        const querystring = buildQueryString();
        window.location.replace('/' + model + querystring);
      }

    }).catch(function(err) {
      console.log(err);
    });
  };

  /* Function attached to existing line action event listener. */
  const statusEvent = function(event) {
    const row = event.currentTarget.parentNode.parentNode;
    const id = getId(row);
    if (!enableActions) return;
    else enableActions = false;

    /* Update line status, move to appropriate place in table. */
    const path = '/' + model + '/' + id;
    axios.put(path).then(function(response) {
      if (response.data.errors) {
        /* Uncaught, unformatted errors. */
        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        /* Display all errors. */
        const errors = response.data.errors;
        const errBox = document.getElementById('items-box');

        appendErrors(errBox, errors);
        enableActions = true;
      
      } else {
        /* No errors. Add line. */
        const querystring = buildQueryString();
        window.location.replace('/' + model + querystring);
      }

    }).catch(function(err) {
      console.log(err);
      enableActions = true;
    });
  };

  /* Receive an order to mark it as In Stock. */
  const arrivalEvent = function(event) {
    const row = event.currentTarget.parentNode.parentNode;
    const id = getId(row);
    if (!enableActions) return;
    else enableActions = false;

    /* Update line status, move to appropriate place in table. */
    const path = '/' + model + '/stock/' + id;
    axios.put(path).then(function(response) {

      if (response.data.errors) {

        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        const errors = response.data.errors;
        appendErrorsForEach(errors, row);
        enableActions = true;
      
      } else {
        /* No errors. Add line. */
        const querystring = buildQueryString();
        window.location.replace('/' + model + querystring);
      }

    }).catch(function(err) {
      console.log(err);
      enableActions = true;
    });
  };

  /* Expand details for a record. */
  const expandEvent = function(event) {
    let button = event.currentTarget;
    let tr = button.parentNode.parentNode;
    let detailsRow = tr.nextElementSibling;
    let classes = detailsRow.classList;

    /* Hide details if already expanded. */
    if (detailsRow.classList.length === 3) {
      button.src = '/images/expand.png';
      detailsRow.classList.remove('show');
      return;
    } else {
      /* No errors. Show details. */  
      button.src = '/images/minimize.png';
      detailsRow.classList.add('show');
      if (detailsRow.firstElementChild.textContent.length > 0) {
        return;
      }
    }

    /* Get details data. */
    const id = getId(tr);
    const path = '/' + model + '/details/' + id;
    axios.get(path).then(function(response) {

      if (response.data.errors) {
        /* Uncaught, unformatted errors. */
        if (response.data.errors === 'unknown') {
          window.location.replace('/error/500');
        }

        /* Display all errors. */
        const errors = response.data.errors;
        appendErrorsForEach(errors, row);
      
      } else {
        let data = response.data.details;
        if (data === undefined || data.length === 0) {
          return;
        }

        let div = detailsRow.firstElementChild;
        
        /* Build html table to display details. */
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        let titles = Object.keys(data[0])

        /* Add each column title. */
        for (let j = 0; j < titles.length; j++) {
          let th = document.createElement('th');
          let title = document.createTextNode(titles[j]);
          th.appendChild(title);
          tr.appendChild(th);
        }
        thead.appendChild(tr);
        table.appendChild(thead);

        /* Add each record. */
        let tbody = document.createElement('tbody');
        for (let i = 0; i < data.length; i++) {
          tr = document.createElement('tr');

          /* Add columns per row. */
          for (let j = 0; j < titles.length; j++) {
            let td = document.createElement('td');
            let text = data[i][titles[j]];

            /* Check if field is an ISO-8601 date string. 
               Convert to m/d/yyyy. */
            const textDate = new Date(text).toLocaleString();
            if (textDate !== "Invalid Date" && 
                typeof text !== 'number') {
              text = textDate.split(',')[0];
            }
            text = document.createTextNode(text);
            td.appendChild(text);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        
        div.appendChild(table);
      }

    }).catch(function(err) {
      console.log(err);
    });
  };

  /* Sort records by clicking on column headers. */
  const sortEvent = function(event) {
    const link = event.currentTarget;
    let sort = link.parentNode.classList.item(0);
    const dir = link.parentNode.lastElementChild.className;

    /* Cycle through settings. */
    let desc;
    if (dir === 'none') desc = "false";
    else if (dir === 'asc') desc = "true";
    else if (dir === 'desc') desc = "default";
    else return;

    /* Give instructions to build querystring. */
    let instructions = {};
    if (sort) instructions.sort = sort;
    if (desc) instructions.desc = desc;
    const path = '/' + model + buildQueryString(instructions);
    return window.location.replace(path);
  };

  /* Open notes in modal. */
  const notesEvent = function(event) {
    let notes = event.currentTarget.nextElementSibling;
    notes.style.display = 'block';
    return;
  };

  /* Close notes modal. */
  const notesCloseEvent = function(event) {
    event.currentTarget.parentNode.style.display = 'none';
    return;
  };

  /* Show explanation bubble by hovering over elements. */
  const explainEvent = function(event) {
    /* Show explanation if it exists. */
    let explain = event.currentTarget.nextElementSibling;
    if (explain.className === 'explain') {
      explain.style.display = "block";
      /* Determine bubble position. */
      const source = event.currentTarget.getBoundingClientRect();
      const sourceRight = Math.floor(source.right);
      const sourceTop = Math.floor(source.top);

      const target = explain.getBoundingClientRect();
      const targetHeight = Math.floor(target.top - target.bottom);

      explain.style.left = (sourceRight - 5) + 'px';
      explain.style.top = (sourceTop + targetHeight) + 'px';
    }
    return;
  };

  /* Close explanation on mouse out. */
  const explainCloseEvent = function(event) {
    let explain = event.currentTarget.nextElementSibling;
    /* Hide explanation. */
    if (explain.className === 'explain') {
      explain.style.display = 'none';
    }
    return; 
  };

  /* Open filter menu if closed. Otherwise, close menu. */
  const filterToggleEvent = function(event) {
    let filterHead = document.getElementById('filter-head');
    let filter = filterHead.firstElementChild.firstElementChild;
    const display = filter.style.display;
    if (!display || display === 'none') {
      filter.style.display = 'table-cell';
    } else {
      filter.style.display = 'none';
    }
    return;
  };

  /* Display selected filter from select box. */
  const selectFilterEvent = function(event) {
    const column = event.currentTarget.value;
    let active = document.getElementById('filter-' + column);
    let prev = document.getElementsByClassName('active-filter')[0];
    
    /* Hide previously selected filter. */
    prev.classList.remove('active-filter');
    prev.classList.add('filter');

    /* Show new filter. */
    active.classList.remove('filter');
    active.classList.add('active-filter');
    return;
  };

  /* Filter the results. */
  const filterEvent = function(event) {
    let active = document.getElementsByClassName('active-filter')[0];
    let filters = active.children;

    let instructions = {};
    let value = '';
    /* All data types have one input except date. */
    if (filters.length === 1) {
      /* Get data depending on input type. */
      if (filters[0].tagName.toLowerCase() === 'input') {
        value = filters[0].value.trim();
      } else {
        const index = filters[0].selectedIndex;
        value = filters[0].options[index].value;
      }

    /* Format dates. */
    } else {
      /* Offset between local timezone and UTC. */
      const offset = new Date().getTimezoneOffset() * 60 * 1000;

      /* Number of milliseconds in a day. */
      const dayOffset = 24 * 60 * 60 * 1000 - 1;

      /* Convert local timezone to UTC for start date. */
      let startDate = new Date(filters[0].value);
      startDate = new Date(startDate.getTime() + offset);

      /* If end date not entered, end of the date range is given
         as one millisecond before the next day. */
      let endDate;
      if (filters[1].disabled || filters[1].value === '' ||
          filters[0].value === filters[1].value) {
        endDate = new Date(startDate.getTime() + dayOffset);

      /* If end date is entered, end of the date range is given
         as one millisecond before the day after the end date. */
      } else {
        endDate = new Date(filters[1].value);
        endDate = new Date(endDate.getTime() + offset + dayOffset);
      }

      /* Convert each date to ISO-8601 for database storage. */
      value = [startDate.toISOString(), endDate.toISOString()];
    }

    /* Add filter only if value entered. */
    if (value) instructions[active.id] = value;

    /* Reset page number. */
    instructions.page = 1;

    /* Apply filter. */
    const querystring = buildQueryString(instructions);
    window.location.replace('/' + model + querystring);
    return;
  };

  /* Pressing enter on filter field should go to next field if date,
     or submit. Pressing enter on add field should trigger create. */
  const EnterEvent = function(event) {
    /* Mouse cursor must be in a filter input element. */
    let active = document.activeElement;
    if (active.tagName.toLowerCase() === 'input' &&
        active.parentNode.className === 'active-filter' &&
        event.keyCode === 13) {

      /* Go to next field if date, else submit. */
      event.preventDefault();
      if (active.className === 'filter-start-date') {
        active.nextElementSibling.focus();
      } else {
        filterEvent();
      }

    } else if (active.parentNode.classList.item(1) === 'add' &&
               event.keyCode === 13) {
      event.preventDefault();
      let dummyEvent = {};
      dummyEvent.currentTarget = event.target;
      createEvent(dummyEvent);
    }
  };

  /* Remove filters by x'ing the filter bubble. */
  const removeFilterEvent = function(event) {
    const text = event.currentTarget.parentNode.textContent;
    const key = 'filter-' + text.split(' = ')[0];
    let instructions = {};
    instructions[key] = '';
    const querystring = buildQueryString(instructions);
    window.location.replace('/' + model + querystring);
    return;
  };

  /* Enable end date if start date selected. */
  const dateRangeEvent = function(event) {
    const startDate = event.currentTarget;
    let endDate = startDate.nextElementSibling;
    endDate.disabled = false;
    endDate.min = startDate.value;
    return;
  };

  /* Go to indicated page. */
  const goToPageEvent = function(event) {
    let page = document.getElementById('page-input').value;
    return window.location.replace(
      '/' + model + buildQueryString({ page: parseInt(page) })
    );
  };

  /* Show a message on the bottom of the page. */
  const showWaitMessage = function(event) {
    let bar = document.getElementById('message-bar');
    bar.style.visibility = 'visible';
    setTimeout(function() {
      bar.style.visibility = 'hidden';
    }, 4000);
  };

  /* Format date fields to m/d/yyyy from ISO-8601. */
  const formatDateElements = function() {
    let header = document.getElementById('list-head');
    let titles = header.firstElementChild.children;
    let dates = [];

    /* Figure out which columns are dates by looking at the classes
       in the header. */
    for (let i = 0; i < titles.length; i++) {
      const columnName = titles[i].classList.item(0);
      const type = titles[i].classList.item(1);
      if (type === 'date' || type === 'dateonly') {
        dates.push({ name: columnName, type: type });
      }
    }

    /* Each date column. */
    for (let i = 0; i < dates.length; i++) {
      const dateValues = document.getElementsByClassName(dates[i].name);

      /* Each row with a date. */
      for (let j = 0; j < dateValues.length; j++) {
        /* Get date values. */
        const text = dateValues[j].textContent.trim();

        /* Convert to date string m/d/yyyy, h:m:s AM/PM. */
        const textDate = new Date(text).toLocaleString('en-US');

        /* Replace values with m/d/yyyy part. */
        if (textDate !== "Invalid Date") {
          if (dates[i].type === 'date') {
            dateValues[j].textContent = textDate;
          } else {
            dateValues[j].textContent = textDate.split(',')[0];
          }
        }
      }
    }
  };

  /* Add event listener for all elements of a class. */
  const addActions = function(actionClass, event, eventFun, startVal = 0) {
    let actions = document.getElementsByClassName(actionClass);
    for (let i = startVal; i < actions.length; i++) {
      actions[i].addEventListener(event, eventFun);
    }
  };

  /* Add explanation bubble events for a class. */
  const addExplainers = function(actionClass) {
    addActions(actionClass, 'mouseover', explainEvent);
    addActions(actionClass, 'mouseout', explainCloseEvent);
  }

  /* Register event to each row representing existing line items. */
  const tr = tbody.firstElementChild;
  if (tr) {
    const td = tr.firstElementChild;
    let startVal = 0;

    /* First row is create new. */
    if (td.className.split(' ')[1] === 'add') {
      let newAction = document.getElementsByClassName('action-icon')[0];
      newAction.addEventListener('click', createEvent);
      startVal = 1;
    }

    /* Add event listeners for existing item rows. */
    addActions('action-icon', 'click', statusEvent, startVal);
    addActions('action-icon', 'click', showWaitMessage, startVal);
    addActions('print-qr', 'click', showWaitMessage);
    addActions('expand', 'click', expandEvent);
    addActions('stock', 'click', arrivalEvent);
    addActions('notes-icon', 'click', notesEvent);
    addActions('notes-close-btn', 'click', notesCloseEvent);
    addExplainers('action-icon');
    addExplainers('busy');
    addExplainers('print-qr');
    addExplainers('expand');
    addExplainers('stock');
  
  }

  /* Add event listeners for elements outside of the rows. */
  addActions('sort-link', 'click', sortEvent);
  addActions('filter-icon', 'click', filterToggleEvent);
  addActions('filter-start-date', 'change', dateRangeEvent);
  addActions('remove-filter', 'click', removeFilterEvent);
  addExplainers('sort-link');
  addExplainers('filter-icon');
  addExplainers('remove-filter');

  /* Set up next page and previous page links. */
  const priorUrl = '/' + model + buildQueryString({ page: "-" });
  const afterUrl = '/' + model + buildQueryString({ page: "+" });

  let priorPage = document.getElementById('prior-page');
  if (priorPage) priorPage.href = priorUrl;
  let afterPage = document.getElementById('after-page');
  if (afterPage) afterPage.href = afterUrl;

  /* Set up page button. */
  let pageButton = document.getElementById('page-button');
  pageButton.addEventListener('click', goToPageEvent);

  /* Set up filter select box. */
  let filterSelect = document.getElementById('filter-select');
  filterSelect.addEventListener('change', selectFilterEvent);

  /* Select and show first column for filtering (usually id). */
  filterSelect.selectedIndex = 0;
  let activeFilter = document.getElementsByClassName('filter')[0];
  activeFilter.classList.remove('filter');
  activeFilter.classList.add('active-filter');

  /* Set up filter submission button. */
  let filterButton = document.getElementById('filter-button');
  filterButton.addEventListener('click', filterEvent);

  /* Format date fields in the table. */
  formatDateElements();

  /* If filter is active, go to next field or submit on enter key. */
  document.addEventListener('keypress', EnterEvent);

});