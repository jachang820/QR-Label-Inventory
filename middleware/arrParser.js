/* Recursively convert array to layered object. If
   element is numerical, then it becomes an array;
   otherwise, it becomes an object.
   e.g. If path = ['link', 'to', 'somewhere'], and
        finalVal = 5, then the function adds to obj:
        obj: { link: { to: { somewhere: 5 } } }

        If path = ['0', 'sku'], and finalVal = 5,
        then the function adds to obj:
        obj: [ { sku: 5 } ] */
const populateObject = (obj, path, finalVal) => {
  if (path.length === 0) {
    return;
  }

  if (obj[path[0]] === undefined) {
    const curType = isNaN(parseInt(path[0])) ? 'obj' : 'arr';
    if (path.length > 1) {
      const nextType = isNaN(parseInt(path[1])) ? 'obj' : 'arr';

      if (nextType === 'obj') {
        if (curType === 'obj') {
          obj[path[0]] = {};
        } else {
          obj.push({});
        }
      } else {
        if (curType === 'obj') {
          obj[path[0]] = [];
        } else {
          obj.push([]);
        }
        path[1] = parseInt(path[1]);
      }

    } else {
      if (curType === 'obj') {
        obj[path[0]] = finalVal;
      } else {
        obj.push(finalVal);
      }
    }
  }
  let e = path.shift();
  return populateObject(obj[e], path, finalVal);
}

/* Convert arrays passed, through html forms to req.body, 
   to a layered object (similar to bodyParser, which for
   some reason didn't work). Takes up to 4 layers. For 
   example: 
   req.body.items[1][sku] = X
   req.body.items[1][qty] = Y
   converts to
   req.body.items: [ { sku: X, qty: Y } ] */
module.exports = (req, res, next) => {
  const regex = /^([\w-]*)(\[[\w-]*\])?(\[[\w-]*\])?(\[[\w-]*\])?(\[[\w-]*\])?$/;
  for (key in req.body) {
    let match = key.match(regex);
    match.shift();
    match = match.filter(e => e !== undefined);
    const base = match[0];
    if (match.length > 1) {
      match = match.map(e => e.substr(1, e.length - 2));
      match[0] = base;
      console.log(match);
      populateObject(req.body, match, req.body[key]);
      delete req.body[key];
    }
  }

  return next();
}