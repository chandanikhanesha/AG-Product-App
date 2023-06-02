const config = require('config/config');
module.exports = {
  getConfig: (env) => {
    if (!env) env = process.env.NODE_ENV || 'development';
    return config[env];
  },
};
