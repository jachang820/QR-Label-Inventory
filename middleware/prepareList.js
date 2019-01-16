/* Prepare resources for listAll. */
module.exports = (model) => {

	const modelUp = model.charAt(0).toUpperCase() + model.substr(1);

	return [

		/* Track types of each field. */
		(req, res, next) => {
			const Models = require('../models')[modelUp];
			const types = {};

			for (key in res.locals[model][0]) {

				/* Ignore helper fields. */
				if (Models.rawAttributes[key] === undefined) {
					continue;
				}

				/* UUID fields should be hidden from user. */
				if (Models.rawAttributes[key].type.key === 'UUID') {
					continue;
				}

				/* Get field type and whether it's optional. */
				types[key] = {
					type: Models.rawAttributes[key].type.key,
					optional: Models.rawAttributes[key].allowNull
				};

				/* Field has references, so it's a foreign key. */
				if (Models.rawAttributes[key].references) {
					types[key].type = 'REFERENCE';
				}

				/* Assume mandatory if 'allowNull' undefined, as in the case
				   of primary keys. */
				if (types[key].optional === undefined) {
					types[key].optional = false;
				}

				switch(types[key].type) {
					/* Date fields we're concerned with are all populated with
					   current date. */
					case 'DATE':
						types[key].date = new Date().toDateString();
						types[key].optional = true;
						break;

					/* Assume an object exists from getModel()'s mapTo option
					   named with pattern (modelKey). */
					case 'REFERENCE':
						const ref = Models.rawAttributes[key].references;
						const refModel = ref.model.toLowerCase();
						const upperKey = ref.key.charAt(0).toUpperCase() +
														 ref.key.substr(1);
						const name = refModel + upperKey;
						
						/* Remove inactive elements from dropdown. */
						const mapList = res.locals[name];
						types[key].select = [];
						for (let i = 0; i < mapList.length; i++) {
							if (res.locals[refModel][i].active) {
								types[key].select.push(mapList[i]);
							}
						}
						break;

					/* Get all the options of an enum field. */
					case 'ENUM':
						types[key].select = Models.rawAttributes[key].values;
				}
			}
			res.locals[model].push(types);
			return next();
		},

	  /* Convert active/used into states. */
		(req, res, next) => {
			let models = res.locals[model];
			for (let i = 0; i < models.length - 1; i++) {
				if (models[i].active && !models[i].used) {
					models[i].useState = 'new';
				} else if (models[i].active && models[i].used) {
					models[i].useState = 'used';
				} else if (!models[i].active && models[i].used) {
					models[i].useState = 'inactive';
				} else {
					models[i].useState = 'none';
				}
				delete models[i].active;
				delete models[i].used;
			}
			delete models[models.length - 1].active;
			delete models[models.length - 1].used;
			res.locals[model] = models;
			return next();
		},

		/* Format createdAt to date only. Delete updatedAt. */
		(req, res, next) => {
			let models = res.locals[model];
			for (let i = 0; i < models.length - 1; i++) {
				models[i].createdAt = (new Date(models[i].createdAt)).toDateString();
				delete models[i].updatedAt;
			}
			delete models[models.length - 1].updatedAt;
			res.locals[model] = models;
			return next();
		},

		/* Remove UUID fields. */
		(req, res, next) => {
			let models = res.locals[model];
			const Models = require('../models')[modelUp];
			for (let i = 0; i < models.length - 1; i++) {
				for (key in models[i]) {
					const attr = Models.rawAttributes[key];

					if (attr && attr.type.key === 'UUID') {
						delete models[i][key];
					}
				}
			}
			return next();
		},

		/* Rename some fields. */
		(req, res, next) => {
			let models = res.locals[model];
			for (let i = 0; i < models.length; i++) {
				if (models[i].ColorName !== undefined) {
					models[i].color = models[i].ColorName;
					delete models[i].ColorName;
				}
				if (models[i].SizeName !== undefined) {
					models[i].size = models[i].SizeName;
					delete models[i].SizeName;
				}
				if (models[i].outerSize !== undefined) {
					models[i].masterSize = models[i].outerSize;
					delete models[i].outerSize;
				}
				if (models[i].createdAt !== undefined) {
					models[i].created = models[i].createdAt;
					delete models[i].createdAt;
				}

			}
			res.locals[model] = models;
			return next();
		},

		/* Create types object. */
		(req, res, next) => {
			res.locals.types = res.locals[model].pop();
			return next();
		},

		/* Create list object. */
		(req, res, next) => {
			res.locals.list = res.locals[model];
			delete res.locals[model];
			return next();
		}

	];
};