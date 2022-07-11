const FastGlob = require('fast-glob');
const path = require('path');
const { isRequiredDirExist, convertToLinuxUrl } = require('./helpers');
const L = require('./logger');
const { migrationDirectory } = require('./system');

/**
 * @param {Parse} Parse
 *
 * @returns {Promise<any>}
 */
const initMigrationSchema = async (Parse) => {
  const schema = new Parse.Schema('Migration');
  schema.addString('name');

  /** @type {Parse.Schema.CLP} */
  const masterKeyOnlyCLP = {
    find: {},
    create: {},
    get: {},
    update: {},
    delete: {},
    count: {},
    addField: {},
  };
  schema.setCLP(masterKeyOnlyCLP);
  return schema.save();
};

/**
 * Get all migrations that already run (stored in database)
 *
 * @param {Parse} Parse
 * @returns {Promise<string[]>} Already run migrations
 */
async function getAllRunMigrations(Parse) {
  const migrationQuery = new Parse.Query('Migration');
  const migrations = await migrationQuery.findAll({ useMasterKey: true });
  return migrations.map((migration) => migration.get('name'));
}

/**
 * Get all files from migration directory
 *
 * @returns {string[]} Full path to the files
 */
function getAllMigrationFiles() {
  return FastGlob
    .sync(
      convertToLinuxUrl(
        path.resolve(process.cwd(), `${migrationDirectory}/**`),
      ),
    );
}

/**
 *
 * @param {Parse} Parse
 * @returns {Promise<MigrationDetail[]>}
 */
const getAllMigrations = async (Parse) => {
  if (!isRequiredDirExist()) {
    console.log(L.error('Required directory not found.'));
    console.log('\nSetup directories by running `npx parse-dbtool init`.\n');
    throw new Error('');
  }

  const migrationFiles = getAllMigrationFiles();
  const allRunMigrations = await getAllRunMigrations(Parse);

  return migrationFiles
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()))
    .map((migrationFile) => {
      const migrationName = path.basename(migrationFile);
      if (allRunMigrations.includes(migrationName)) return { status: 'up', name: migrationName, fullpath: migrationFile };
      return { status: 'down', name: migrationName, fullpath: migrationFile };
    });
};

/**
 *
 * @param {Parse} Parse
 * @param {MigrationDetail[]} migrations
 */
const removeMigrations = async (Parse, migrations) => {
  const migrationObjects = await Promise.all(migrations.map(async (migration) => {
    const migrationQuery = new Parse.Query('Migration');
    migrationQuery.equalTo('name', migration.name);

    const migrationObject = await migrationQuery.first({ useMasterKey: true });
    return migrationObject;
  }));

  return Parse.Object.destroyAll(migrationObjects, { useMasterKey: true });
};

/**
 *
 * @param {Parse} Parse
 * @param {MigrationDetail[]} migrations
 */
const saveAllMigrations = (Parse, migrations) => {
  const Migration = Parse.Object.extend('Migration');

  const migrationsToSave = migrations.map((migration) => {
    /** @type {Parse.Object} */
    const migrationObject = new Migration();
    migrationObject.set('name', migration.name);

    const masterKeyOnlyACL = new Parse.ACL();
    masterKeyOnlyACL.setPublicReadAccess(false);
    masterKeyOnlyACL.setPublicReadAccess(false);

    migrationObject.setACL(masterKeyOnlyACL);

    return migrationObject;
  });

  return Parse.Object.saveAll(migrationsToSave, { useMasterKey: true });
};

/**
 * @typedef MigrationDetail
 *
 * @property {('up'|'down')} status
 * @property {string} name
 * @property {string} fullpath
 */

module.exports = {
  initMigrationSchema,
  getAllRunMigrations,
  getAllMigrations,
  saveAllMigrations,
  removeMigrations,
};
