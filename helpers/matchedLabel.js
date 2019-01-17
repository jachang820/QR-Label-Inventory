const express = require('express');

/* Compares scanned QR code against each label pattern to
   determine if format is matched.
   qrcode: STRING -- scanned url + id text
   labels: OBJECT -- returned from GET Labels call 

   RETURNS ID if prefix and style matches, otherwise null.
   Note that ID might not be valid even if URL matches. */
module.exports = (qrcode, labels) => {
	for (let i = 0; i < labels.length; i++) {
		let prefix = labels[i].prefix;
		const style = labels[i].style;

		/* QR code should start with one of the prefixes. */
		if (typeof qrcode !== 'string' || !qrcode.startsWith(prefix)) {
			continue;
		}

		const suffix = qrcode.slice(prefix.length);

		/* ID is the next term in the path, or the remaining part of
		   last term. */
		if (style === 'Path') {
			return suffix.split('/')[0];

		/* ID is in the querystring, with key='id'. */
		} else {
			/* Split suffix into path and querystring. */
			const parts = suffix.split('?');

			/* Querystring delimited by exactly one '?'. */
			if (parts.length === 1) {
				const querystring = parts[1];

				/* Split querystring into key/value pairs. */
				const pairs = suffix.split('&');

				/* Look for value with key='id'. */
				for (let j = 0; j < pairs.length; j++) {
					const pair = pairs[j].split('=');
					if (pair.length === 2 && pair[0] === 'id') { 
						if (pair[1].length > 0 && pair[1].length <= 12) {
							return pair[1];
						}
					}
				}
			}
		}
	}
	return null;
};