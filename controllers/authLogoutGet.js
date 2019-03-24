module.exports = (req, res) => {
  /* Remove user data from request. */
  //console.log(_getCallerFile());
  req.logout();

  /* Go to main page. */
  res.redirect('/');

};

function _getCallerFile() {
    try {
        var err = new Error();
        var callerfile;
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) return callerfile;
        }
    } catch (err) {}
    return undefined;
}
