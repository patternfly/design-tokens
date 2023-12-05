console.clear();

/* MAIN function */

figma.ui.onmessage = (e) => {
  console.log("code received message", e);
  if (e.type === "IMPORT") {
    const { selectedCollection, selectedMode, body } = e;
    importJSONFile({ selectedCollection, selectedMode, body });
    getExistingCollectionsAndModes();
  } else if (e.type === "EXPORT") {
    exportToJSON();
  } 
};
if (figma.command === "export") {
  figma.showUI(__uiFiles__["export"], {
    width: 820,
    height: 600,
    themeColors: true,
  });
}

/* EXPORT Functionality */

/* EXPORT - main function */

function exportToJSON() {
  const collections = figma.variables.getLocalVariableCollections();

  const files = [];
  collections.forEach((collection) =>
    files.push(...processCollection(collection))
  );

  figma.ui.postMessage({ type: "EXPORT_RESULT", files });
}

/* EXPORT - helper functions */

function processCollection({ name, modes, variableIds }) {
  const files = [];
  modes.forEach((mode) => {
    let file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };

    variableIds.forEach((variableId) => {
      const { name, resolvedType, valuesByMode } =
        figma.variables.getVariableById(variableId);
      const value = valuesByMode[mode.modeId];

      if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
        let obj = file.body;
        name.split("/").forEach((groupName) => {
          obj[groupName] = obj[groupName] || {};
          obj = obj[groupName];
        });
      
        obj.$type = resolvedType === "COLOR" ? "color" : "number";
        if (value.type === "VARIABLE_ALIAS") {
          obj.$value = `{${figma.variables
            .getVariableById(value.id)
            .name.replace(/\//g, ".")}}`;
        } else {
          obj.$value = resolvedType === "COLOR" ? rgbToHex(value) : value;
        }
      }
    });
    files.push(file);
  });
  return files;
}

function rgbToHex({ r, g, b, a }) {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }
  const toHex = (value) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}
