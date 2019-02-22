const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');

describe('Color Model', () => {

  before(async () => {
    mute();
    await db.Color.destroy({ where: {}, force: true });
    unmute();
  });

  describe('#create()', () => {

    it('should return created in date only format', async () => {
      mute();
      let color = await db.Color.create({
        name: "black"
      });
      const today = moment(new Date()).format('YYYY-MM-DD');
      unmute();
      expect(color.created).to.equal(today);
    });

    it('should not allow multiple colors of same name', async () => {
      mute();
      try {
        await db.Color.create({
          name: "black"
        });
      } catch (err) {
        console.log(err);
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("name must be unique");
    });
  });

  describe('Structure', () => {

    it('should have four columns', async () => {
      mute();
      let color = await db.Color.findOne({
        where: {
          name: "black"
        }
      });
      const keys = Object.keys(color.get({ plain: true }));
      unmute();
      expect(keys).to.have.lengthOf(4);
    });

    it('should not be hidden', async () => {
      mute();
      let color = await db.Color.findOne({
        where: {
          name: "black"
        }
      });
      unmute();
      expect(color.hidden).to.equal(null);
    });

  });

  after(async () => {
    mute();
    let count = await db.Color.destroy({ 
      where: { 
        name: "black" },
      force: true
    });
    unmute();
  });
});

