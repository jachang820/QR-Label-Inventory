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
  }

  /* Sequelize options.
     Set 'offset' to 0 to turn off limiting. */
  async _list(options = {}) {

    /* Looks for an extra record past the limit to determine
       last page. */
    if (options.offset > 0) {
      if (!options.limit) options.limit = 21;
      else options.limit += 1;
    } else {
      options.offset = 0;
      delete options.limit;
    }

    /* Get a list of records. */
    let models, err;
    [err, models] = await to(this.Model.findAll(options));
    if (err) BaseRepo._handleErrors(err);

    this.cache.list = models;
    if (!models) return [];
    else return models.map(e => e.get({ plain: true }));
  }

  /* Get a single record. */
  async _get(options) {
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) BaseRepo._handleErrors(err);
    
    this.cache.get = model;
    if (!model) return null;
    else return model.get({ plain: true });
  }

  /* Create one or more records. */
  async _create(modelObj) {
    let model, err;
    console.log(modelObj);

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
    if (err) BaseRepo._handleErrors(err);

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
  async _update(query, options) {
    /* Add option to return record instead of a count. */
    let ret, err;
    let opts = Object.assign({ returning: true }, options);

    /* Update selected record. */
    [err, ret] = await to(this.Model.update(query, opts));
    if (err) BaseRepo._handleErrors(err);
    let [count, models] = ret;

    /* Return updated record. */
    this.cache.update = models;
    models.map(e => e.get({ plain: true }));
    return models;
  }

  /* Mark a record as used, either because it has gained an 
     association (new => used), or a soft-deleted record has
     been reactivated (hidden => used). */
  async _use(options, used) {
    const query = { hidden: null, used: used };
    let opts = Object.assign({ paranoid: false }, options);
    return this._update(query, opts);
  }

  /* Delete a record, either permanently or soft-delete (hidden). */
  async _delete(options, permanent) {
    const findOpts = Object.assign({ paranoid: false }, options);

    /* Find the record that needs to be deleted. */
    let model, err;
    [err, model] = await to(this.Model.findOne(findOpts));
    if (err) BaseRepo._handleErrors(err);

    /* Only records without any associations can be permanently
       deleted. */
    let destroyOpts;
    if (!model.used && permanent) {
      destroyOpts = { force: true };
    } else {
      destroyOpts = {};
    }

    /* Delete record. */
    [err] = await to(model.destroy(destroyOpts));
    if (err) BaseRepo._handleErrors(err);

    /* Return deleted record. */
    this.cache.delete = model;
    if (!model) return null;
    else {
      return model.get({ plain: true });
    }
  }

  /* Determine if a record is active. */
  async active(id) {
    /* If soft-delete isn't an option, all records are active. */
    if (this.Model.rawAttributes.hidden === undefined) {
      return true;
    }

    /* Get specified key or primary key. */
    let key = this.key || this.cache.pk || this.getPK();
    /* Construct where clause to find value by key. */
    let options = { where: {} };
    options.where[key] = id;
    options.paranoid = false;
    
    /* Get single record. */
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) BaseRepo._handleErrors(err);
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
    BaseRepo._handleErrors(new Error("No primary key?!"),
      null, true);
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
  static _handleErrors(err, param, critical = false) {
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
            param: err.errors[i].path
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
}

module.exports = BaseRepo;