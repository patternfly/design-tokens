const { program } = require('commander');
const {build} = require('./build');

program
  .version(require('./package.json').version)
  .description('Builds the PF design tokens using style dictionary')
  .option('-s, --selector <selector>', 'CSS selector to use for the output', ':root')
  .action((cliOptions) => build(cliOptions.selector));

program.parse(process.argv);
