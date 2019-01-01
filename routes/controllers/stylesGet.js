const async = require('async');
const setupAxios = require('../../helpers/setupAxios');

module.exports = [

  (req, res, next) => {
    const axios = setupAxios();
    axios.get('/colors').then((response) => {
      res.locals.colors = response.data;
      return next();
      
    }).catch((err) => {
      err.custom("Error retrieving colors from database.");
      return next(err);
    });
  },

  (req, res, next) => {
    const axios = setupAxios();
    axios.get('/sizes').then((response) => {
      res.locals.sizes = response.data;
      return next();
      
    }).catch((err) => {
      err.custom("Error retrieving sizes from database.");
      return next(err);
    });
  },

  (req, res, next) => {
    return res.render('styles');
  }

];

  