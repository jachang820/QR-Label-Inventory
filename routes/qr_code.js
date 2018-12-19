const express = require('express');
const router = express.Router();
const api = require('./api');
const qr = require('qr-image');

router.use('/api', api);

/* GET random QR code generation for testing. */
router.get('/generate', function(req, res, next) {

	// generate random UUID
	var arr = [8, 4, 4, 4, 12].map(function(term) {
		return Math.random().toString(16).substring(2, term + 2);
	});
	var arr_string = arr.join('-');

	// generate QR
	var qrcode = qr.image(arr_string);
	//res.setHeader('Content-type', 'image/png');
	//qrcode.pipe(res);
  res.render('generate', { qr: qrcode });
});


module.exports = router;
