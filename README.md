## Patternfly Design Tokens

# Usage
`yarn build:scss` to build the SCSS files to the /build directory

By default `yarn build:scss` outputs the scss with `:root` as a selector, but you can also pass the `--selector` flag (or just `-s` for short) and specify any selector you want, i.e. `yarn build:scss -s .foo` will replace the `:root` selector with `.foo` in the generated scss files.

# Note
We are temporarily pushing the built SCSS files to the repo for ease of access. Additional PRs should rebuild and repush updated SCSS files if they would be affected by the PR changes, to keep them up to date.
