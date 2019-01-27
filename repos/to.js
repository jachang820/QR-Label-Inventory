/* Simplify error handling with async without try/catch blocks. */
module.exports = async (promise) => {
  try{
    let results = await promise;
    return [null, results];
  } catch (err) {
    return [err, null];
  }
};