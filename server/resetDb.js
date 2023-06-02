const db = require('../models/index');

db.sequelize
  .sync({
    force: true,
    alter: true,
  })
  .then(() => {
    console.log('Force reset done');
  });
