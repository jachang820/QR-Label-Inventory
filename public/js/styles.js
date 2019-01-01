window.addEventListener('load', function() {

  let showErrors = document.getElementById('show-error');
  let styleFilter = { color: 'active-colors', size: 'active-size' };

  /* Select all three radios of either color or size. */
  function selectFilter(type) {
    return document.getElementsByClassName('filter ' + type);
  }
  
  /* Select list of color or size. */
  function selectList(type) {
    return document.getElementsByClassName('list ' + type)[0];
  }

  /* Select button to update color or size. */
  function selectButton(type) {
    return document.getElementsByClassName('btn ' + type)[0];
  }

  /* Deselect all names in a list. */
  function deselect(type) {
    let stylesList = selectList(type);
    for (let i = 0; i < stylesList.length; i++) {
      stylesList[i].selected = false;
    }
  }

  /* Returns the selected names in the list. */
  function selectedStyles(type) {
    let stylesList = selectList(type);
    let styles = [];
    for (let i = 0; i < stylesList.length; i++) {
      if (stylesList[i].selected) {
        styles.push(stylesList[i].value);
      }
    }
    return styles;
  }

  /* Pick the corresponding names to show in the list. */
  function showStyles(type, showActive, showInactive) {
    let actives = document.getElementsByClassName('active ' + type);
    let inactives = document.getElementsByClassName('inactive ' + type);

    [].forEach.call(actives, function(e) {
      e.style.display = showActive ? 'block' : 'none';
    });
    [].forEach.call(inactives, function(e) {
      e.style.display = showInactive ? 'block' : 'none';
    });
  }

  /* Register event handler for radios that filter list for either
     all, active, or inactive styles. */
  function registerFilters(type) {

    [].forEach.call(selectFilter(type), function(e) {
      e.addEventListener('change', function() {

        /* Deselect all names when selecting a different filter.
           This avoids confusion of not seeing the styles previously
           selected. */
        deselect(type);

        /* Update names only if radio is checked. */
        if (e.checked) {
          styleFilter[type] = e.id;
          if (e.id == 'all-' + type + 's') {
            showStyles(type, true, true);
            
          } else if (e.id == 'active-' + type + 's') {
            showStyles(type, true, false);

          } else {
            showStyles(type, false, true);

          }
        }
      });
    });
  }

  /* Register event handler for buttons that toggle active status. 
     Style names not associated with any items will be deleted. */
  function registerButton(type) {
    let btn = selectButton(type);
    btn.addEventListener('click', function() {

      /* Disable button to prevent duplicate clicks. */
      btn.disabled = true;

      /* Parameters to send to back-end include a list of selected
         styles and the selected radio, in case we want to retain
         that setting. */
      params = {
        names: selectedStyles(type),
        selectFilter: styleFilter[type]
      };

      /* Re-enable button and send AJAX request. */
      axios.put('/styles/' + type, params).then(function(response) {
        btn.disabled = false;
        window.location.replace('/styles');

      }).catch(function(err) {
        btn.disabled = false;
        showErrors.innerHTML = "<ul><li>Error submitting selected " + 
          type + "s to database.</li></ul>";
      })
    })
  }

  showStyles('color', true, false);
  showStyles('size', true, false);

  registerFilters('color');
  registerFilters('size');

  registerButton('color');
  registerButton('size');

});


