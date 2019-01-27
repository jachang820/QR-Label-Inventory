const to = require('./to');
const { sequelize } = require('../models');

class SettingsRepo {

  constructor(Model, key) {
    this.Model = Model;
    if (key) this.key = key;
    this.tx = null;
    this.cache = {};
    this.assoc = null;
  }

  async _list(options) {
    let opts = this._buildOrder();
    opts = Object.assign(opts, options || {});

    let models, err;
    [err, models] = await to(this.Model.findAll(opts));
    if (err) SettingsRepo._handleErrors(err);

    this.cache.list = models;
    if (!models) return [];
    else return models.map(e => e.get({ plain: true }));
  }

  async _get(options) {
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) SettingsRepo._handleErrors(err);

    this.cache.get = model;
    if (!model) return null;
    else return model.get({ plain: true });
  }

  async _create(modelObj) {
    let model, err;
    [err, model] = await to(this.Model.create(modelObj));
    if (err) SettingsRepo._handleErrors(err);

    this.cache.create = model;
    if (!model) return null;
    else return model.get({ plain: true });
  }

  async _use(options, used) {
    let count, err;
    [err, count] = await to(this.Model.update({
      hidden: null,
      used: used
    }, options));
    if (err) SettingsRepo._handleErrors(err);

    return count;
  }

  async _delete(options, permanent) {
    let findOpts = permanent ? { paranoid: false } : {};
    findOpts = Object.assign(findOpts, options);

    let model, err;
    [err, model] = await to(this.Model.findOne(findOpts));
    if (err) SettingsRepo._handleErrors(err);

    let destroyOpts;
    if (!model.used && permanent) {
      destroyOpts = { force: true };
    } else {
      destroyOpts = {};
    }

    [err] = await to(model.destroy(destroyOpts));
    if (err) SettingsRepo._handleErrors(err);

    this.cache.delete = model;
    if (!model) return null;
    else return model.get({ plain: true });
  }

  async active(id) {
    if (this.Model.rawAttributes.hidden === undefined) {
      return true;
    }
    let key = this.key || this.cache.pk || this.getPK();
    let options = { where: {} };
    options.where[key] = id;
    options.paranoid = false;
    
    let model, err;
    [err, model] = await to(this.Model.findOne(options));
    if (err) SettingsRepo._handleErrors(err);
    this.cache.active = model;

    if (!model) return null;
    else return !model.get({ plain: true }).hidden;
  }

  _describe(exclude) {
    let columns = {};
    for (let key in this.Model.rawAttributes) {
      const attr = this.Model.rawAttributes[key];
      if (Array.isArray(exclude) && exclude.includes(key)) {
        continue;
      }
      columns[key] = {};
      columns[key].type = attr.type.key.toLowerCase();
      columns[key].optional = attr.allowNull || false;
    }
    return columns;
  }

  getPK() {
    for (let key in this.Model.rawAttributes) {
      const attr = this.Model.rawAttributes[key];
      if (attr.primaryKey) {
        this.cache.pk = key;
        return key;
      }
    }
    throw new Error("No primary key?!");
  }

  transaction(fun) {
    return sequelize.transaction(fun)
      .catch(err => Promise.reject(err));
  }

  _buildOrder() {
    let options = { order: [] };
    if (this.Model.rawAttributes.hidden)
      options.order.push(['hidden', 'ASC']);
    if (this.Model.rawAttributes.used)
      options.order.push(['used', 'ASC']);

    const key = this.key || this.getPK();
    options.order.push([key, 'ASC']);
    return options;
  }

  static _handleErrors(err) {
    let newErr = new Error();
    newErr.name = 'ValidationError';
    newErr.status = 500;
    newErr.stack = err.stack;
    newErr.errors = [];
    switch (err.name) {
      case 'SequelizeValidationError':
        for (let i = 0; i < err.errors.length; i++) {
          newErr.errors.push({
            msg: err.errors[i].message,
            param: err.errors[i].path
          });
        }
        break;

      case 'SequelizeForeignKeyConstraintError':
        const path = err.index.split('_')[1];
        newErr.errors.push({
          msg: `Invalid ${path} selected.`,
          param: path
        });
        break;

      case 'SequelizeUniqueConstraintError':
        for (let i = 0; i < err.errors.length; i++) {
          const path = err.errors[i].path;
          const cap_path = path.charAt(0).toUpperCase() + path.substr(1);
          newErr.errors.push({
            msg: `${cap_path} already in use.`,
            param: err.errors[i].path
          });
        }
    }
    console.log(newErr);
    throw newErr;
  }

  get associate() {
    return this.assoc;
  }
}

module.exports = SettingsRepo;