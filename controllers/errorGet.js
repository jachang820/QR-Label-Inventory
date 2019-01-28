module.exports = (req, res, next) => {
  res.locals.css = ['error.css'];
  
  /* Set the status code. */
  let status = parseInt(req.params.status);
  if (isNaN(status) || (status < 400 && status > 520)) {
    res.locals.status = 404;
  } else {
    res.locals.status = status;
  }

  if (res.locals.status === 500) {
    res.locals.message = "It's not you, it's me...";
  }

  res.status(res.locals.status);
  res.render('error');
};