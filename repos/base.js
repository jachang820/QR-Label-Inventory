const to = require('./to');
const { sequelize } = require('../models');

class BaseRepo {

  constructor(Model, key) {
    this.Model = Model;

    /* Set primary key. */
    if (key) this.key = key;

    /* Set transaction for multiple queries. */
    this.tx = null;

    /* Cache recent queries. Useful in some cases. */
    this.cache = {};

    /* Associated repos. */
    this.assoc = null;

    /* Event logging. */
    if (this.Model.tableName !== 'Event') {
      const EventRepo = require('./event');
      this.events = new EventRepo();
    }
  }

  /* Sequelize options.
     Set 'offset' to 0 to turn off limiting. */
  async _list(options = {}, { eventId } = {}) {
    /* Looks for an extra record past the limit to determine
       last page. */
    if (options.offset === null || options.offset === undefined) {
      if (options.limit !== undefined) delete options.limit;
    } else {
      if (!options.limit) options.limit = 21;
      else options.limit += 1;
    }

    /* Get a list of records. */
    let models, err;
    [err, models] = await to(this.Model.findAll(options));
    if (err) this._handleErrors(err, { eventId });

    this.cache.list = models;
    if (!models) return [];
    else return models.map(e => e.get({ plain: true }));
  }

  /* Get a single record. */
  async _get(options, { eventId } = {}) {
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) this._handleErrors(err, { eventId });
    
    this.cache.get = model;
    if (!model) return null;
    else return model.get({ plain: true });
  }

  /* Create one or more records. */
  async _create(modelObj, { eventId } = {}) {
    let model, err;

    /* Use bulkCreate if an array of objects passed in. */
    if (Array.isArray(modelObj)) {
     [err, model] = await to(this.Model.bulkCreate(modelObj, {
      validate: true,
      individualHooks: true,
      returning: true
     }));
    } else {
      [err, model] = await to(this.Model.create(modelObj));  
    }
    if (err) this._handleErrors(err, { eventId });

    /* If no records found, return empty objet or null. */
    this.cache.create = model;
    if (!model || model.length === 0) {
      return Array.isArray(model) ? [] : null;
    } else {
      if (Array.isArray(model)) {
        return model.map(e => e.get({ plain: true }));
      } else {
        return model.get({ plain: true });
      }
    }
  }

  /* Generic update a column of a record. */
  async _update(query, options, { eventId } = {}) {
    /* Add option to return record instead of a count. */
    let ret, err;
    let opts = Object.assign({ returning: true }, options);

    /* Update selected record. */
    [err, ret] = await to(this.Model.update(query, opts));
    if (err) this._handleErrors(err, { eventId });
    let [count, models] = ret;

    /* Return updated record. */
    this.cache.update = models;
    return models.map(e => e.get({ plain: true }));
  }

  /* Mark a record as used, either because it has gained an 
     association (new => used), or a soft-deleted record has
     been reactivated (hidden => used). */
  async _use(options, used, { eventId } = {}) {
    const query = { hidden: false, used: used };
    return this._update(query, options, { eventId });
  }

  /* Delete a record, either permanently or soft-delete (hidden). */
  async _delete(options, permanent, { eventId } = {}) {
    /* Find the record that needs to be deleted. */
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) this._handleErrors(err, { eventId });
    
    /* Only records without any associations can be permanently
       deleted. */
    let destroyOpts;
    if (!model.used && permanent) {
      [err] = await to(model.destroy());
    } else {
      [err] = await to(model.update({ hidden: true }));
    }
    
    /* Return deleted record. */
    this.cache.delete = model;
    if (!model) return null;
    else {
      return model.get({ plain: true });
    }
  }

  /* Count number of records. */
  async count(where) {
    let key = this.getPK();
    let query = {
      attributes: [[sequelize.fn('COUNT', sequelize.col(key)), 'count']]
    };
    if (where) query.where = where;
    let model, err;
    [err, model] = await to(this.Model.findAll(query));
    return parseInt(model[0].get({ plain: true }).count); 
  }

  /* Determine if a record is active. */
  async active(id, { eventId } = {}) {
    /* If soft-delete isn't an option, all records are active. */
    if (this.Model.rawAttributes.hidden === undefined) {
      return true;
    }

    /* Get specified key or primary key. */
    let key = this.key || this.cache.pk || this.getPK();
    /* Construct where clause to find value by key. */
    let options = { where: {} };
    options.where[key] = id;
    
    /* Get single record. */
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) this._handleErrors(err, { eventId });
    this.cache.active = model;

    /* Return true if record found has a hidden date. */
    if (!model) return null;
    else return !model.get({ plain: true }).hidden;
  }

  /* Get schema of model, including data type. Exclude specified
     columns from being returned. */
  _describe(exclude) {
    let columns = {};
    /* If one column is excluded, convert it to array. */
    if (!Array.isArray(exclude)) exclude = [exclude];
    for (let key in this.Model.rawAttributes) {
      /* Skip excluded columns. */
      const attr = this.Model.rawAttributes[key];
      if (exclude.includes(key)) {
        continue;
      }

      /* Get parameters of a column. */
      columns[key] = {};
      columns[key].type = attr.type.key.toLowerCase();
      columns[key].optional = attr.allowNull || false;
    }
    return columns;
  }

  /* Get primary key name by searching schema. */
  getPK() {
    for (let key in this.Model.rawAttributes) {
      const attr = this.Model.rawAttributes[key];
      if (attr.primaryKey) {
        this.cache.pk = key;
        return key;
      }
    }
  }

  /* Make a query within a transaction, or start a new transaction. */
  transaction(fun, transaction) {
    const tx = { transaction: transaction };
    if (transaction) {
      return sequelize.transaction(tx, fun)
        .catch(err => Promise.reject(err));
    } else {
      return sequelize.transaction(fun)
        .catch(err => Promise.reject(err));
    }
  }

  /* Create a error objects with unified interface for easier error
     handling. */
  async _handleErrors(err, {eventId, critical, param} = {}) {
    let newErr = new Error();
    /* All validation and constraint errors renamed as ValidationError. */
    newErr.name = 'ValidationError';
    newErr.status = 500;
    newErr.stack = err.stack;
    newErr.errors = [];
    switch (err.name) {
      /* Input failed to validate by Sequelize implementation of
         validator.js. */
      case 'SequelizeValidationError':
        for (let i = 0; i < err.errors.length; i++) {
          newErr.errors.push({
            msg: err.errors[i].message,
            param: err.errors[i].path
          });
        }
        break;

      /* Input for foreign key does not exist in associated models. */
      case 'SequelizeForeignKeyConstraintError':
        const path = err.index.split('_')[1];
        newErr.errors.push({
          msg: `Invalid ${path} selected.`,
          param: path
        });
        break;

      /* Input is a duplicate of existing record when it needs to be
         unique. */
      case 'SequelizeUniqueConstraintError':
        for (let i = 0; i < err.errors.length; i++) {
          const path = err.errors[i].path;
          const cap_path = path.charAt(0).toUpperCase() + path.substr(1);
          newErr.errors.push({
            msg: `${cap_path} already in use.`,
            param: path
          });
        }
        break;

      /* Other errors shouldn't occur, so there is either a server,
         connection, or code error. */
      default:
        if (critical) {
          newErr.errors = 'unknown';
        } else {
          newErr.errors.push({
            msg: err.message,
            param
          });
        }
    }
    /* Set event to error. */
    let msg;
    if (Array.isArray(newErr.errors)) {
      msg = newErr.errors[0].msg;
    } else {
      msg = newErr.errors;
    }
    await this.events.throw(eventId, msg, newErr.stack);

    /* Throw error. */
    throw newErr;
  }

  /* For queries made through Sequelize interface, convert date ranges
     to use Op.between operator. */
  static insertDateRange(whereObj) {
    if (!whereObj) return whereObj;
    
    const keys = Object.keys(whereObj);
    for (let i = 0; i < keys.length; i++) {
      let value = whereObj[keys[i]];
      if (Array.isArray(value)) {
        value = { [sequelize.Op.between] : value };
        whereObj[keys[i]] = value;
      }
    }
    return whereObj;
  }

  /* Build SQL query for filter options. */
  static buildFilterString(filter, model) {
    let where = '';
    let keys = Object.keys(filter);
    /* Valid filter options exist. */
    if (typeof filter === 'object' && filter !== null && keys.length > 0) {

      /* Convert each filter into proper text. */
      where = 'WHERE ' + Object.entries(filter).map(e => {
        /* Attach column name to property. */
        let str = `"${model}"."${e[0]}"`; 
        /* Sequelize operators are keys passed as array, such as [Op.or]
           or [Op.between]. */
        if (Array.isArray(e[1]) && e[1].length === 2) {
          /* Determine if date by seeing if it's larger than an
             arbitrary reference date. Only date objects can be 
             larger. */
          const referenceDate = new Date('12/12/2012');
          if (new Date(e[1][0]) > referenceDate) {
            /* Date objects must be a range. */
            return `(${str} BETWEEN '${e[1][0]}' AND '${e[1][1]}')`;

          /* Or operator used. */  
          } else {
            return `(${str} = '${e[1][0]}' OR ${str} = '${e[1][1]}')`;
          }
          
        } else {
          return `${str} = '${e[1]}'`;
        }
      }).join(' AND ');

    /* Filter input is string, so use it directly. */
    } else if (typeof filter === 'string') {
      where = 'WHERE ' + filter;
    }
    /* Return SQL where clause. */
    return where;
  }

  /* Get associated repository. */
  get associate() {
    return this.assoc;
  }

  get name() {
    return this.Model.tableName;
  }
}

module.exports = BaseRepo;