const { format: dateFormat } = require('date-fns');
const { default: dedent } = require('ts-dedent');
const fs = require('fs');
const path = require('path');

/**
 *
 * @param {string} text
 * @returns {boolean}
 */
const isStartWithKeywordCreate = (text) => text.startsWith('create');

/**
 *
 * @param {string} APPLICATION_ID
 * @param {string} MASTER_KEY
 * @param {string} SERVER_URL
 * @returns {Promise<boolean>}
 */
const isRequiredEnvironmentAvailable = async (SERVER_URL, APPLICATION_ID, MASTER_KEY) => {
  if (!APPLICATION_ID || !MASTER_KEY || !SERVER_URL) {
    throw new Error(dedent`
      Detail to connect to server is not enough.

      These environment is required to connect to your parse-server:

      process.env.SERVER_URL     \t: ${SERVER_URL}
      process.env.APPLICATION_ID \t: ${APPLICATION_ID}
      process.env.MASTER_KEY     \t: ${MASTER_KEY}
    `);
  }
  return true;
};

const isParseDBToolRequiredDirExist = (dirpath) => fs
  .existsSync(path.resolve(process.cwd(), dirpath));

const isDatabaseDirExist = () => isParseDBToolRequiredDirExist('databases/');
const isMigrationDirExist = () => isParseDBToolRequiredDirExist('databases/migrations/');
const isSeederDirExist = () => isParseDBToolRequiredDirExist('databases/seeders/');

const isRequiredDirExist = () => isDatabaseDirExist()
  && isMigrationDirExist()
  && isSeederDirExist();

/**
 *
 * @param {Date} datetime
 * @param {String} name
 * @returns {string}
 */
const namingFile = (datetime, name) => {
  const formattedDatetime = dateFormat(datetime, 'yyyyMMddHHmmss');
  const formattedName = name.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/gi, '_');
  const filename = `${formattedDatetime}-${formattedName}`;
  return filename;
};

/**
 *
 * @param {string} url
 * @returns {string}
 */
const convertToLinuxUrl = (url) => url.replace(/\\/g, '/');

module.exports = {
  isStartWithKeywordCreate,
  isRequiredEnvironmentAvailable,
  isRequiredDirExist,
  namingFile,
  convertToLinuxUrl,
};
