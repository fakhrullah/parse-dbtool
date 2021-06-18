const fs = require('fs');
const path = require('path');
const { cerror, csuccess } = require('./libs/helpers');
const {
  buildInfo, databaseDirectory, migrationDirectory, seederDirectory,
} = require('./libs/system');

exports.command = 'init';

// exports.aliases = 'initiliaze';

exports.describe = 'Initialize directory structures';

exports.builder = {};

exports.handler = (args) => {
  console.log(`\n${buildInfo}\n`);

  console.log('Initialize parse-server to suport migration and seeds\n');

  // TODO: Create config file (.parse-dbtool.js)

  // check databases/ & create if not exist yet
  const databasesDir = path.resolve(databaseDirectory);
  if (fs.existsSync(databasesDir)) {
    // console.log(cerror('databases/ directory not exist'));
    console.log(cerror('The `databases/` directory already exist. Failed to initialize.\n'));

    // TODO: How to solve this (--force flag?)
    return;
  }
  fs.mkdirSync(databasesDir);
  console.log(csuccess(`Successfully created databases folder at ${databasesDir}`));

  // Check databases/migrations/ dir & create if not exist yet
  const migrationDir = path.resolve(migrationDirectory);
  if (fs.existsSync(migrationDir)) {
    console.log(cerror(`The migration folder already exist at ${migrationDir}\n`));
  } else {
    fs.mkdirSync(migrationDir);
    console.log(csuccess(`Successfullt created migrations folder at ${migrationDir}`));
  }

  // Check databases/migrations/ dir & create if not exist yet
  const seederDir = path.resolve(seederDirectory);
  if (fs.existsSync(seederDir)) {
    console.log(cerror(`The seeders folder already exist at ${seederDir}\n`));
  } else {
    fs.mkdirSync(seederDir);
    console.log(csuccess(`Successfullt created seeder folder at ${seederDir}`));
  }
  console.log('');
};
