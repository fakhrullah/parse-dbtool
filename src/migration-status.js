const Parse = require('parse/node');
const L = require('./libs/logger');
const { isRequiredEnvironmentAvailable } = require('./libs/helpers');
const { getAllMigrations } = require('./libs/migration-model');
const { buildInfo } = require('./libs/system');

const {
  APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
} = process.env;

Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
Parse.serverURL = SERVER_URL;

/**
 *
 * @param {import('yargs').Argv} args
 * @returns
 */
const builder = (args) => args
  .example([
    [
      '$0 migration:status',
    ],
  ]);

// eslint-disable-next-line no-unused-vars
const migrationStatusHandler = async (args) => {
  console.log(`\n${buildInfo}\n`);

  await isRequiredEnvironmentAvailable(
    SERVER_URL,
    APPLICATION_ID,
    MASTER_KEY,
  )
    .catch((err) => console.log(L.error(err.message)));

  const allMigrations = await getAllMigrations(Parse);

  allMigrations.forEach(({ status, name }) => {
    if (status === 'up') console.log(L.up(name));
    else if (status === 'down') console.log(L.down(name));
  });

  // Add spacing
  console.log('');
};

module.exports = {
  command: 'migration:status',
  // aliases: 'migration:show',
  describe: 'Show list migrations and it status',
  builder,
  handler: migrationStatusHandler,
};
