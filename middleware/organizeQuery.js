/* Extract values from querystring, call service to
   get list of records.
   models -- Instance of a service.
   limit -- Number of records to return. */
module.exports = (models, limit = 20, dates = ['created']) => {

  return async (req, res, next) => {
    /* Store date columns. */
    res.locals.dates = dates;

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
    res.locals.filter = {};
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('filter-')) {
        /* Remove 'filter' prefix in element id. */
        const column = keys[i].slice(7);
        const value = decodeURI(req.query[keys[i]]);

        if (dates.includes(column)) {
          /* Format date. */
          let dates = value.split(',');
          const startDate = new Date(dates[0]);
          const endDate = new Date(dates[1]);

          /* Only date objects returns true in comparison. */
          if (startDate > new Date("12/12/2012")) {
            /* End date must be after start date. */
            if (endDate > startDate) {
              filter[column] = [dates[0], dates[1]];
              res.locals.filter[column] = filter[column].join(',');

            /* Filter by only start date (will not match anything). */
            } else {
              filter[column] = dates[0];
              res.locals.filter[column] = filter[column];
            }
          }

        /* Column is not a date. */
        } else {
          filter[column] = value;
          res.locals.filter[column] = filter[column];
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

    /* Convert dates to ISO-8601 format. */
    for (let i = 0; i < res.locals.list.length; i++) {
      for (let j = 0; j < dates.length; j++) {
        let date = res.locals.list[i][dates[j]];
        if (date) {
          date = new Date(date);
          res.locals.list[i][dates[j]] = date.toISOString();
        }
      }
    }

    /* Check if it's the last page. */
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