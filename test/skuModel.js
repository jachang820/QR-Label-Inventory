const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');

const clone = (obj) => {
  let objClone = {};
  for (key in obj) {
    objClone[key] = obj[key];
  }
  return objClone;
};

describe('Sku Model', () => {

  beforeEach(async () => {
    mute();
    await db.Sku.destroy({ where: {}, force: true });
    await db.Color.findOrCreate({
      where: { name: "black" }
    });
    await db.Size.findOrCreate({
      where: { 
        name: "super",
        innerSize: 12,
        masterSize: 4
      }
    });
    await db.Sku.findOrCreate({
      where: {
        id: "sp-pitchblack",
        upc: "651277420989",
        color: "black",
        size: "super"
      }
    });
    unmute();
  });

  const skuProp = {
    id: "sp-black",
    upc: "651277420988",
    color: "black",
    size: "super" 
  };

  describe('#create()', () => {

    it('should not allow capital letters in name', async () => {
      mute();
      let sku = clone(skuProp);
      sku.id = "SP-black";
      let message;
      try {
        await db.Sku.create(sku);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("SKU ID must be in lower case.");
    });

    it('should have an ID longer than 3 characters', async () => {
      mute();
      let sku = clone(skuProp);
      sku.id = "s-b";
      let message;
      try {
        await db.Sku.create(sku);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("SKU ID is either too short or too long.");
    });

    it('should not allow spaces in name', async () => {
      mute();
      let sku = clone(skuProp);
      sku.id = "sp pitch black";
      let message;
      try {
        await db.Sku.create(sku);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Only letters and dashes allowed in SKU ID.");
    });

    it('should not allow letters in UPC', async () => {
      mute();
      let sku = clone(skuProp);
      sku.upc = "651277420abc";
      let message;
      try {
        await db.Sku.create(sku);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("UPC must be numeric.");
    });

    it('should not allow UPC longer than 14 characters', async () => {
      mute();
      let sku = clone(skuProp);
      sku.upc = "651277420123456";
      let message;
      try {
        await db.Sku.create(sku);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("UPC must be between 12-14 digits.");
    });

    it('should return created in date only format', async () => {
      mute();
      let sku;
      try {
        sku = await db.Sku.create(skuProp);
      } catch (err) {
        console.log(err.errors.map(e => e.message));
      }
      const today = moment(new Date()).format('YYYY-MM-DD');
      unmute();
      expect(sku.created).to.equal(today);
    });

  });

  describe('Structure', () => {

    it('should have seven columns', async () => {
      mute();
      let sku = await db.Sku.findOne({
        where: {
          id: "sp-pitchblack"
        }
      });
      const keys = Object.keys(sku.get({ plain: true }));
      unmute();
      expect(keys).to.have.lengthOf(7);
    });

    it('should not be hidden', async () => {
      mute();
      let sku = await db.Sku.findOne({
        where: {
          id: "sp-pitchblack"
        }
      });
      unmute();
      expect(sku.hidden).to.equal(null);
    });

    it('should be associated to the right color', async () => {
      mute();
      let sku = await db.Sku.findOne({
        where: {
          id: "sp-pitchblack"
        }
      });
      let color = await sku.getColor();
      unmute();
      expect(color.name).to.equal('black');
    });

    it('should be associated to the right size', async () => {
      mute();
      let sku = await db.Sku.findOne({
        where: {
          id: "sp-pitchblack"
        }
      });
      let size = await sku.getSize();
      unmute();
      expect(size.name).to.equal('super');
    });

  });

  describe('#transaction()', () => {

    it('should rollback if some queries fail', async () => {
      mute();
      return db.sequelize.transaction(async (t) => {
        await db.Color.create({ name: 'white' });
        await db.Size.create({
          name: 'molecular',
          innerSize: 100,
          masterSize: 10
        });
        throw new Error();
        let sku = await db.Sku.create({
          id: 'mo-white',
          upc: '651277420990',
          color: 'white',
          size: 'molecular'
        });
        return sku;
      }).then(async (sku) => {
        let colors = await db.Color.findAll();
        unmute();
        expect(colors.map(e => e.name)).to.be.lengthOf(2);
      }).catch(async (err) => {
        let colors = await db.Color.findAll();
        unmute();
        expect(colors.map(e => e.name)).to.be.lengthOf(1);
      });
    });

    it('should commit if no errors', async () => {
      mute();
      return db.sequelize.transaction(async (t) => {
        await db.Color.create({ name: 'white' });
        await db.Size.create({
          name: 'molecular',
          innerSize: 100,
          masterSize: 10
        });
        let sku = await db.Sku.create({
          id: 'mo-white',
          upc: '651277420990',
          color: 'white',
          size: 'molecular'
        });
        return sku;
      }).then(async (sku) => {
        let colors = await db.Color.findAll();
        unmute();
        expect(colors.map(e => e.name)).to.be.lengthOf(2);
      }).catch(async (err) => {
        let colors = await db.Color.findAll();
        unmute();
        expect(colors.map(e => e.name)).to.be.lengthOf(1);
      });
    });

  });

  after(async () => {
    mute();
    await db.Sku.destroy({ 
      where: {}, 
      force: true
    });
    await db.Color.destroy({
      where: {
        name: "black"
      },
      force: true
    });
    await db.Size.destroy({
      where: {
        name: "super"
      },
      force: true
    });
    unmute();
  });
});
