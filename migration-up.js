const { migrationUp } = require('./libs');

exports.command = 'migration-up [seed]';

exports.aliases = ['migrate [seed]', 'migration-run [seed]'];

exports.describe = 'Run migrations.';

exports.builder = (args) => args
  .option('seed', {
    describe: 'Also run seed.',
    type: 'boolean',
    example: '',
  });

exports.handler = (args) => {
  console.log('Migration up');

  if (args.seed) migrationUp(true);
  else migrationUp();

  // throw new Error('Not implement yet!');
};
