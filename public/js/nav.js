window.addEventListener('load', function() {

  let settings = document.getElementById('nav-settings');
  let settings_menu = document.getElementById('nav-settings-menu');

  settings.addEventListener('click', function(event) {
    settings.style.backgroundColor = '#0C4426';
    settings_menu.style.display = 'block';
    event.stopPropagation();
  });

  document.addEventListener('click', function() {
    settings.style.backgroundColor = '#0C7436';
    settings_menu.style.display = 'none';
  });

});