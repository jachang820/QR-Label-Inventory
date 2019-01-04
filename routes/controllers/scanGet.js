const qr = require('qr-image');

/* Show the scan page. */
module.exports = (req, res, next) => {
	text = "http://holoshield.net/a/AA1234";
	const img = qr.imageSync(text, { margin: 1, size: 4 });
	const str = "data:image/png;base64," + img.toString('base64');
	res.locals.qr = str;

  res.render('scan');
};