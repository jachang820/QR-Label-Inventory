const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');

describe('Label Model', () => {

  const labelData = {
    prefix: "https://www.smokebuddy.com/",
    style: "querystring"
  }

  describe('Prefix', () => {

    it('should not allow empty subdirectory', async () => {
      mute();
      let label = Object.assign({}, labelData);
      label.prefix = "http://www.smokebudy.com//id/";
      let message;
      try {
        await db.Label.create(label);
      } catch (err) {
        console.log(err);
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Label URL is invalid.");
    });

    it('should not allow querystring delimiters in path', async () => {
      mute();
      let label = Object.assign({}, labelData);
      label.prefix = "http://www.smokebudy.com/?=id/";
      let message;
      try {
        await db.Label.create(label);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Label URL is invalid.");
    });
  });

  describe('Style', () => {
    it('should not allow invalid style', async () => {
      mute();
      let label = Object.assign({}, labelData);
      label.style = "stringcheese";
      let message;
      try {
        await db.Label.create(label);
      } catch (err) {
        console.log(err)
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Style is invalid.");
    });
  });

  describe('#create()', () => {

    before(async () => {
      mute();
      await db.Label.destroy({
        where: labelData,
        force: true
      });
      unmute();
    })

    it('should create new label URL', async () => {
      mute();
      let label = Object.assign({}, labelData);
      let newLabel = await db.Label.create(label);
      unmute();
      const today = moment(new Date()).format('YYYY-MM-DD');
      expect(newLabel.created).to.equal(today);
    });
  });

  after(async () => {
    mute();
    await db.Label.destroy({ 
      where: labelData,
      force: true
    });
    unmute();
  });
});

