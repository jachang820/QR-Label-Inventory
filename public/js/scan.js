window.addEventListener('load', function() {

	const readyText = {
		true: "READY TO SCAN",
		false: "CLICK HERE TO START SCANNING"
	};
	let scanTarget = document.getElementById('scan-target');
	let instructions = document.getElementById('instructions');
	let scanInput = document.getElementById('scan-input');
	let statusField = document.getElementById('status');
	let ready = false;
	instructions.innerText = readyText['false'];
	scanInput.value = "";

	scanTarget.addEventListener('click', function(event) {
		instructions.innerText = readyText['true'];
		ready = true;
		scanInput.focus();
		event.stopPropagation();
	});

	document.body.addEventListener('click', function() {
		instructions.innerText = readyText['false'];
		scanInput.blur();
		ready = false;
	});

	window.addEventListener('blur', function() {
		instructions.innerText = readyText['false'];
		scanInput.blur();
		ready = false;
	})

	scanInput.addEventListener('input', function(e) {
		let text = scanInput.value;
		setTimeout(function() {
			let query = text.split('/');
			if (query.length > 1) {
				let params = { qr: text, id: query[query.length - 1]};

				axios.post('/scan', params).then(function(response) {
					if (response.data.error) {
						statusField.innerHTML = response.data.error;
					} else {
						statusField.innerHTML = "<img src='" + response.data.qr + 
							"'><p>" + response.data.id + "</p>";
					}

					scanInput.value = "";
					scanInput.focus();
				
				}).catch(function(err) {
					statusField.innerHTML = err.stack;
					scanInput.value = "";
					scanInput.focus();
				});
			} else {
				scanInput.value = "";
				statusField.innerHTML = "Invalid input: " + text;
				scanInput.focus();
			}

		}, 500);
		
	});

});