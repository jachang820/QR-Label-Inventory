const BaseService = require('./base');
const SizeRepo = require('../repos/size');

class Sizes extends BaseService {

  constructor() {
    super(SizeRepo);
  }

  async add(name, abbrev, innerSize, masterSize) {
    let size = await this.repo.create(
      name, 
      abbrev,
      innerSize, 
      masterSize
    );
    size = Sizes._addListStatus(size);
    return size[0];
  }

};

module.exports = Sizes;