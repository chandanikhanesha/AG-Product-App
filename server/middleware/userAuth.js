const jwt = require('jsonwebtoken');
var User = require('models').User;

const end = (req, res, next, message) => {
  if (!message) message = 'Invalid Token';
  return res.status(403).json({
    message,
  });
};

module.exports = (req, res, next) => {
  var token = req.headers['x-access-token'];
  if (!token) return end(req, res, next);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return end(req, res, next);

    User.findById(decoded.id).then((user) => {
      req.user = user;
      next();
    });
  });
};
