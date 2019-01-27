const expect = require('chai').expect;
const moment = require('moment');
const mute = require('mute');
const unmute = mute(process.stdout);
const db = require('../models');

describe('Profile Model', () => {

  const profileData = {
    firstName: "Mr. Azzar-Zan'za",
    lastName: "the Magnificent!",
    email: "e.m.a.i.l@gmail.com",
    role: 'factory'
  };

  describe('First/Last Names', () => {

    it('should not allow strange characters', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      profile.lastName = "tHe m@gnific&n$t 8++";
      let message;
      try {
        await db.Profile.create(profile);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Invalid characters in last name.");
    });

    it('should have at least one character', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      profile.firstName = "";
      let message;
      try {
        await db.Profile.create(profile);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("First name must exist.");
    });

    it('should not be longer than 64 characters', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      profile.lastName = 
        "fdpfdoqsfkopkopfdszsiojfooZUpOJRhjxOoJofjoisofjodsfsdfsfdsfsfbfdb";
      let message;
      try {
        await db.Profile.create(profile);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Last name too long.");
    });
  });

  describe('Email', () => {
    it('should not allow invalid emails', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      profile.email = "two@in@email.com"
      let message;
      try {
        await db.Profile.create(profile);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Email format is invalid.");
    });
  });

  describe('Role', () => {
    it('should not allow invalid roles', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      profile.role = 'bill collector'
      let message;
      try {
        await db.Profile.create(profile);
      } catch (err) {
        message = err.errors[0].message;
      }
      unmute();
      expect(message).to.equal("Role is invalid.");
    });
  });

  describe('#create()', () => {

    before(async () => {
      mute();
      await db.Profile.destroy({
        where: {}
      });
      unmute();
    })

    it('should create new user', async () => {
      mute();
      let profile = Object.assign({}, profileData);
      let user = await db.Profile.create(profile);
      unmute();
      expect(user.firstName).to.equal("Mr. Azzar-Zan'za");
    });
  });

  after(async () => {
    mute();
    await db.Profile.destroy({ 
      where: {}
    });
    unmute();
  });
});

