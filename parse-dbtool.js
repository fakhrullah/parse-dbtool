#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const init = require('./init');
const migrationMake = require('./migration-make');
const migrationUp = require('./migration-up');
const migrationDown = require('./migration-down');
const seedRun = require('./seed-run');

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName('parse-dbtool')
  .command(init)
  .command(migrationMake)
  .command(migrationUp)
  .command(migrationDown)
  .command(seedRun)
  .demandCommand(1)
  .strict()
  // Show help when failed and when no command
  .showHelpOnFail(true)
  .version('1.0.0')
  .help('h')
  .alias('h', 'help')
  .argv;
