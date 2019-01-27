const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');
const Sku = require('../repos/sku');

describe('Sku Repo', () => {

  before(async () => {
    mute();
    try {
      await db.Size.destroy({ where: {}, force: true });
      await db.Color.destroy({ where: {}, force: true });
      await db.Sku.destroy({ where: {}, force: true });

      await db.Size.create({ 
        name: 'junior',
        innerSize: 12,
        masterSize: 4 
      });
      await db.Size.create({ 
        name: 'original',
        innerSize: 12,
        masterSize: 4 
      });
      await db.Size.destroy({ where: { name: 'junior' } });

      await db.Color.create({ name: 'blue' });
      await db.Color.create({ name: 'silver' });
      await db.Color.destroy({ where: { name: 'silver' } });

      await db.Sku.create({
        id: 'og-blue',
        upc: '651277420122',
        color: 'blue',
        size: 'original'
      });
    } catch (err) {
      unmute();
      console.log(err);
    }
    unmute();
  });

  const skus = new Sku();

  describe('#create()', () => {
    it('should not allow capital letters in name', async () => {
      mute();
      let message;
      try {
        await skus.create('JR-BLUE', '651277420123', 'blue', 'junior');
      } catch (err) {
        console.log(err);
        message = err.errors[0].msg;  
      }
      unmute();
      expect(message).to.equal("SKU ID must be in lower case.");
    });

    it('should respect color name constraint', async () => {
      mute();
      let message;
      try {
        await skus.create('jr-blue', '651277420123', 'green', 'junior');
      } catch (err) {
        message = err.errors[0].msg;  
      }
      unmute();
      expect(message).to.equal('Invalid color selected.');
    });

    it('should update size and color use', async () => {
      mute();
      let sku;
      try {
        sku = await skus.create('jr-blue', '651277420123', 'blue', 'junior');
      } catch(err) {
        unmute();
        console.log(err);
      }
      console.log(sku);
      const color = await skus.associate.color.get(sku.color);
      const size = await skus.associate.size.get(sku.size);
      
      unmute();
      expect(color.name).to.equal('blue');
      expect(color.used).to.be.true;
      expect(size.name).to.equal('junior');
      expect(size.used).to.be.true;
    });

    after(async () => {
      mute();
      await db.Sku.destroy({
        where: { id: 'jr-blue' },
        force: true
      });
      unmute();
    });

  });

  describe('#hide()', () => {
    it('should make a sku inactive', async () => {
      mute();
      await skus.hide('og-blue');
      const list = await skus.list();
      const listActive = await skus.listActive();
      const active = await skus.active('og-blue');
      unmute();
      expect(active).to.be.false;
      expect(list).to.be.lengthOf(1);
      expect(listActive).to.be.lengthOf(0);
    });
  });

  describe('#renew()', () => {
    it('should make a sku active again', async () => {
      mute();
      await skus.renew('og-blue');
      const list = await skus.list();
      const listActive = await skus.listActive();
      const active = await skus.active('og-blue');
      unmute();
      expect(active).to.be.true;
      expect(list).to.be.lengthOf(1);
      expect(listActive).to.be.lengthOf(1);
    });
  });

  describe('#delete()', () => {
    it('should permanently delete a sku', async () => {
      mute();
      await skus.delete('og-blue');
      let list = await skus.list();
      let listActive = await skus.listActive();
      unmute();
      expect(list.map(e => e.id)).to.not.contain('og-blue');
      expect(list).to.be.lengthOf(0);
      expect(listActive).to.be.lengthOf(0);
    });
  });

  after(async () => {
    mute();
    await db.Color.destroy({ where: {}, truncate: true });
    await db.Size.destroy({ where: {}, truncate: true });
    await db.Sku.destroy({ where: {}, truncate: true });
    unmute();
  })
});

