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

module.exports = {
  csuccess,
  cerror,
};
