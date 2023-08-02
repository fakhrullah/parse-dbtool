const Parse = require('parse/node');
const { buildInfo } = require('../libs/system');

async function handlerGetSchema(argv) {
  // get environment

  const {
    APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY, SERVER_URL,
  } = process.env;

  Parse.initialize(APPLICATION_ID, JAVASCRIPT_KEY, MASTER_KEY);
  Parse.serverURL = SERVER_URL;

  // fetch schema detail from server
  const schema = new Parse.Schema(argv.className);
  const response = await schema.get();

  console.log(`\n${buildInfo}\n`);

  console.log(response);
}

module.exports = {
  command: 'getSchema <className>',
  desc: 'Get Schema data for given Parse Classname',
  handler: handlerGetSchema,
};
