const axios = require('axios');

/* Sets default values for axios. The token is for security. */
module.exports = (timeLimit) => {
	if (timeLimit === undefined) {
		timeLimit = 10000;
	}
	
  return axios.create({
    baseURL: process.env.API_PATH,
    timeout: timeLimit,
    auth: {
      username: 'server',
      password: process.env.SERVER_SECRET
    }
  });
};