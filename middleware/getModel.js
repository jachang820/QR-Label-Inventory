const setupAxios = require('../helpers/setupAxios');

/* Generic GET and store results based on 'storage' parameter:
   'res' -- res.locals
   'req' -- req.body

   'model' takes a lower-case string, usually plural.
   'mapTo' creates a map to named property, e.g. skusId.
      It takes a list for multiple maps. */
module.exports = (model, storage, mapTo) => {

  /* Map name should be in the pattern of (modelMap). */
  const nameMaps = function(mapField) {
    const first_letter = mapField.charAt(0).toUpperCase();
    const remaining = mapField.substr(1);
    return model + first_letter + remaining;
  }

  let mapName = [];
  if (mapTo !== undefined) {
    if (Array.isArray(mapTo)) {
      for (let i = 0; i < mapTo.length; i++) {
        mapName.push(nameMaps(mapTo[i]));
      }
    } else {
      mapName.push(nameMaps(mapTo));
      mapTo = [mapTo];
    }
  }

  /* Return middleware that creates list of all instances of a model,
     and optionally mapped lists to a field in the model. */
  return async (req, res, next) => {
    const axios = setupAxios();

    /* GET model. */
    let response;
    try {
      response = await axios.get(`/${model}`);
    } catch (err) {
      err.custom = `Error retrieving ${model} from database.`;
      return next(err);
    }

    /* Store results into res.locals. */
    if (storage === 'res') {
      res.locals[model] = response.data;
      for (let i = 0; i < mapName.length; i++) {
        res.locals[mapName[i]] = response.data.map(e => e[mapTo[i]]);
      }

    /* Store results into req.body. */
    } else if (storage === 'req') {
      req.body[model] = response.data;
      for (let i = 0; i < mapName.length; i++) {
        req.body[mapName[i]] = response.data.map(e => e[mapTo[i]]);
      }

    /* Error. */
    } else {
      err.custom = `Invalid storage argument while retrieving ${model}.`;
      return next(err);
    }

    return next();
  };

};