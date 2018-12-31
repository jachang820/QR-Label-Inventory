const axios = require('axios');

/* Sets default values for axios. The token is for security. */
module.exports = () => {
  return axios.create({
    baseURL: process.env.API_PATH,
    timeout: 1000,
    auth: {
      username: 'server',
      password: process.env.SERVER_SECRET
    }
  });
};