const { format: dateFormat } = require('date-fns');
const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');
// eslint-disable-next-line import/no-extraneous-dependencies
const Parse = require('parse/node');

const migrationDirectory = path.resolve('./databases/migrations');
const seederDirectory = path.resolve('./databases/seeders');

const {
  APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
} = process.env;

function isRequiredEnvironmentAvailable() {
  if (APPLICATION_ID === undefined) {
    return new Error('APPLICATION_ID environment is required');
  }
  if (MASTER_KEY === undefined) {
    return new Error('MASTER_KEY environment is required');
  }
  if (SERVER_URL === undefined) {
    return new Error('SERVER_URL environment is required');
  }
  return true;
}

Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
Parse.serverURL = SERVER_URL;

/**
 *
 * @param {string} text
 * @returns {bool}
 */
const isContainKeywordCreate = (text) => text.indexOf('create') !== -1;

/**
 * Create migration filename
 *
 * @param {string} name - Action name
 */
function migrationMake(name) {
  console.log(`Generate file migration, named ${name}`);
  const now = new Date();
  const datetime = dateFormat(now, 'yyyyMMdd_HHmmss');
  const formattedName = name.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/gi, '_');
  const filename = `${datetime}-${formattedName}`;

  const templateFile = (isContainKeywordCreate(name))
    ? fs.readFileSync(path.join(__dirname, './templates/template_create-schema.js'))
    : fs.readFileSync(path.join(__dirname, './templates/template_modify-schema.js'));

  const isFileExist = fs.existsSync();
  if (isFileExist) throw new Error('Error: File already exist.');

  fs.writeFileSync(path.join(migrationDirectory, `/${filename}.js`), templateFile);
}

exports.migrationMake = migrationMake;

/**
 *
 * @param {boolean} [isSeedRun]
 */
async function migrationUp(isSeedRun) {
  const isAllRequiredEnv = isRequiredEnvironmentAvailable();

  if (isAllRequiredEnv !== true) {
    throw isAllRequiredEnv;
  }

  const migrationFiles = fastGlob.sync(`${migrationDirectory}/**`);
  const sortedFiles = migrationFiles.sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()),
  );
  // console.log(sortedFiles);
  // TODO: get ran migrations from database
  // TODO: filter to get non-run migration files only

  console.log('Run all files inside databases/migrations');
  // run up() of all files
  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of sortedFiles) {
    console.log(filepath);
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(filepath);
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve(migrationScript.up(Parse));
    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // TODO: record ran migration files

  if (isSeedRun) {
    // eslint-disable-next-line no-use-before-define
    seedRun();
  }
}

exports.migrationUp = migrationUp;

/**
 * Undo migration
 */
async function migrationDown() {
  console.log('Run migration down');

  const migrationFiles = fastGlob.sync(`${migrationDirectory}/**`);
  // Undo migration must be run from newest to oldest
  const sortedFilesReversed = migrationFiles.sort(
    (a, b) => b.toLowerCase().localeCompare(a.toLocaleLowerCase()),
  );

  // TODO: get last group of ran migration files from database

  console.log('Run all files inside databases/migrations');
  // run up() of all files
  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of sortedFilesReversed) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(filepath);
    // console.log(filepath);
    // eslint-disable-next-line no-await-in-loop
    await migrationScript.down(Parse);
    // eslint-disable-next-line no-await-in-loop
    // await Promise.resolve(migrationScript.down(Parse));
    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
    // await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // TODO: Remove ran script from database
}

exports.migrationDown = migrationDown;

/**
 * Seed data
 */
async function seedRun() {
  console.log('Seed all files');

  const seederFiles = fastGlob.sync(`${seederDirectory}/**`);
  const sortedFiles = seederFiles.sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()),
  );

  console.log('Run all files inside databases/seeders');

  // run run() of all files
  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of sortedFiles) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migrationScript = require(filepath);
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve(migrationScript.run(Parse));
    // Add timeout to safety finish one function before going to next
    // eslint-disable-next-line no-await-in-loop
  }
}

exports.seedRun = seedRun;
