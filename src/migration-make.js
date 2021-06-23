const { format: dateFormat } = require('date-fns');
const fs = require('fs');
const path = require('path');
const { migrationDirectory, buildInfo } = require('./libs/system');
const { isStartWithKeywordCreate, csuccess, cerror } = require('./libs/helpers');

exports.command = 'migration:make [name]';

// exports.aliases = ['migration:generate [name]', 'migration:create [name]'];

exports.describe = 'Create migration file.';

exports.builder = (args) => args
  .option('name', {
    describe: 'Migration name',
    type: 'string',
    demandOption: true,
  })
  .example([
    [
      '$0 migration:make create-pet-store',
      'When start with "create" keyword, creating new Parse.Schema template migration will be created.',
    ],
    [
      '$0 migration:make update-pet-store',
    ],
    [
      '$0 migration:make add-firstname-and-last-name-to-user-schema',
    ],
  ]);

/**
* Create migration filename
*
* @param {string} name - Action name
* @returns {string | undefined}
*/
function migrationMake(name) {
  const now = new Date();
  const datetime = dateFormat(now, 'yyyyMMddHHmmss');
  const formattedName = name.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/gi, '_');
  const filename = `${datetime}-${formattedName}`;

  const templateFile = (isStartWithKeywordCreate(name))
    ? fs.readFileSync(path.join(__dirname, './templates/template_create-schema.js'))
    : fs.readFileSync(path.join(__dirname, './templates/template_modify-schema.js'));

  // TODO: Check if file already exists. Because of the timestamp is inserted infront of filename
  // Same name should never exist. But, just for protection.

  const migrationFilePath = path.join(migrationDirectory, `/${filename}.js`);
  fs.writeFileSync(migrationFilePath, templateFile);

  return migrationFilePath;
}

exports.handler = (args) => {
  const { name } = args;

  console.log(`\n${buildInfo}\n`);

  const migrationFilePath = migrationMake(name);

  if (migrationFilePath) {
    console.log(csuccess(`New migration was created at ${migrationFilePath}\n`));
  } else {
    console.log(cerror(`Failed to create migration for ${name}`));
  }
};
