# QR Label Inventory System

This was an inventory system that generates unique ID QR codes and labels per unit, so they could be tracked after shipment to consumers. This version of the project was unfinished, and ultimately a decision was made to go forward with a different version. As such, the company whose name remains on some of these pages is not related to this project. I do not take credit for the names and logos. This project, including all the code, but besides any company and product names and logos, should not be construed to represent anyone but myself. The logos found within belong to their respective owners.

### Installing

Run the following:

```
npm install
psql postgres < scripts/db-setup.sql
[optional] node scripts/dummy-data.js
```

## Built With

* [Node.js 10.14.2](https://nodejs.org/) - Javascript runtime
* [Express.js 4.16.0](https://expressjs.com/) - The web framework used

## Authors

* **Jonathan Chang** - *Initial work* - [jachang820](https://github.com/jachang820)

* **Alexander Chen** - *Initial work* - [alexanderqchen](https://github.com/alexanderqchen)
