const path = require('path');

module.exports = (sourceMD) => {

  // Parse md files
  const contentBase = path.join(__dirname, './content');
  sourceMD(path.join(contentBase, '/*.md'), 'tokens');

  /**
    If you want to parse content from node_modules instead of providing a relative/absolute path,
    you can do something similar to this:
    const extensionPath = require
      .resolve('@patternfly/react-log-viewer/package.json')
      .replace('package.json', 'src');
    sourceProps(path.join(extensionPath, '/**\/*.tsx'), propsIgnore);
    sourceMD(path.join(extensionPath, '../patternfly-docs/**\/examples/*.md'), 'react');
    sourceMD(path.join(extensionPath, '../patternfly-docs/**\/demos/*.md'), 'react-demos');
    sourceMD(path.join(extensionPath, '../patternfly-docs/**\/design-guidelines/*.md'), 'design-guidelines');
  */
};
