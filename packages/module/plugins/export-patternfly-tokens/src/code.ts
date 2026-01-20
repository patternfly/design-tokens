interface FileData {
  fileName: string;
  body: {
    description?: string;
    $type?: string;
    $value?: any;
  };
}

type VariableValueExtended = VariableValue & {
  type?: string;
  id?: string;
};

/* MAIN function */

figma.ui.onmessage = (e) => {
  if (e.type === 'EXPORT') {
    exportToJSON();
  }
};
if (figma.command === 'export') {
  figma.showUI(__html__, {
    width: 820,
    height: 600,
    themeColors: true
  });
}

/* EXPORT Functionality */

/* EXPORT - main function */

function exportToJSON() {
  const collections = figma.variables.getLocalVariableCollections();

  const files = [];
  collections.forEach((collection) => files.push(...processCollection(collection)));

  figma.ui.postMessage({ type: 'EXPORT_RESULT', files });
}

/* EXPORT - helper functions */

function processCollection(collection) {
  const { name, modes, variableIds } = collection;
  const files = [];

  // Check if this is an extended collection
  const isExtended = (collection as any).parentVariableCollectionId !== undefined;
  const variableOverrides = (collection as any).variableOverrides || {};

  modes.forEach((mode) => {
    let file: FileData = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };

    // For extended collections, only process overridden variables
    const varsToProcess = isExtended ? Object.keys(variableOverrides) : variableIds;

    varsToProcess.forEach((variableId) => {
      const variable = figma.variables.getVariableById(variableId);
      if (!variable) {
        return;
      }

      const { name: varName, resolvedType, valuesByMode, description } = variable;

      if (varName.includes('figma-only')) {
        return; // Skip this variable
      }

      // For extended collections, get the overridden value
      let value: VariableValueExtended;
      if (isExtended) {
        const overrides = variableOverrides[variableId];
        value = overrides ? overrides[mode.modeId] : undefined;
      } else {
        value = valuesByMode[mode.modeId];
      }

      if (value !== undefined && ['COLOR', 'FLOAT', 'STRING'].includes(resolvedType)) {
        let obj = file.body;
        varName.split('/').forEach((groupName) => {
          obj[groupName] = obj[groupName] || {};
          obj = obj[groupName];
        });

        if (description) {
          obj.description = description;
        }

        if (value.type === 'VARIABLE_ALIAS') {
          obj.$type = resolvedType === 'COLOR' ? 'color' : 'number';
          obj.$value = `{${figma.variables.getVariableById(value.id).name.replace(/\//g, '.')}}`;
        } else if (resolvedType === 'COLOR') {
          obj.$type = 'color';
          obj.$value = rgbToHex(value);
        } else if (resolvedType === 'FLOAT') {
          obj.$type = 'number';
          obj.$value = value;
        } else if (resolvedType === 'STRING') {
          obj.$type = 'string';
          obj.$value = value;
        }
      }
    });

    files.push(file);
  });
  return files;
}

function rgbToHex(value) {
  const { r, g, b, a } = value;
  if (a !== 1) {
    return `rgba(${[r, g, b].map((n) => Math.round(n * 255)).join(', ')}, ${a.toFixed(4)})`;
  }
  const toHex = (value) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join('');
  return `#${hex}`;
}
