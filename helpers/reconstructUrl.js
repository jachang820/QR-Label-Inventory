/* Express-validators sanitization with the escape() option
   replaces forward slashes '/' in URLs with an esape
   sequence. This function replaces all occurrences of that
   sequnece in a string with the original '/'.

   Note that escape() is still desirable to prevent other
   kinds of invalid characters. */
module.exports = (string) => {
  return string.replace(/&#x2F;/g, '/');
};