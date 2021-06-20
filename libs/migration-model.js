// @ts-check
const FastGlob = require('fast-glob');
const path = require('path');
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
  return migrations.map((migration) => migration.get('name'));
}

/**
 *
 * @param {Parse} Parse
 * @returns {Promise<MigrationDetail[]>}
 */
exports.getAllMigrations = async (Parse) => {
  const migrationFiles = FastGlob.sync(`${path.resolve(process.cwd(), migrationDirectory)}/**`);
  const allRunMigrations = await getAllRunMigrations(Parse);

  return migrationFiles
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLocaleLowerCase()))
    .map((migrationFile) => path.basename(migrationFile))
    .map((migrationName) => {
      if (allRunMigrations.includes(migrationName)) return { status: 'up', name: migrationName };

      return { status: 'down', name: migrationName };
    });
};

exports.saveAllMigrations = () => {

};

/**
 * @typedef MigrationDetail
 *
 * @property {('up'|'down')} status
 * @property {string} name
 */
