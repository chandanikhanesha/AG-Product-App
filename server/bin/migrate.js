if (process.argv[2] === undefined || process.argv[2] == null) {
  console.log(`Please specify a valid command`);
  return false;
}

const path = require('path');
const child_process = require('child_process');
const Umzug = require('umzug');

const { sequelize } = require('models');
const DB_NAME = sequelize.config.database;
const DB_USER = sequelize.config.username;

const cmd = process.argv[2].trim();

const umzug = new Umzug({
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },

  migrations: {
    params: [
      sequelize.getQueryInterface(), // queryInterface
      sequelize.constructor, // DataTypes
      function () {
        throw new Error(
          'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.',
        );
      },
    ],
    path: 'migrations',
    pattern: /\.js$/,
  },

  logging() {
    console.log(...arguments);
  },
});

function logUmzugEvent(eventName) {
  return (name, migration) => console.log(`${name} ${eventName} - ${migration}`);
}
umzug.on('migrating', logUmzugEvent('migrating'));
umzug.on('migrated', logUmzugEvent('migrated'));
umzug.on('reverting', logUmzugEvent('reverting'));
umzug.on('reverted', logUmzugEvent('reverted'));

function mapBaseName(m) {
  m.name = path.basename(m.file, '.js');
  return m;
}

function cmdStatus() {
  let result = {};

  return umzug
    .executed()
    .then((executed) => {
      result.executed = executed;
      return umzug.pending();
    })
    .then((pending) => {
      result.pending = pending;
      return result;
    })
    .then(({ executed, pending }) => {
      executed = executed.map(mapBaseName);
      pending = pending.map(mapBaseName);

      const status = {
        current: executed.length > 0 ? executed[0].file : '<NO_MIGRATIONS>',
        executed: executed.map((m) => m.file),
        pending: pending.map((m) => m.file),
      };

      console.log(JSON.stringify(status, null, 2));

      return { executed, pending };
    });
}

function cmdMigrate() {
  return umzug.up();
}

function cmdMigrateNext() {
  return cmdStatus().then(({ pending }) => {
    if (pending.length === 0) {
      return Promise.reject(new Error('No pending migrations'));
    }
    const next = pending[0].name;
    return umzug.up({ to: next });
  });
}

function cmdReset() {
  return umzug.down({ to: 0 });
}

function cmdResetPrev() {
  return cmdStatus().then(({ executed }) => {
    if (executed.length === 0) {
      return Promise.reject(new Error('Already at initial state'));
    }
    const prev = executed[executed.length - 1].name;
    return umzug.down({ to: prev });
  });
}

function cmdHardReset() {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        console.log(`dropdb ${DB_NAME}`);
        child_process.spawnSync(`dropdb ${DB_NAME}`);
        console.log(`createdb ${DB_NAME} --username ${DB_USER}`);
        child_process.spawnSync(`createdb ${DB_NAME} --username ${DB_USER}`);
        resolve();
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  });
}

let executedCmd;

console.log(`${cmd.toUpperCase()} BEGIN`);
switch (cmd) {
  case 'status':
    executedCmd = cmdStatus();
    break;

  case 'up':
  case 'migrate':
    executedCmd = cmdMigrate();
    break;

  case 'next':
  case 'migrate-next':
    executedCmd = cmdMigrateNext();
    break;

  case 'down':
  case 'reset':
    executedCmd = cmdReset();
    break;

  case 'prev':
  case 'reset-prev':
    executedCmd = cmdResetPrev();
    break;

  case 'reset-hard':
    executedCmd = cmdHardReset();
    break;

  default:
    console.log(`invalid cmd: ${cmd}`);
    process.exit(1);
}

executedCmd
  .then((result) => {
    const doneStr = `${cmd.toUpperCase()} DONE`;
    console.log(doneStr);
    console.log('='.repeat(doneStr.length));
  })
  .catch((err) => {
    const errorStr = `${cmd.toUpperCase()} ERROR`;
    console.log(errorStr);
    console.log('='.repeat(errorStr.length));
    console.log(err);
    console.log('='.repeat(errorStr.length));
  })
  .then(() => {
    if (cmd !== 'status' && cmd !== 'reset-hard') {
      return cmdStatus();
    }
    return Promise.resolve();
  })
  .then(() => process.exit(0));
