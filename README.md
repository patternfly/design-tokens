## Patternfly Design Tokens

# Export tokens from Figma
Information about exporting tokens from the Figma Design Tokens & Styles library is with the [custom exporter](https://github.com/patternfly/design-tokens/tree/main/packages/module/plugins/export-patternfly-tokens).

# Usage
Once the design token JSON files are exported from Figma to the [tokens directories](https://github.com/patternfly/design-tokens/tree/main/packages/module/tokens), use `yarn build:scss` to build the SCSS files to the /build directory

By default `yarn build:scss` outputs the SCSS with `:root` as a selector, but you can also pass the `--selector` flag (or just `-s` for short) and specify any selector you want, i.e. `yarn build:scss -s .foo` will replace the `:root` selector with `.foo` in the generated SCSS files. For PatternFly core, export with the selector `@mixin pf-v6-tokens`

`yarn build:docs` and `yarn serve:docs` will build and run the docs locally.

# Note
We are temporarily pushing the built SCSS files to the repo for ease of access. Additional PRs should rebuild and repush updated SCSS files if they would be affected by the PR changes, to keep them up to date.

# Docs build

Whenever `yarn build:docs` is executed:
- the [build-js-for-docs.js](https://github.com/patternfly/design-tokens/blob/main/packages/module/build-js-for-docs.js) script is run to turn the scss files into a javascript object.
- The javascript object is stored in the [scssAsJson.json](https://github.com/patternfly/design-tokens/blob/main/packages/module/patternfly-docs/scssAsJson.json) file.
- The code for generating the table containing all tokens is the [tokensTable.js](https://github.com/patternfly/design-tokens/blob/main/packages/module/patternfly-docs/content/tokensTable.js), which consumes the javascript object from scssAsJson.json as data.
- Ultimately, the markdown file which is rendering the docs is [all-patternfly-tokens.md](https://github.com/patternfly/design-tokens/blob/main/packages/module/patternfly-docs/content/all-patternfly-tokens.md). This markdown file imports the tokensTable.js.

