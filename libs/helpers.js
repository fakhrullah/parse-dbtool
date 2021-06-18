const chalk = require('chalk');

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
 *
 * @param {string} text
 * @returns {bool}
 */
const isStartWithKeywordCreate = (text) => text.startsWith('create') !== -1;

module.exports = {
  csuccess,
  cerror,
  isStartWithKeywordCreate,
};
