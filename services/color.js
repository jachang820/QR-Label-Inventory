const BaseService = require('./base');
const ColorRepo = require('../repos/color');

class Colors extends BaseService {

  constructor() {
    super(ColorRepo);
  }

  async add(name) {
    let color = await this.repo.create(name);
    color = Colors._addListStatus(color);
    return color[0];
  }

};

module.exports = Colors;