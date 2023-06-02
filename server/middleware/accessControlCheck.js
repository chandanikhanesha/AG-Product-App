const ac = require('utilities/accessControl');

module.exports = {
  check: (method, attribute) => (req, res, next) => {
    const permission = ac.can(req.user.role)[method + 'Any'](attribute);
    // console.log(req.user.role + " is doing " + method +  ""+attribute);
    // console.log(permission);
    if (permission.granted) {
      // console.log("Permission Granted");
      next();
    } else {
      return res.status(403).json({
        message: 'Invalid Access Level',
      });
    }
  },
};
