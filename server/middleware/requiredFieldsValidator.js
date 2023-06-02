const { validationResult } = require('express-validator/check');

module.exports = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });
    next();
  } catch (e) {
    next(e);
  }
};
