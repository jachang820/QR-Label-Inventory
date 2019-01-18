/* Convert auto-incremented integer ID into a more compact serial
   for use on small labels. The serial field is a 6-digit base-36
   [0-9, A-Z] representation of the integer ID. */
module.exports = (id) => {
	const MAX_DIGIT = 6;
	let numId = parseInt(id);
	let serial = "";
	let digit;
	for (let i = 0; i < MAX_DIGIT; i++) {

		if (numId === 0) {
			serial = "0".repeat(MAX_DIGIT - i) + serial;
			break;
		}

		digit = numId % 36;
		if (digit > 9) {
			digit = String.fromCharCode(55 + digit);
		} else {
			digit = digit.toString();
		}
		serial = digit + serial;
		numId = Math.floor(numId/36);
	}

	return serial;
};