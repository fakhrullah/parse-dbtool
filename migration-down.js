require('dotenv').config();
const chalk = require('chalk');
const Parse = require('parse/node');
const {
  isRequiredEnvironmentAvailable, cerror, cloading, cright,
} = require('./libs/helpers');
const { getAllMigrations, removeMigrations } = require('./libs/migration-model');
const { buildInfo } = require('./libs/system');

const {
  APPLICATION_ID, MASTER_KEY, SERVER_URL,
} = process.env;

exports.command = 'migration:undo [step]';

// exports.aliases = 'migration:down';

exports.describe = 'Undo previous migrations.';

exports.builder = (args) => args
  .option('step', {
    describe: 'How many step back to undo',
    type: 'number',
  });

/**
 * Undo migration
 *
 * @returns {Promise<MigrationDetail[]>} List of undid migrations. Migrations that finish undo.
 */
async function migrationDown(step = 1) {
  /** @type {MigrationDetail[]} */
  const undidMigrations = [];

  await isRequiredEnvironmentAvailable(
    SERVER_URL,
    APPLICATION_ID,
    MASTER_KEY,
  ).catch((err) => console.log(cerror(err.message)));

  // Undo migration must be run from newest to oldest
  const allMigrations = await getAllMigrations(Parse);

  const reversedAlreadyRunMigrations = allMigrations
    .filter((migration) => migration.status === 'up')
    .sort((a, b) => b.name.toLocaleLowerCase().localeCompare(a.name.toLocaleLowerCase()));

  const migrationsToUndo = reversedAlreadyRunMigrations.slice(0, step);

  // eslint-disable-next-line no-restricted-syntax
  for (const migrationDetail of migrationsToUndo) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(migrationDetail.fullpath);

    console.log(cloading(`Reverting ${migrationDetail.name}`));

    // eslint-disable-next-line no-await-in-loop
    const undidMigration = await migrationScript.down(Parse);

    if (undidMigration) {
      undidMigrations.push(migrationDetail);
    } else {
      // Stop undoing when failed
      break;
    }

    console.log(cright(`Reverted  ${migrationDetail.name}\n`));

    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return undidMigrations;
}

exports.handler = async (args) => {
  console.log(`\n${buildInfo}\n`);

  const step = args.step || 1;

  console.log(chalk`Undo migration on parse-server at {underline ${SERVER_URL}}\n`);

  const undidMigrations = await migrationDown(step)
    .catch((err) => {
      console.log(cerror(err.message));
    });

  // Remove ran script from database
  await removeMigrations(Parse, undidMigrations);
};
