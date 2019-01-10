/* Validate each line item of an order property by looping through
   each line and using a validity function. 

   req: Session request. Assume req.body exists.
   property (STRING): Property name.
   validTest (FUN): Function that returns true if property is valid. */
module.exports = (req, property, validTest) => {
  let rowsWithErrors = [];
  const itemCount = req.body.count;

  for (let i = 0; i < itemCount; i++) {
    if (!validTest(req.body, i)) {
      rowsWithErrors.push(i + 1);
    }
  }

  if (rowsWithErrors.length > 0) {
    let err = `Invalid ${property} on rows: ${rowsWithErrors.join(', ')}`;
    throw new Error(err);
  } else {
    return true;
  }
};