// express security
// https://expressjs.com/en/advanced/best-practice-security.html

// roles : https://github.com/ForbesLindesay/connect-roles
require('dotenv').config();
const express = require('express');
const app = express();
const passport = require('passport');
const swaggerRouter = require('routers/swaggerRouter');
const morgan = require('morgan');
// const logger = require('middleware/logger');
// configure
const configurePassport = require('config/passportLocal');
const configureExpress = require('config/express');
configurePassport(app, passport);
configureExpress(app, passport);
const { create: monsantoReqLogCreator } = require('middleware/monsantoReqLogCreator');

const { pool, pool2 } = require('config/connection');
//cron
// const { doStatementJob } = require('./cron_statement');
// const { checkMonsantoProductsQuantity } = require('./cron_monsanto_quantity');
// const { updatePricesheet } = require('./cron_pricesheet');
// const { resetPricesheetSyncState } = require('./reset_pricesheetsync');
// const { syncInventory } = require('./cron_inventorySync');
// const {checkShortProduct}  = require ('./cron_shortProduct.js')

// doStatementJob();
// checkMonsantoProductsQuantity()
// updatePricesheet();
// resetPricesheetSyncState()
// syncInventory();
// checkShortProduct()
const logger = morgan('combined');
const go = require('./update_seed_company_meta_data');

pool2.query(`CREATE DATABASE ${process.env.APILOG_DB_NAME}`, function (err, res) {
  // create user's db
  if (err) console.log('ignoring the error'); // ignore if the db is there
  if (res) {
    console.log('DB created succesfully', process.env.APILOG_DB_NAME);
  }
  pool2.query(
    `select exists(SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${process.env.APILOG_DB_NAME}'))`,
    (err, res) => {
      console.log('hellllo');
      if (res && res.rows[0].exists === true) {
        pool2.query("SELECT to_regclass('public.apiLogs')", (err, res) => {
          if (res && res.rows && res.rows[0].to_regclass === null) {
            pool2.query(
              'CREATE TABLE apiLogs(id bigserial PRIMARY KEY , organizationId text , userId text ,requestType text ,apiType text, description text,apiStatus integer, payload text, responseTime text,createdAt TIMESTAMPTZ , updatedAt TIMESTAMPTZ )',
              (err, res) => {
                if (err !== undefined) {
                  console.log(err);
                }
                pool2.query(
                  "ALTER TABLE apiLogs ALTER id SET DEFAULT nextval('apiLogs_serial_id_seq')",
                  (err, res) => {},
                );
              },
            );
          }
        });

        pool2.query("SELECT to_regclass('public.dbLogs')", (err, res) => {
          if (res && res.rows && res.rows[0].to_regclass === null) {
            pool2.query(
              'CREATE TABLE dbLogs(id bigserial PRIMARY KEY ,tablename text, queriesLogs text ,queriestype text ,createdAt TIMESTAMPTZ , updatedAt TIMESTAMPTZ )',
              (err, res) => {
                if (err !== undefined) {
                  console.log(err);
                }
                pool2.query("ALTER TABLE dbLogs ALTER id SET DEFAULT nextval('dbLogs_serial_id_seq')", (err, res) => {
                  if (err !== undefined) {
                    console.log(err);
                  }
                });
              },
            );
          }
        });
      }
    },
  );
  // close the connection
});

if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerRouter);
}
morgan.token('body', (req, res) => JSON.stringify(req.body));

morgan.token('organizationId', (req, res) => {
  return req.user && req.user.dataValues.organizationId;
});
morgan.token('userId', (req, res) => {
  return req.user && req.user.dataValues.id;
});
morgan.token('username', (req, res) => {
  return req.user && req.user.dataValues.firstName;
});
app.use(
  morgan(
    ':method - :status - :url - :response-time ms - organizationId - :organizationId - UserId - :userId  - username - :username  - req[body]- :body  - res[content-length]- :res[content-length]:req[content-length] ',
    {
      stream: (logger.stream = {
        write: (message) => {
          const organizationId = message.split('-')[5].trim();
          const userId = message.split('-')[7].trim();
          const apiType = message.split('-')[2].trim();
          // console.log(message.split('-'), 'message');
          const d = {
            organizationId: parseInt(organizationId) || 'auth',
            userId: userId === 'UserId' ? 'auth' : parseInt(userId),
            apiType: apiType.search('token') ? apiType.split('token')[0] : apiType,
            description: message,
            apiStatus: message.split('-')[1],
            responseTime: message.split('-')[3].trim(),
            payload: message.split('-')[11].trim(),
            requestType: message.split('-')[0],
          };

          // console.log(apiType, 'apiType');

          const query = {
            text: `INSERT INTO public."apilogs"("organizationid", "userid", "requesttype", "apitype", "description", "apistatus", "payload", "responsetime", "createdat", "updatedat")
            VALUES('${organizationId}','${userId}','${d.requestType}','${d.apiType}','${d.description}','${
              d.apiStatus
            }','${d.payload}','${d.responseTime}','${new Date().toDateString()}','${new Date().toDateString()}')`,
          };
          pool2.query(query, async (err, res2) => {
            if (err !== undefined) {
              // console.log(err, 'error from pool2 appjs');
            }
          });

          // ApiLog.create({
          //   organizationId: parseInt(organizationId) || null,
          //   userId: parseInt(userId),
          //   type: message.split('-')[1].trim(),
          //   description: message,
          //   // apiStatus:message.split('-')[1]
          //   // responseTime:message.split('-')[3]
          //   // payload:message.split('-')[14]
          // requestType: message.split('-')[0];
          // })
          //   .then((res) => {
          //     console.log('done Succesfully');
          //   })
          //   .catch((e) => {
          //     console.log(e, 'error from logs');
          //   });
        },
      }),
    },
  ),
);

// register router
app.use(require('routers/apiRouter'));
app.use('/api/admin', require('routers/adminRouter'));
logger.stream = {
  write: (message) => {
    console.log(message, 'message');
  },
};
/*
 *   ERRORS
 */
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: err });
});

app.use('/invoice', express.static('utilities/invoice'));

module.exports = app;
