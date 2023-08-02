module.exports = {
  command: 'helper <command>',
  // command: 'helper <action> [value]',
  describe: 'Multiple of helpers than can be use when development.',
  builder(yargs) {
    return yargs.commandDir('helperCli');
  },
  handler(argv) {},
};
