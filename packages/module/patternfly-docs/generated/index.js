module.exports = {
  '/tokens/all-patternfly-tokens/tokens': {
    id: "All PatternFly tokens",
    title: "All PatternFly tokens",
    toc: [],
    section: "tokens",
    subsection: "",
    source: "tokens",
    tabName: null,
    Component: () => import(/* webpackChunkName: "tokens/all-patternfly-tokens/tokens/index" */ './tokens/all-patternfly-tokens/tokens')
  }
};