const chalk = require('chalk');
const { default: dedent } = require('ts-dedent');

/**
 * Write error log
 *
 * @param {string} text
 * @returns {string}
 */
const cerror = (text) => chalk`{white.bgRed  ERROR } ${text}`;

/**
  * @param {string} text
  *
  */
const csuccess = (text) => `${chalk.white.bgGreen(' SUCCESS ')} ${text}`;

/**
  * @param {string} text
  *
  */
const cright = (text) => `${chalk.green(' ✓ ')}${text}`;

/**
  * @param {string} text
  *
  */
const cloading = (text) => `${chalk(' ⠶ ')}${text}`;

/**
  * @param {string} text
  *
  */
const cup = (text) => `${chalk.whiteBright.bgGreen(' ✓ ')} up   ${text}`;

/**
  * @param {string} text
  *
  */
const cdown = (text) => `${chalk.whiteBright.bgRed(' ‒ ')} down ${text}`;

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

module.exports = {
  csuccess,
  cerror,
  cright,
  cloading,
  cup,
  cdown,
  isStartWithKeywordCreate,
  isRequiredEnvironmentAvailable,
};
