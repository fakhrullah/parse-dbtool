const fs = require('fs');
const path = require('path');
const L = require('./libs/logger');
const { initMigrationSchema } = require('./libs/migration-model');
const {
  buildInfo, databaseDirectory, migrationDirectory, seederDirectory,
} = require('./libs/system');

const initHandler = (args) => {
  console.log(`\n${buildInfo}\n`);

  console.log('Initialize parse-server to suport migration and seeds\n');

  // TODO: Create config file (.parse-dbtool.js)

  // check databases/ & create if not exist yet
  const databasesDir = path.resolve(databaseDirectory);
  if (fs.existsSync(databasesDir)) {
    // console.log(L.error('databases/ directory not exist'));
    console.log(L.error('The `databases/` directory already exist. Failed to initialize.\n'));

    // TODO: How to solve this (--force flag?)
    return;
  }
  fs.mkdirSync(databasesDir);
  console.log(L.success(`Successfully created databases folder at ${databasesDir}`));

  // Check databases/migrations/ dir & create if not exist yet
  const migrationDir = path.resolve(migrationDirectory);
  if (fs.existsSync(migrationDir)) {
    console.log(L.error(`The migration folder already exist at ${migrationDir}\n`));
  } else {
    fs.mkdirSync(migrationDir);
    console.log(L.success(`Successfully created migrations folder at ${migrationDir}`));
  }

  // Check databases/seeder/ dir & create if not exist yet
  const seederDir = path.resolve(seederDirectory);
  if (fs.existsSync(seederDir)) {
    console.log(L.error(`The seeders folder already exist at ${seederDir}\n`));
  } else {
    fs.mkdirSync(seederDir);
    console.log(L.success(`Successfullt created seeder folder at ${seederDir}`));
  }

  // Initialize Migration schema
  initMigrationSchema().catch((err) => console.log(err));

  console.log('');
};

module.exports = {
  command: 'init',
  // aliases: 'initiliaze',
  describe: 'Initialize directory structures',
  // builder: {},
  handler: initHandler,
};
