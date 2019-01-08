const express = require('express');
const router = express.Router();
const { Items, FactoryOrders, CustomerOrders, 
				Sizes } = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function sortQuery(sort, direction) {

	let sortOrder = [
		['ColorName', 'ASC'],
		['SizeName', 'ASC'],
		[FactoryOrders, 'createdAt', 'DESC'],
		[FactoryOrders, 'arrivedAt', 'ASC'],
		['outerbox', 'DESC'],
		['innerbox', 'DESC'],
		[CustomerOrders, 'createdAt', 'DESC'],
		['status', 'DESC']
	];

	let ind;
	if (sort === 'shippedAt') {
		ind = 6;
	} else {
		ind = sortOrder.findIndex((e) => 
			e[0] === sort || e[1] === sort);
	}

	let removed = sortOrder.splice(ind, 1)[0];
	removed[removed.length - 1] = direction;
	sortOrder.unshift(removed);

	return sortOrder;
}

function filterByItemId(id) {
	return { [Op.or]: [
		{ id: id },
    { innerbox: id },
    { outerbox: id }
  ]};
}

router.post('/view', async (req, res, next) => {

	let sortBy;
	try {
		sortBy = sortQuery(req.body.sort,
											 req.body.sortDirection);
	} catch(err) {
		next(err);
	}

	let filterBy = {};
	if (req.body.filter && req.body.filter.id) {
		filterBy = filterByItemId(req.body.filter.id);
	}

	try {
		let items = await Items.findAll({
			where: filterBy,
			include: [
				{ model: FactoryOrders }, 
				{ model: CustomerOrders },
				{ model: Sizes }
			],
			order: sortBy
		});

		return res.json(items);

	} catch (err) {
		console.log(err);
		return next(err);
	}
});

module.exports = router;