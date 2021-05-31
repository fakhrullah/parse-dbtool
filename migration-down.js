const { migrationDown } = require('./libs');

exports.command = 'migration-down';

exports.aliases = 'migration-undo';

exports.describe = 'Undo previous migrations.';

exports.builder = {};

exports.handler = (args) => {
  console.log('Migration down.');

  migrationDown();
};
