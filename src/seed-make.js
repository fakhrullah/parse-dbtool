const path = require('path');
const fs = require('fs');
const { namingFile } = require('./libs/helpers');
const L = require('./libs/logger');
const { buildInfo, seederDirectory } = require('./libs/system');

const command = 'seed:make [name]';

// const aliases = ['seed:run'];

const describe = 'Make seeder file';

const builder = (args) => args
  .option('name', {
    describe: 'Migration name',
    type: 'string',
    demandOption: true,
  })
  .example([
    [
      '$0 seed:make add-sample-pets',
    ],
    [
      '$0 seed:make --name="add sample stores"',
    ],
  ]);

const createSeederFile = (name) => namingFile(new Date(), name);

const handler = async (args) => {
  const { name } = args;

  console.log(`\n${buildInfo}\n`);

  const seederFileTemplate = fs.readFileSync(path.join(__dirname, './templates/template_seeder.js'));

  const seederFilepath = path.resolve(seederDirectory, createSeederFile(name));
  fs.writeFileSync(seederFilepath, seederFileTemplate);

  if (seederFilepath) {
    console.log(L.success(`New migration was created at ${seederFilepath}\n`));
  } else {
    console.log(L.error(`Failed to create migration for ${name}`));
  }
};

module.exports = {
  command,
  describe,
  builder,
  handler,
};
