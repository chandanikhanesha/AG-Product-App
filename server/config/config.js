require('dotenv').config(); // this is important!
let config = {
  local: {
    username: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
    monsantoUser: process.env.MONSANTO_USER,
    monsantoPassword: process.env.MONSANTO_PASSWORD,
    monsantoEndPoint: process.env.MONSANTO_ENDPOINT,
    monsantoTechnologyId: process.env.MONSANTO_TECHNOLOGY_ID,
    monsantoTechnologyGln: process.env.MONSANTO_TECHNOLOGY_GLN,
  },
  development: {
    username: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
    monsantoUser: process.env.MONSANTO_USER,
    monsantoPassword: process.env.MONSANTO_PASSWORD,
    monsantoEndPoint: process.env.MONSANTO_ENDPOINT,
    monsantoTechnologyId: process.env.MONSANTO_TECHNOLOGY_ID,
    monsantoTechnologyGln: process.env.MONSANTO_TECHNOLOGY_GLN,
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: true,
    // },
    monsantoUser: process.env.MONSANTO_USER,
    monsantoPassword: process.env.MONSANTO_PASSWORD,
    monsantoEndPoint: process.env.MONSANTO_ENDPOINT,
    monsantoTechnologyId: process.env.MONSANTO_TECHNOLOGY_ID,
    monsantoTechnologyGln: process.env.MONSANTO_TECHNOLOGY_GLN,
  },
  production: {
    username: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
    monsantoUser: process.env.MONSANTO_USER,
    monsantoPassword: process.env.MONSANTO_PASSWORD,
    monsantoEndPoint: process.env.MONSANTO_ENDPOINT,
    monsantoTechnologyId: process.env.MONSANTO_TECHNOLOGY_ID,
    monsantoTechnologyGln: process.env.MONSANTO_TECHNOLOGY_GLN,
  },
};

// console.log('CONFIGG ####', config);

module.exports = config;
