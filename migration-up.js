require('dotenv').config();
const path = require('path');
const chalk = require('chalk');
const fastGlob = require('fast-glob');
// eslint-disable-next-line import/no-extraneous-dependencies
const Parse = require('parse/node');
const MigrationError = require('./libs/MigrationError');
const { migrationDirectory, buildInfo } = require('./libs/system');
const {
  cerror, csuccess, cright, cloading,
} = require('./libs/helpers');

const {
  APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
} = process.env;

exports.command = 'migrate';

exports.aliases = ['migration:up', 'migration:run'];

exports.describe = 'Run migrations.';

// exports.builder = (args) => args
//   .option('seed', {
//     describe: 'Also run seed.',
//     type: 'boolean',
//     example: '',
//   });

/**
 *
 * @returns {string}
 */
function isRequiredEnvironmentAvailable() {
  if (APPLICATION_ID === undefined) {
    return new Error('APPLICATION_ID environment is required');
  }
  if (MASTER_KEY === undefined) {
    return new Error('MASTER_KEY environment is required');
  }
  if (SERVER_URL === undefined) {
    return new Error('SERVER_URL environment is required');
  }
  return true;
}

Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
Parse.serverURL = SERVER_URL;

/**
 * @param {String[]} migrationsDone
 */
const recordMigration = async (migrationsDone) => {
  const migrations = migrationsDone.map((migrationDone) => {
    const MigrationObject = Parse.Object.extend('Migration');
    const migrationObject = new MigrationObject();
    migrationObject.set({
      name: migrationDone,
    });
    return migrationObject;
  });

  return Parse.Object.saveAll(migrations, { useMasterKey: true });
};

/**
 * @returns {Promise<string[]>}
 */
const readMigration = async () => {
  const migrationQuery = new Parse.Query('Migration');
  const migrations = await migrationQuery.findAll({ useMasterKey: true });
  return migrations.map((migration) => migration.get('name'));
};

/**
 *
 * @param {boolean} [isSeedRun]
 */
async function migrationUp(isSeedRun) {
  const isAllRequiredEnv = isRequiredEnvironmentAvailable();

  /** @type {String[]} */
  const migrationsDone = [];

  let isMigrationSuccess = false;

  if (isAllRequiredEnv !== true) {
    throw isAllRequiredEnv;
  }

  const migrationFiles = fastGlob.sync(`${path.resolve(process.cwd(), migrationDirectory)}/**`);

  if (migrationFiles.length === 0) {
    throw new Error('No migration files is found.');
  }

  const sortedFiles = migrationFiles.sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()),
  );

  const alreadyRunMigrations = await readMigration();

  const migrationFilesToRun = sortedFiles.filter(
    (filepath) => !alreadyRunMigrations.includes(path.basename(filepath)),
  );

  if (migrationFilesToRun.length === 0) {
    throw new MigrationError('No migrations were executed, database schema was already up to date.');
  }

  // run up() of all files
  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of migrationFilesToRun) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(filepath);
    const migrationFilename = path.basename(filepath);

    console.log(cloading(`Migrating ${migrationFilename}`));

    // eslint-disable-next-line no-await-in-loop
    const migration = await migrationScript.up(Parse);

    if (migration) {
      console.log(cright(`Migrated  ${migrationFilename}\n`));
      migrationsDone.push(migrationFilename);
    } else {
      // throw new Error(migration);
      isMigrationSuccess = false;
      // Break the loop when error happen
      break;
    }

    isMigrationSuccess = true;

    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Record ran migration files
  await recordMigration(migrationsDone);

  //
  if (!isMigrationSuccess) {
    throw new Error('Unexpected error. What is it? It is unexpected. No one knows.');
  }

  // Is all migrations is ran?

  // TODO: Seed
  // if (isSeedRun) {
  //   // eslint-disable-next-line no-use-before-define
  //   seedRun();
  // }
}

exports.handler = (args) => {
  console.log(`\n${buildInfo}\n`);

  // eslint-disable-next-line global-require

  // Validate required enviroment
  if (!APPLICATION_ID || !MASTER_KEY || !SERVER_URL) {
    console.log(cerror('Detail to connect to server is not enough.\n'));
    console.log(
      'These environment is required to connect to your parse-server: \n\n',
      `process.env.SERVER_URL     \t: ${SERVER_URL} \n`,
      `process.env.APPLICATION_ID \t: ${APPLICATION_ID} \n`,
      `process.env.MASTER_KEY     \t: ${MASTER_KEY} \n`,
    );
    return;
  }

  // Validate parse-server connection

  console.log(chalk`Run migration on parse-server at {underline ${SERVER_URL}}\n`);

  migrationUp(false)
    .then(() => {
      console.log(`\n${csuccess('Successfully run migrations.\n')}`);
    })
    .catch((err) => {
      if (err instanceof MigrationError) {
        console.log(`${err.message}\n`);
      } else {
        console.log(`\n${cerror(`${err.message}\n`)}`);
      }
      // console.log('\n---\n');
      // throw err;
    });
};
