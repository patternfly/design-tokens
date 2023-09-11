module.exports = {
  '/design-guidelines': {
    id: "style-dictionary",
    title: "style-dictionary",
    toc: [{"text":"Header"},[{"text":"Sub-header"}]],
    section: "extensions",
    source: "design-guidelines",
    Component: () => import(/* webpackChunkName: "design-guidelines/index" */ './design-guidelines')
  },
  '/react': {
    id: "style-dictionary",
    title: "style-dictionary",
    toc: [{"text":"Basic usage"},[{"text":"Example"},{"text":"Fullscreen example"}]],
    examples: ["Example"],
    fullscreenExamples: ["Fullscreen example"],
    section: "extensions",
    source: "react",
    Component: () => import(/* webpackChunkName: "react/index" */ './react')
  }
};