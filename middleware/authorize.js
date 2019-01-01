const createError = require('http-errors');

/* Returns a middleware that compares all acccepted roles with
   user role. Assumes 'secured' middleware has already been run,
   creating 'res.locals.role'.

   Each role in accepted only needs the characters to identify a
   role. For example, ['A', 'S'] would specify that 'Administrator'
   and 'Shipper' roles are acceptable.

   Failure returns 401 -- Unauthorized. */
module.exports = (accepted) => {

  return (req, res, next) => {
    /* Compares user role with the start of each accepted value. */
    for (let i = 0; i < accepted.length; i++) {
      if (res.locals.role.startsWith(accepted[i])) {
        return next();
      }
    }

    /* User unauthorized. */
    return next(createError(401, "User unauthorized."));
  }
}