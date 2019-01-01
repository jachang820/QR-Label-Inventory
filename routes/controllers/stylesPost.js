const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const setupAxios = require('../../helpers/setupAxios');

/* Generates middleware lists for creating colors and sizes. */
module.exports = (type) => {
  /* Commonly used string variations. */
  const cap_type = type.charAt(0).toUpperCase() + type.substring(1);
  const new_type = `new_${type}`;

  return [

    /* Validate new style name, ensure that they are not already
       in use. */
    body(new_type).trim()
      .isLength({ min: 1 }).withMessage(`${cap_type} empty.`)
      .isLength({ max: 64 }).withMessage(`${cap_type} too long.`)
      .custom(value => {
        const axios = setupAxios();

        return axios.get(`/${type}s/${value}`).then(response => {
          if (response.data) {
            return Promise.reject(`${cap_type} already in use`);
          }
        });
      }),

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody(new_type).trim().escape(),

    /* Return error or create new style in database. */
    (req, res, next) => {
      /* This is the new style that was just entered. */
      const style = {
        name: req.body[new_type],
      };

      const errors = validationResult(req);
      const axios = setupAxios();

      /* An error was found. Retain entered style name and
         return to form with error. */
      if (!errors.isEmpty()) {
        axios.get(`/${type}s`).then((response) => {
          let params = { errors: errors.array() }
          params[`${type}s`] = response.data;
          params[`fill_${type}`] = style.name;
          return res.render('styles', params);
          
        }).catch((err) => {
          err.custom = `Error retrieving ${type}s from database.`;
          return next(err);
        });

      /* No errors found, create new style. */
      } else { 
        axios.post(`/${type}s`, {
          name: style.name
        }).then((response) => {
          res.redirect('/styles');

        }).catch((err) => {
          err.custom = `Error adding new ${type}s to database.`;
          return next(err);
        });
      }
    }
  ];
};