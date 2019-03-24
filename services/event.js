const BaseService = require('./base');
const EventRepo = require('../repos/event');

class Events extends BaseService {

  constructor() {
    super(EventRepo);
  }

  async getListView(page = 1, order = false, desc = false, filter = {}) {
    let list = await this._getListView(page, order, desc, filter);

    /* Group properties for progress bar. */
    for (let i = 0; i < list.length; i++) {
      list[i].progress = {
        value: list[i].progress,
        max: list[i].max,
        description: list[i].subtitle
      };
      delete list[i].max;
      delete list[i].subtitle;
    }
    return list;
  }

  /* Get a list of records currently operated on in a table. */
  async getBusy(target) {
    return this.repo.listBusy(target);
  }

  async getSchema() {
    let schema = await this._getSchema();

    /* Define progress bar. */
    schema.progress.type = 'progress';
    delete schema.max;
    delete schema.subtitle;

    /* Column names to show. */
    schema.title.alias = "Action";
    //schema.fullName.alias = "Full Name";

    /* Explanations on mouse hovers. */
    schema.title.explanation = "Action by the user.";
    schema.progress.explanation = "Completion of the action.";
    schema.notes.explanation = "Error details.";
    schema.status.explanation = "Success status of the event.";

    return schema;
  }

  async get(id) {
    return this._get(id);
  }

};

module.exports = Events;