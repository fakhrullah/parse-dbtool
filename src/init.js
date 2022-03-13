const fs = require('fs');
const path = require('path');
const Parse = require('parse/node');
const L = require('./libs/logger');
const { initMigrationSchema } = require('./libs/migration-model');
const {
  buildInfo, databaseDirectory, migrationDirectory, seederDirectory,
} = require('./libs/system');
const { isRequiredEnvironmentAvailable } = require('./libs/helpers');

const {
  APPLICATION_ID, MASTER_KEY, SERVER_URL,
} = process.env;

const initHandler = async (args) => {
  console.log(`\n${buildInfo}\n`);
  console.log('Initialize parse-server to suport migration and seeds\n');

  const validations = [
    {
      name: 'database-dir',
      isValid: false,
    },
    {
      name: 'migration-dir',
      isValid: false,
    },
    {
      name: 'seed-dir',
      isValid: false,
    },
    {
      name: 'database-connect',
      isValid: false,
    },
  ];

  // TODO: Create config file (.parse-dbtool.js)

  // check databases/ & create if not exist yet
  const databasesDir = path.resolve(databaseDirectory);
  if (fs.existsSync(databasesDir)) {
    // console.log(L.error('databases/ directory not exist'));
    console.log(L.error('The `databases/` directory already exist. Failed to initialize.\n'));

    // TODO: How to solve this (--force flag?)
    return;
  }
  validations.find((validation) => validation.name === 'database-dir').isValid = true;

  // Check databases/migrations/ dir
  const migrationDir = path.resolve(migrationDirectory);
  if (fs.existsSync(migrationDir)) {
    console.log(L.error(`The migration folder already exist at ${migrationDir}\n`));
  }
  validations.find((validation) => validation.name === 'migration-dir').isValid = true;

  // Check databases/seeder/ dir
  const seederDir = path.resolve(seederDirectory);
  if (fs.existsSync(seederDir)) {
    console.log(L.error(`The seeders folder already exist at ${seederDir}\n`));
  }
  validations.find((validation) => validation.name === 'seed-dir').isValid = true;

  // Check environment to connect to ParseServer
  const requiredEnv = await isRequiredEnvironmentAvailable(SERVER_URL, APPLICATION_ID, MASTER_KEY)
    .catch((err) => {
      console.log(L.error(''));
      throw err;
    });
  if (requiredEnv) {
    validations.find((validation) => validation.name === 'database-connect').isValid = true;
  }

  /** @type {boolean} */
  const allValid = validations.reduce((acc, curr) => acc && curr.isValid, true);

  if (allValid) {
    // Initialize Migration schema
    Parse.initialize(APPLICATION_ID, '', MASTER_KEY);
    Parse.serverURL = SERVER_URL;
    initMigrationSchema(Parse)
      .then(() => {
        //
        fs.mkdirSync(databasesDir);
        console.log(L.success(`Successfully created databases folder at ${databasesDir}`));

        fs.mkdirSync(migrationDir);
        console.log(L.success(`Successfully created migrations folder at ${migrationDir}`));

        fs.mkdirSync(seederDir);
        console.log(L.success(`Successfully created seeder folder at ${seederDir}`));

        console.log(L.success('Successfully created Migration Schema in database'));
        console.log('');
      })
      .catch((err) => {
        console.log(L.error('Cannot initialize Migration Schema'));
        throw err;
      });
  }
};

module.exports = {
  command: 'init',
  // aliases: 'initiliaze',
  describe: 'Initialize directory structures',
  // builder: {},
  handler: initHandler,
};
