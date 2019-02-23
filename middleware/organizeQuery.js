/* Extract values from querystring, call service to
   get list of records.
   models -- Instance of a service.
   limit -- Number of records to return. */
module.exports = (models, limit = 20) => {

  return async (req, res, next) => {

    /* Every key in querystring. */
    const keys = Object.keys(req.query);

    /* Set defaults for sort and paging.
       Copy values to locals to display view 
       appropriately. */
    res.locals.page = req.query.page || 1;
    res.locals.sort = req.query.sort || null;
    res.locals.desc = req.query.desc === "true";

    /* Extract filter. */
    let filter = {};
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('filter-')) {
        /* Remove 'filter' prefix in element id. */
        const column = keys[i].slice(7);
        const value = req.query[keys[i]];
        filter[column] = value;

        /* Format date. */
        let dates = value.split('-');
        const startDate = new Date(dates[0]);
        const endDate = new Date(date[1]);
        if (startDate > new Date("02/20/2019")) {
          if (endDate && endDate > startDate) {
            filter[column] = [startDate, endDate];
          } else {
            filter[column] = startDate;
          }
        } 
      }
    }

    /* Retrieve records. */
    res.locals.list = await models.getListView(
      res.locals.page,
      res.locals.sort,
      res.locals.desc,
      filter
    );

    /* Check if it's the lage page. */
    if (res.locals.list.length < limit + 1) {
      res.locals.last = true;
    } else {
      res.locals.list.pop();
    }

    /* Include schema data. */
    res.locals.types = await models.getSchema();

    return next();
  };
};