const qr = require('qr-image');

/* Show the scan page. */
module.exports = (req, res, next) => {
  res.render('scan');
};