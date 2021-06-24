const FastGlob = require('fast-glob');
const path = require('path');
const { isRequiredDirExist } = require('./helpers');
const L = require('./logger');
const { migrationDirectory } = require('./system');

/**
 * Get all migrations that already run (stored in database)
 *
 * @param {Parse} Parse
 * @returns {Promise<string[]>} Already run migrations
 */
async function getAllRunMigrations(Parse) {
  const migrationQuery = new Parse.Query('Migration');
  const migrations = await migrationQuery.findAll({ useMasterKey: true });
  if (migrations.length === 0) {
    throw new Error('No run migrations found. Run migrations data is empty');
  }
  return migrations.map((migration) => migration.get('name'));
}

/**
 *
 * @param {Parse} Parse
 * @returns {Promise<MigrationDetail[]>}
 */
exports.getAllMigrations = async (Parse) => {
  if (await isRequiredDirExist()) {
    console.log(L.error('Required directory not found.'));
    console.log('\nSetup directories by running `npx parse-dbtool init`.\n');
    throw new Error('');
  }

  const migrationFiles = FastGlob.sync(`${path.resolve(process.cwd(), migrationDirectory)}/**`);
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
exports.removeMigrations = async (Parse, migrations) => {
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
exports.saveAllMigrations = (Parse, migrations) => {
  const Migration = Parse.Object.extend('Migration');

  const migrationsToSave = migrations.map((migration) => {
    const migrationObject = new Migration();
    migrationObject.set('name', migration.name);
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
  getAllRunMigrations,
};
