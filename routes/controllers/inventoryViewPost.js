
module.exports = [
	async (req, res, next) => {
		const axios = setupAxios();
		let response;
		try {
			response = await axios.post('/inventory/view', { 
				sort: 'ColorName',
				sortDirection: 'ASC'
			});
		} catch (err) {
			return next(err);
		}
		res.locals.items = response.data;
		return next();
	},

	(req, res, next) => {
		let items = res.locals.items;
		let outerPartition = 0;
		let innerPartition = 0;
		let orderPartition = 0;
		let lastOuter = items[0].outerBox;
		let lastInner = items[0].innerBox;
		let lastOrder = null;

		for (let i = 0; i < items.length; i++) {
			for (record in items[i]) {
				/* Flatten item object to make it easier to work with. */
				if (typeof items[i][record] === 'object') {
					for (key in items[i][record]) {
						items[i][`${record}_${key}`] = items[i][record][key];
					}
					delete items[i][record];
				}

				/* Partition master cartons. */
				if (items[i].outerBox !== lastOuter) {
					lastOuter = items[i].outerBox;
					lastInner = items[i].innerBox;
					outerPartition = (outerPartition + 1) % 2;
					innerPartition = 0;
				}
				items[i].outerPartition = outerPartition;

				/* Partition inner cartons. */
				let outerSize = items[i].Sizes_outerSize;
				if (items[i].innerBox !== lastInner) {
					lastInner = items[i].innerBox;
					innerPartition = (innerPartition + 1) % outerSize;
				}
				items[i].innerPartition = innerPartition;

				/* Partition customer orders. */
				if (items[i].CustomerOrders_id === null) {
					lastOrder = null;
					orderPartition = 0;
				} else if (items[i].CustomerOrders_id !== lastOrder) {
					lastOrder = items[i].CustomerOrders_id;
					orderPartition = (orderPartition + 1) % 10;
					if (orderPartition === 0) {
						orderPartition++;
					}
				}
				items[i].orderPartition = orderPartition;
			}
		}

		res.locals.items = items;
		return next();
	},

	(req, res, next) => {
		let html = "";
		let items = res.locals.items;
		for (let i = 0; i < items; i++) {
			let id = items[i].id;
			let innerPart = items[i].innerPartition;
			let outerPart = items[i].outerPartition;
			let orderPart = items[i].orderPartition;
			let innerId = items[i].innerBox;
			let outerId = items[i].outerBox;
			let orderId = items[i].CustomerOrders_id;
			html += `    <tr class="row-${id} inner-${innerPart}">\n`;
			html += `      <td<span role="button" class="item-details" id="details-${id}">View</a></td>\n`;
			html += `      <td class="hover mc-${outerPart}"><span class="hover-text">${outerId}</span></td>\n`;
			html += `      <td class="hover mc-${innerPart}"><span class="hover-text">${innerId}</span></td>\n`;
			html += `      <td class="hover mc-${orderPart}"><span class="hover-text">${orderId}</span></td>\n`;
			html += `      <td>${items[i].ColorName}</td>\n`;
			html += `      <td>${items[i].SizeName}</td>\n`;
			html += `      <td>${items[i].status}</td>\n`;
			html += `      <td>${items[i].createdAt}</td>\n`;
			html += `      <td>${items[i].FactoryOrders_arrivedAt}</td>\n`;
			html += `      <td>${items[i].CustomerOrders_createdAt}</td>\n`;
			html += `      <td>${items[i].CustomerOrders_label}</td>\n`;
			html += `    </tr>\n`;
		}
		res.locals.data = html;
		return next();
	},

	(req, res, next) => {
		let html = "";
		let items = res.locals.items;
		for (let i = 0; i < items; i++) {
			let id = items[i].id;
			html += `  <div class="show-details" id="show-${id}">\n`;
			html += `    <h4>Item Details <span class="status-details">${items[id].status}</span></h4>\n`;
			html += `    <p>Item ID: ${id}</p>\n`;
			html += `    <p>Inner Carton ID: ${items[i].innerbox}</p>\n`;
			html += `    <p>Master Carton ID: ${items[i].outerbox}</p>\n`;
			html += `    <p>Color: ${items[i].ColorName}</p>\n`;
			html += `    <p>Size: ${items[i].SizeName} <span class="size-details">`;
			html += `${items[i].Sizes_innerSize}/${items[i].Sizes_outerSize}</span></p>\n`;
			html += `    <p>QR Code: <br><img src="/qr/${items[i].qrcode}"</img></p>\n`;
			html += `    <div class="factory-details">\n`;
			html += `      <p>Order ID: ${items[i].FactoryOrders_id}</p>\n`;
			html += `      <p>Date Created: ${items[i].FactoryOrders_createdAt}</p>\n`;
			html += `      <p>Date Arrived: ${items[i].FactoryOrders_arrivedAt}</p>\n`;
			html += `      <p>Label: ${items[i].FactoryOrders_label}</p>\n`;
			html += `      <p>Notes: ${items[i].FactoryOrders_notes}</p>\n`;
			html += `    </div>\n`;
			if (items[i].CustomerOrders_id !== null) {
				html += `    <div class="customer-details">\n`;
				html += `      <p>Order ID: ${items[i].CustomerOrders_id}</p>\n`;
				html += `      <p>Date Shipped: ${items[i].CustomerOrders_createdAt}</p>\n`;
				html += `      <p>Label: ${items[i].CustomerOrders_label}</p>\n`;
				html += `      <p>Notes: ${items[i].CustomerOrders_notes}</p>\n`;
				html += `    </div>\n`;
			}
			html += `  </div>\n`;
		}
		res.locals.details = html;
		return next();
	},

	(req, res, next) => {
		let json = {
			data: res.locals.data,
			details: res.locals.details
		};
		return res.json(json);
	}
];