const chalk = require('chalk');
const path = require('path');
const fastGlob = require('fast-glob');
const Parse = require('parse/node');
const { isRequiredEnvironmentAvailable, convertToLinuxUrl } = require('./libs/helpers');
const { buildInfo, seederDirectory } = require('./libs/system');
const L = require('./libs/logger');

const {
  APPLICATION_ID, MASTER_KEY, SERVER_URL,
} = process.env;

/**
 * Seed data
 */
async function seedRun() {
  await isRequiredEnvironmentAvailable(SERVER_URL, APPLICATION_ID, MASTER_KEY);
  const seederFiles = fastGlob
    .sync(
      convertToLinuxUrl(
        path.resolve(process.cwd(), `${seederDirectory}/**`),
      ),
    );

  const sortedFiles = seederFiles.sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()),
  );

  console.log('Run all files inside databases/seeders');

  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of sortedFiles) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const seederScript = require(filepath);
    const filename = path.basename(filepath);

    console.log(L.loading(`Seeding ${filename}`));

    try {
      // eslint-disable-next-line no-await-in-loop
      await seederScript.run(Parse);
      console.log(L.checked(`Done    ${filename}\n`));
    } catch (error) {
      console.log(L.error(error.message));
      // Break the loop when error happen
      break;
    }

    // Add timeout to safety finish one function before going to next
  }
}

// eslint-disable-next-line no-unused-vars
const handler = async (args) => {
  console.log(`\n${buildInfo}\n`);

  console.log(chalk`Run seeders on parse-server at {underline ${SERVER_URL}}\n`);

  await seedRun();

  console.log(`\n${L.success('Successfully run seeders.\n')}`);
};

module.exports = {
  command: 'seed',
  describe: 'Seed data',
  // aliases: ['seed:run'],
  // builder: {},
  handler,
};
