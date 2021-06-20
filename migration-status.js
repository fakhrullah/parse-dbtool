require('dotenv').config();
const Parse = require('parse/node');
const {
  isRequiredEnvironmentAvailable, cerror, cup, cdown,
} = require('./libs/helpers');
const { getAllMigrations } = require('./libs/migration-model');
const { buildInfo } = require('./libs/system');

const {
  APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
} = process.env;

exports.command = 'migration:status';

// exports.aliases = 'migration:show';

exports.describe = 'Show list migrations and it status';

exports.builder = (args) => args
  .example([
    [
      '$0 migration:status',
    ],
  ]);

Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
Parse.serverURL = SERVER_URL;

// eslint-disable-next-line no-unused-vars
exports.handler = async (args) => {
  console.log(`\n${buildInfo}\n`);

  await isRequiredEnvironmentAvailable(
    SERVER_URL,
    APPLICATION_ID,
    MASTER_KEY,
  )
    .catch((err) => console.log(cerror(err.message)));

  const allMigrations = await getAllMigrations(Parse);

  allMigrations.forEach(({ status, name }) => {
    if (status === 'up') console.log(cup(name));
    else if (status === 'down') console.log(cdown(name));
  });

  // Add spacing
  console.log('');
};
