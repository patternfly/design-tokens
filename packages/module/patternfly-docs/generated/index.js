module.exports = {
  '/design-tokens/all-patternfly-tokens/design-tokens': {
    id: "All PatternFly tokens",
    title: "All PatternFly tokens",
    toc: [],
    section: "design-tokens",
    subsection: "",
    source: "design-tokens",
    tabName: null,
    Component: () => import(/* webpackChunkName: "design-tokens/all-patternfly-tokens/design-tokens/index" */ './design-tokens/all-patternfly-tokens/design-tokens')
  },
  '/design-tokens/all-design-tokens/design-tokens': {
    id: "All design tokens",
    title: "All design tokens",
    toc: [],
    section: "design-tokens",
    subsection: "",
    source: "design-tokens",
    tabName: null,
    Component: () => import(/* webpackChunkName: "design-tokens/all-design-tokens/design-tokens/index" */ './design-tokens/all-design-tokens/design-tokens')
  }
};