const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const setupAxios = require('../../helpers/setupAxios');

/* Toggles active flag for each selected color. */
module.exports = (type) => {

  /* Commonly used string variations. */
  var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
  var type_pl = `${type}s`;

  return [

    /* Ensure that colors have been selected. */
    body("names")
      .custom((styles) => { 
        return Array.isArray(styles) && styles.length > 0;
      }).withMessage(`${cap_type} unselected`),

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody("names").trim().escape(),

    /* Test for validation errors. Return error if found,
       otherwise store list of all styles. */
    (req, res, next) => {
      const axios = setupAxios();
      const errors = validationResult(req);

      axios.get(`/${type}s`).then((response) => {
        
        res.locals[type_pl] = response.data;
        if (!errors.isEmpty()) {
          let params = { errors: errors.array() }
          params[type_pl] = response.data;
          return res.render('styles', params);

        } else {
          return next();
        }

      }).catch((err) => {
        err.custom = `Error retrieving ${type_pl} from database.`;
        return next(err);
      })
    },

    /* Get a list of matching styles from database. */
    (req, res, next) => {
      const styles = req.body["names"];
      res.locals[type_pl] = res.locals[type_pl].filter((e) => {
        return styles.includes(e.name);
      });

      /* Return error if none matching. */
      if (!res.locals[type_pl]) {
        return res.render('styles', {
          errors: { msg: "None of your selections match." }
        });
      } else {
        return next();
      }
    },

    
    /* Determine which styles have items in that style. */
    async (req, res, next) => {
      axios.defaults.baseURL = process.env.API_PATH;

      /* This is styles selected that matches the database. */
      let styles = res.locals[type_pl];

      /* Iterate over each style. */
      for (let i = 0; i < styles.length; i++) {
        let params = {};
        params[`${cap_type}Name`] = styles[i].name;

        /* Find whether there are items corresponding to a certain 
           style. */
        try {
          let response = await axios.get('/items', {params: params});
          styles[i].hasItems = (response.data.length > 0);
        } catch (err) {
          err.custom = `Error retrieving ${type_pl} from database.`;
          return next(err);
        }
      }

      res.locals[type_pl] = styles;
      return next();

    },

    /* Update new style statuses. If a style is active an has
       no corresponding items, it will be deleted. Otherwise,
       the style is set inactive if it was active, and active
       if it was inactive. */
    async (req, res, next) => {
      for (let i = 0; i < res.locals[type_pl].length; i++) {

        const e = res.locals[type_pl][i];
        const path = `/${type}s/${e.name}`;
        const params = { active: !e.active };

        /* Style has items, so flip its status. */
        if (e.hasItems) {
          try {
            let response = await axios.put(path, params);
          } catch (err) {
            err.custom = `Unable to change status for ${e.name}.`;
            return next(err);
          }

        /* Style has no items, so delete it. */
        } else {
          try {
            let response = await axios.delete(path);
          } catch (err) {
            err.custom = `Unable to delete ${e.name}.`;
            return next(err);
          }
        }
      }

      /* It's impossible to redirect after an ajax request, so
         we'll handle redirection on client side. */
      return res.json();
    }

  ];

};