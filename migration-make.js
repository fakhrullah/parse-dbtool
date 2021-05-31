const { migrationMake } = require('./libs');

exports.command = 'migration-make [name]';

exports.aliases = 'migration-generate [name]';

exports.describe = 'Create migration file.';

exports.builder = (args) => args
  .option('name', {
    describe: 'Migration name',
    type: 'string',
    example: '',
    demandOption: true,
  });

exports.handler = (args) => {
  const {name} = args;
  console.log(`Migration make ${args.name}`);
  migrationMake(name);
};
