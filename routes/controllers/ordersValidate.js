const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const { Colors, Sizes } = require('../../models');

const isValidColor = (color) => {
  return Colors.findOne({ where: { name: color }}).then((data) => {
    if (!data) {
      return Promise.reject(`Invalid color '${color}'`);
    }
  });
};

const isValidSize = (size) => {
  return Sizes.findOne({ where: { name: size }}).then((data) => {
    if (!data) {
      return Promise.reject(`Invalid size '${size}'`);
    }
  });
};

const isValidQuantity = (quantity) => {
  if (parseInt(quantity) && quantity == parseInt(quantity)) {
    return Promise.resolve();
  }

  return Promise.reject(`Quantity must be an integer.`);
}

module.exports = [
  body('color').trim().custom(isValidColor),
  body('size').trim().custom(isValidSize),
  body('quantity').trim().custom(isValidQuantity),

  async (req, res, next) => {
    // Handle errors
    const errors = validationResult(req);

    res.json(errors.array());
  }
]

