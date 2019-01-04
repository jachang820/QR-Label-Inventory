const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const qr = require('qr-image');
const setupAxios = require('../../helpers/setupAxios');

module.exports = [

	body('id').isAlphanumeric()
		.withMessage("Must be valid id."),

	sanitizeBody('id').trim().escape(),
	sanitizeBody('qr').trim().escape(),

	(req, res, next) => {
		const axios = setupAxios();
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({ error: errors.array() });
		} else {
			const img = qr.imageSync(req.body.qr, { margin: 1, size: 4 });
			const str = "data:image/png;base64," + img.toString('base64');

			let items;
			axios.post('/scan/out/' + req.body.id).then((response) => {
				items = response.data;
				let html = "";
				html += `      <tr>\n`;
				html += `        <td>${items.id}</td>\n`;
				html += `        <td>${items.status}</td>\n`;
				html += `        <td>${items.ColorName}</td>\n`;
				html += `        <td>${items.SizeName}</td>\n`;      
				html += `        <td>${items.createdAt}</td>\n`;
				html += `        <td>${items.CustomerOrder.createdAt}</td>\n`;
				html += `        <td>${items.CustomerOrder.label}</td>\n`;
				html += `        <td>${items.CustomerOrder.id}</td>\n`;
				html += `      </tr>\n`;

				return res.json({ qr: str, html: html });
			}).catch((err) => {
				err.custom = 'Error retrieving item' + req.body.id + '.';
				return res.json({ error: err });
			})
		}
	}

];