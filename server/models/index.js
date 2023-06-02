'use strict';
const { pool2 } = require('config/connection');

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var config = require('config').getConfig();
var db = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    pool: {
      max: 30,
      min: 0,
      idle: 10000,
      acquire: 1000000,
    },
    logging: (sql, queryObject) => {
      sendToElasticAndLogToConsole(sql, queryObject);
    },
    // sslmode: 'require',
    // ssl: {
    //   //ca:  fs.readFileSync(require('path').resolve(__dirname, './agridealer-digitalocean-managedb-ca-certificate.cer')).toString()
    //   ca: process.env.DATABASE_CER_BASE64
    //         ? Buffer.from(process.env.DATABASE_CER_BASE64, 'base64').toString('ascii')
    //         : '',
    // },
  });
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    pool: {
      max: 30,
      min: 0,
      idle: 10000,
      acquire: 1000000,
    },
    logging: (sql, queryObject) => {
      // sendToElasticAndLogToConsole(sql, queryObject);
    },
    // sslmode: 'require',
    // ssl: {
    //   //ca:  fs.readFileSync(require('path').resolve(__dirname, './agridealer-digitalocean-managedb-ca-certificate.cer')).toString()
    //   ca: process.env.DATABASE_CER_BASE64
    //         ? Buffer.from(process.env.DATABASE_CER_BASE64, 'base64').toString('ascii')
    //         : '',
    // },
  });
}
sequelize
  .authenticate()
  .then(() => {
    console.log(`Connection has been established successfully with ${config.database}.`);
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

function sendToElasticAndLogToConsole(sql, queryObject) {
  const tablename = queryObject.tableNames ? queryObject.tableNames[0] : null;
  const query = {
    text: `INSERT INTO public."dblogs"("tablename", "querieslogs", "queriestype", "createdat", "updatedat")
      VALUES('${tablename}','${sql}','${
      queryObject.type
    }','${new Date().toDateString()}','${new Date().toDateString()}')`,
  };
  pool2.query(query, async (err, res2) => {
    if (err !== undefined) {
      // console.log(err, 'error from pool2 model-indexjs');
    }
  });
}
