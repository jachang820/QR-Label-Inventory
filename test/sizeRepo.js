const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');
const Size = require('../repos/size');

describe('Size Repo', () => {

  before(async () => {
    mute();
    try {
      await db.Size.destroy({ where: {}, force: true });
      await db.Size.create({ 
        name: 'Junior',
        innerSize: 12,
        masterSize: 4 
      });
      await db.Size.create({ 
        name: 'Original',
        innerSize: 12,
        masterSize: 4 
      });
      await db.Size.destroy({ where: { name: 'Junior' } });
    } catch (err) {
      unmute();
      console.log(err);
    }
    unmute();
  });

  const sizes = new Size(db.Size);

    it('should not have non-positive size', async () => {
      mute();
      let message;
      try {
        await sizes.create('mega', 0, 2);
      } catch (err) {
        message = err.errors[0].msg;
      }
      unmute();
      expect(message).to.equal("Inner size must be positive.");
    });

    it('must not be larger than 1000 units', async () => {
      mute();
      let message;
      try {
        await sizes.create('mega', 120, 1001);
      } catch (err) {
        message = err.errors[0].msg;
      }
      unmute();
      expect(message).to.equal("Master size is too large.");
    });

    it('must have integer sizes', async () => {
      mute();
      let message;
      try {
        await sizes.create('mega', 2.5, 6);
      } catch (err) {
        message = err.errors[0].msg;
      }
      unmute();
      expect(message).to.equal("Inner size must be an integer.");
    });

    it('should add a new size', async () => {
      mute();
      let message;
      await sizes.create('Mega', 12, 2);
      let list = await sizes.list();
      list = list.map(e => e.name);
      unmute();
      expect(list).to.be.lengthOf(3);
      expect(list).to.contain('Mega');
    });

    after(async () => {
      mute();
      await sizes.delete('Mega');
      unmute();
    });
  });

  describe('#renew()', () => {
    it('should make a hidden size active again', async () => {
      mute();
      await sizes.renew('Junior');
      const list = await sizes.list();
      const listActive = await sizes.listActive();
      const active = await sizes.active('Junior');
      unmute();
      expect(active).to.be.true;
      expect(list).to.be.lengthOf(2);
      expect(listActive).to.be.lengthOf(2);
    });
  });

  after(async () => {
    mute();
    await db.Color.destroy({ where: {}, truncate: true });
    unmute();
  });
});
