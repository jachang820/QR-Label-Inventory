module.exports = (req, res, next) => {
  let err = new Error();
  
  /* Set the status code. */
  let status = parseInt(req.params.status);
  if (isNaN(status) || (status < 400 && status > 520)) {
    err.status = 404;
  } else {
    err.status = status;
  }

  /* Set the message. */
  err.message = req.body.message || "Oops! Something went wrong...";
  if (res.locals.status === 500) {
    err.message = "It's not you, it's me...";
  }

  res.status(err.status);
  return next(err);
};