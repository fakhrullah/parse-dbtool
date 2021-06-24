require('dotenv').config();
const path = require('path');
const chalk = require('chalk');
// eslint-disable-next-line import/no-extraneous-dependencies
const Parse = require('parse/node');

const MigrationError = require('./libs/MigrationError');
const { buildInfo } = require('./libs/system');
const { isRequiredEnvironmentAvailable } = require('./libs/helpers');
const L = require('./libs/logger');
const { getAllMigrations, saveAllMigrations } = require('./libs/migration-model');

const {
  APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
} = process.env;

/**
 * @typedef {import('./libs/migration-model').MigrationDetail} MigrationDetail}
 */

exports.command = 'migrate';

// exports.aliases = ['migration:up', 'migration:run'];

exports.describe = 'Run migrations.';

// exports.builder = (args) => args
//   .option('seed', {
//     describe: 'Also run seed.',
//     type: 'boolean',
//     example: '',
//   });

Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
Parse.serverURL = SERVER_URL;

/**
 *
 * @returns {Promise<MigrationDetail[]>}
 */
async function migrationUp() {
  // Check required environment and stop function when not environment is not enough
  const checkToConnectToParseServer = await isRequiredEnvironmentAvailable(
    SERVER_URL,
    APPLICATION_ID,
    MASTER_KEY,
  );
  if (!checkToConnectToParseServer) {
    throw checkToConnectToParseServer;
  }

  /** @type {MigrationDetail[]} */
  const migrationsDone = [];

  /** @type {MigrationDetail[]} */
  const migrationsToRun = await getAllMigrations(Parse)
    .then((migrations) => migrations.filter((migration) => migration.status === 'down'));

  if (migrationsToRun.length === 0) {
    throw new MigrationError('No migrations were executed, database schema was already up to date.');
  }

  // run up() of all files
  // eslint-disable-next-line no-restricted-syntax
  for (const migrationToRun of migrationsToRun) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(migrationToRun.fullpath);
    const migrationFilename = path.basename(migrationToRun.name);

    console.log(L.loading(`Migrating ${migrationFilename}`));

    try {
      // eslint-disable-next-line no-await-in-loop
      await migrationScript.up(Parse);
      console.log(L.checked(`Migrated  ${migrationFilename}\n`));
      migrationsDone.push(migrationToRun);
    } catch (error) {
      console.log(L.error(error.message));
      // Break the loop when error happen
      break;
    }

    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return migrationsDone;
}

exports.handler = async (args) => {
  /** @type {boolean} */
  const shouldRunSeed = args.seed || false;

  console.log(`\n${buildInfo}\n`);

  // Validate parse-server connection

  console.log(chalk`Run migration on parse-server at {underline ${SERVER_URL}}\n`);

  const runMigrations = await migrationUp();

  await saveAllMigrations(Parse, runMigrations);

  // TODO: Seed
  if (shouldRunSeed) {
    // Run seeders
  }

  console.log(`\n${L.success('Successfully run migrations.\n')}`);
};
