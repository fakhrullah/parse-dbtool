const chalk = require('chalk');

/**
 * Write error log
 *
 * @param {string} text
 * @returns {string}
 */
const error = (text) => chalk`{white.bgRed  ERROR } ${text}`;

/**
 * @param {string} text
 *
 */
const success = (text) => `${chalk.white.bgGreen(' SUCCESS ')} ${text}`;

const info = (text) => `${chalk.white.bgBlue(' INFO ')} ${text}`;

/**
 * @param {string} text
 *
 */
const checked = (text) => `${chalk.green(' ✓ ')}${text}`;

/**
 * @param {string} text
 *
 */
const loading = (text) => `${chalk(' ⠶ ')}${text}`;

/**
 * @param {string} text
 *
 */
const up = (text) => `${chalk.whiteBright.bgGreen(' ✓ ')} up   ${text}`;

/**
 * @param {string} text
 *
 */
const down = (text) => `${chalk.whiteBright.bgRed(' ‒ ')} down ${text}`;

module.exports = {
  success,
  error,
  // warning,
  info,
  checked,
  loading,
  up,
  down,
};
