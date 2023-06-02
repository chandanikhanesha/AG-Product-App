const { Router } = require('express');
const router = (module.exports = Router());
var Sequelize = require('sequelize');
var config = require('config').getConfig();

router.get('/', (req, res, next) => {
  try {
    res.status(200).json({ error: false, message: `All API is working perfectly` });
  } catch (e) {
    res.status(500).json({ error: true, message: e });
  }
});

router.get('/dbCheck', (req, res, next) => {
  var sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    pool: {
      max: 30,
      min: 0,
      idle: 10000,
      acquire: 1000000,
    },
    logging: false,
    // sslmode: 'require',
    // ssl: {
    //   //ca:  fs.readFileSync(require('path').resolve(__dirname, './agridealer-digitalocean-managedb-ca-certificate.cer')).toString()
    //   ca: Buffer.from(process.env.DATABASE_CER_BASE64, 'base64').toString('ascii'),
    // },
  });
  sequelize
    .authenticate()
    .then(() => {
      return res
        .status(200)
        .json({ error: false, message: `Connection has been established successfully with ${config.database}.` });
    })
    .catch((err) => {
      return res.status(500).json({ error: true, message: `Unable to connect to the database:${err}` });
    });
});
