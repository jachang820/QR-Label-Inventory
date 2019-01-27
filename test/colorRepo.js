const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');
const Color = require('../repos/color');

describe('Settings/Color Repo', () => {

  before(async () => {
    mute();
    try {
      await db.Color.destroy({ where: {}, force: true });
      await db.Color.create({ name: 'blue' });
      await db.Color.create({ name: 'white' });
      await db.Color.create({ name: 'gold' });
      await db.Color.create({ name: 'peridot' });
      await db.Color.destroy({ where: { name: 'gold' } });
    } catch (err) {
      unmute();
      console.log(err);
    }
    unmute();
  });

  const colors = new Color(db.Color);

  describe('#create()', () => {
    it('should not allow multiple colors of same name', async () => {
      mute();
      let message;
      try {
        await colors.create('gold');
      } catch (err) {
        message = err.errors[0].msg;
      }
      unmute();
      expect(message).to.equal("Name already in use.");
    });
  });

  describe('#list()', () => {
    it('should contain four colors', async () => {
      mute();
      let list = await colors.list();
      unmute();
      expect(list).to.be.lengthOf(4);
    });
  });

  describe('#listActive()', () => {
    it('should contain three colors', async () => {
      mute();
      let list = await colors.listActive();
      unmute();
      expect(list).to.be.lengthOf(3);
    });
  });

  describe('#get()', () => {
    it('should return the queried color', async () => {
      mute();
      let color = await colors.get('white');
      unmute();
      expect(color.name).to.equal('white');
      expect(color.hidden).to.equal(null);
    });
  });

  describe('#hide()', () => {
    it('should soft delete the queried color', async () => {
      mute();
      let color = await colors.hide('white');
      let list = await colors.list();
      let listActive = await colors.listActive();
      unmute();
      expect(list).to.be.lengthOf(4);
      expect(listActive).to.be.lengthOf(2);
      expect(color.hidden).to.be.not.equal(null);
    });
  });

  describe('#active()', () => {
    it('should see if a color is not hidden', async () => {
      mute();
      const activeBlue = await colors.active('blue');
      const activeWhite = await colors.active('white');
      const activeGold = await colors.active('gold');
      const activePeridot = await colors.active('peridot');
      unmute();
      expect(activeBlue).to.be.true;
      expect(activeWhite).to.be.false;
      expect(activeGold).to.false;
      expect(activePeridot).to.true;
    });
  });

  describe('#renew()', () => {
    it('should make a hidden color active again', async () => {
      mute();
      await colors.renew('gold');
      const active = await colors.active('gold');
      unmute();
      expect(active).to.be.true;
    });
  });

  describe('#delete()', () => {
    it('should permanently delete a color', async () => {
      mute();
      await colors.delete('peridot');
      const list = await colors.list();
      const activeColors = await colors.listActive();
      unmute();
      expect(list).to.be.lengthOf(3);
      expect(activeColors).to.be.lengthOf(2);
      expect(list.map(e => e.name)).to.not.contain('peridot');
    });
  });

  describe('#describe()', () => {
    it('should have correct number of columns', async () => {
      mute();
      let schema = await colors.describe();
      unmute();
      expect(Object.keys(schema)).to.be.lengthOf(4);
    });
  });

  after(async () => {
    mute();
    await db.Color.destroy({ where: {}, truncate: true });
    unmute();
  })
});

