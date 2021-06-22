#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const init = require('./init');
const migrationMake = require('./migration-make');
const migrationUp = require('./migration-up');
const migrationDown = require('./migration-down');
const migrationStatus = require('./migration-status');
const seedRun = require('./seed-run');
const seedMake = require('./seed-make');
const pkg = require('./package.json');

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .scriptName('parse-dbtool')
  .command(init)
  .command(migrationUp)
  .command(migrationMake)
  .command(migrationStatus)
  .command(migrationDown)
  .command(seedRun)
  .command(seedMake)
  .demandCommand(1)
  .strict()
  // Show help when failed and when no command
  .showHelpOnFail(true)
  .version(pkg.version)
  .help('h')
  .alias('h', 'help')
  .argv;
