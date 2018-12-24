window.addEventListener('load', function() {

	var color_selectors = document.getElementsByName('filter_colors');
	var active_colors = document.getElementsByClassName('active_colors');
	var inactive_colors = document.getElementsByClassName('inactive_colors');

	color_selectors.forEach(function(e) {
		var val = e.getAttribute('value');
		e.addEventListener('change', function() {
			if (e.checked) {
				if (val == 'all_colors') {
					[].forEach.call(active_colors, function(color) {
						color.style.display = 'block';
					});
					[].forEach.call(inactive_colors, function(color) {
						color.style.display = 'block';
					});
				} else if (val == 'active_colors') {
					[].forEach.call(active_colors, function(color) {
						color.style.display = 'block';
					});
					[].forEach.call(inactive_colors, function(color) {
						color.style.display = 'none';
					});
				} else {
					[].forEach.call(active_colors, function(color) {
						color.style.display = 'none';
					});
					[].forEach.call(inactive_colors, function(color) {
						color.style.display = 'block';
					});
				}
			}
		});
	});

});
	