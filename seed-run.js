const { seedRun } = require('./libs');

exports.command = 'seed';

exports.aliases = ['seed-run'];

exports.describe = 'Seed data';

exports.builder = {};

exports.handler = (args) => {
  console.log('Migration up');
  seedRun();

  // throw new Error('Not implement yet!');
};
