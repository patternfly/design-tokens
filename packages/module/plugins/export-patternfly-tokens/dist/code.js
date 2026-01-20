/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************************************!*\
  !*** ./plugins/export-patternfly-tokens/src/code.ts ***!
  \******************************************************/
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
    const isExtended = collection.parentVariableCollectionId !== undefined;
    const variableOverrides = collection.variableOverrides || {};
    modes.forEach((mode) => {
        let file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };
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
            let value;
            if (isExtended) {
                const overrides = variableOverrides[variableId];
                value = overrides ? overrides[mode.modeId] : undefined;
            }
            else {
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
                }
                else if (resolvedType === 'COLOR') {
                    obj.$type = 'color';
                    obj.$value = rgbToHex(value);
                }
                else if (resolvedType === 'FLOAT') {
                    obj.$type = 'number';
                    obj.$value = value;
                }
                else if (resolvedType === 'STRING') {
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsOEJBQThCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBLFlBQVksMkJBQTJCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsYUFBYSxLQUFLLEdBQUcsVUFBVTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix5REFBeUQ7QUFDN0U7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsRUFBRSxvRUFBb0U7QUFDekc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxZQUFZLGFBQWE7QUFDekI7QUFDQSx1QkFBdUIscURBQXFELElBQUksYUFBYTtBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLElBQUk7QUFDbkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AcGF0dGVybmZseS9kZXNpZ24tdG9rZW5zLy4vcGx1Z2lucy9leHBvcnQtcGF0dGVybmZseS10b2tlbnMvc3JjL2NvZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogTUFJTiBmdW5jdGlvbiAqL1xuZmlnbWEudWkub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICBpZiAoZS50eXBlID09PSAnRVhQT1JUJykge1xuICAgICAgICBleHBvcnRUb0pTT04oKTtcbiAgICB9XG59O1xuaWYgKGZpZ21hLmNvbW1hbmQgPT09ICdleHBvcnQnKSB7XG4gICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7XG4gICAgICAgIHdpZHRoOiA4MjAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICB0aGVtZUNvbG9yczogdHJ1ZVxuICAgIH0pO1xufVxuLyogRVhQT1JUIEZ1bmN0aW9uYWxpdHkgKi9cbi8qIEVYUE9SVCAtIG1haW4gZnVuY3Rpb24gKi9cbmZ1bmN0aW9uIGV4cG9ydFRvSlNPTigpIHtcbiAgICBjb25zdCBjb2xsZWN0aW9ucyA9IGZpZ21hLnZhcmlhYmxlcy5nZXRMb2NhbFZhcmlhYmxlQ29sbGVjdGlvbnMoKTtcbiAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgIGNvbGxlY3Rpb25zLmZvckVhY2goKGNvbGxlY3Rpb24pID0+IGZpbGVzLnB1c2goLi4ucHJvY2Vzc0NvbGxlY3Rpb24oY29sbGVjdGlvbikpKTtcbiAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICdFWFBPUlRfUkVTVUxUJywgZmlsZXMgfSk7XG59XG4vKiBFWFBPUlQgLSBoZWxwZXIgZnVuY3Rpb25zICovXG5mdW5jdGlvbiBwcm9jZXNzQ29sbGVjdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgY29uc3QgeyBuYW1lLCBtb2RlcywgdmFyaWFibGVJZHMgfSA9IGNvbGxlY3Rpb247XG4gICAgY29uc3QgZmlsZXMgPSBbXTtcbiAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGFuIGV4dGVuZGVkIGNvbGxlY3Rpb25cbiAgICBjb25zdCBpc0V4dGVuZGVkID0gY29sbGVjdGlvbi5wYXJlbnRWYXJpYWJsZUNvbGxlY3Rpb25JZCAhPT0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IHZhcmlhYmxlT3ZlcnJpZGVzID0gY29sbGVjdGlvbi52YXJpYWJsZU92ZXJyaWRlcyB8fCB7fTtcbiAgICBtb2Rlcy5mb3JFYWNoKChtb2RlKSA9PiB7XG4gICAgICAgIGxldCBmaWxlID0geyBmaWxlTmFtZTogYCR7bmFtZX0uJHttb2RlLm5hbWV9LnRva2Vucy5qc29uYCwgYm9keToge30gfTtcbiAgICAgICAgLy8gRm9yIGV4dGVuZGVkIGNvbGxlY3Rpb25zLCBvbmx5IHByb2Nlc3Mgb3ZlcnJpZGRlbiB2YXJpYWJsZXNcbiAgICAgICAgY29uc3QgdmFyc1RvUHJvY2VzcyA9IGlzRXh0ZW5kZWQgPyBPYmplY3Qua2V5cyh2YXJpYWJsZU92ZXJyaWRlcykgOiB2YXJpYWJsZUlkcztcbiAgICAgICAgdmFyc1RvUHJvY2Vzcy5mb3JFYWNoKCh2YXJpYWJsZUlkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YXJpYWJsZSA9IGZpZ21hLnZhcmlhYmxlcy5nZXRWYXJpYWJsZUJ5SWQodmFyaWFibGVJZCk7XG4gICAgICAgICAgICBpZiAoIXZhcmlhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyBuYW1lOiB2YXJOYW1lLCByZXNvbHZlZFR5cGUsIHZhbHVlc0J5TW9kZSwgZGVzY3JpcHRpb24gfSA9IHZhcmlhYmxlO1xuICAgICAgICAgICAgaWYgKHZhck5hbWUuaW5jbHVkZXMoJ2ZpZ21hLW9ubHknKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gU2tpcCB0aGlzIHZhcmlhYmxlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3IgZXh0ZW5kZWQgY29sbGVjdGlvbnMsIGdldCB0aGUgb3ZlcnJpZGRlbiB2YWx1ZVxuICAgICAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzRXh0ZW5kZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVycmlkZXMgPSB2YXJpYWJsZU92ZXJyaWRlc1t2YXJpYWJsZUlkXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG92ZXJyaWRlcyA/IG92ZXJyaWRlc1ttb2RlLm1vZGVJZF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc0J5TW9kZVttb2RlLm1vZGVJZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBbJ0NPTE9SJywgJ0ZMT0FUJywgJ1NUUklORyddLmluY2x1ZGVzKHJlc29sdmVkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2JqID0gZmlsZS5ib2R5O1xuICAgICAgICAgICAgICAgIHZhck5hbWUuc3BsaXQoJy8nKS5mb3JFYWNoKChncm91cE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2dyb3VwTmFtZV0gPSBvYmpbZ3JvdXBOYW1lXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqW2dyb3VwTmFtZV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PT0gJ1ZBUklBQkxFX0FMSUFTJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSByZXNvbHZlZFR5cGUgPT09ICdDT0xPUicgPyAnY29sb3InIDogJ251bWJlcic7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdmFsdWUgPSBgeyR7ZmlnbWEudmFyaWFibGVzLmdldFZhcmlhYmxlQnlJZCh2YWx1ZS5pZCkubmFtZS5yZXBsYWNlKC9cXC8vZywgJy4nKX19YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzb2x2ZWRUeXBlID09PSAnQ09MT1InKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdHlwZSA9ICdjb2xvcic7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdmFsdWUgPSByZ2JUb0hleCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc29sdmVkVHlwZSA9PT0gJ0ZMT0FUJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSAnbnVtYmVyJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR2YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNvbHZlZFR5cGUgPT09ICdTVFJJTkcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdHlwZSA9ICdzdHJpbmcnO1xuICAgICAgICAgICAgICAgICAgICBvYmouJHZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZmlsZXM7XG59XG5mdW5jdGlvbiByZ2JUb0hleCh2YWx1ZSkge1xuICAgIGNvbnN0IHsgciwgZywgYiwgYSB9ID0gdmFsdWU7XG4gICAgaWYgKGEgIT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGByZ2JhKCR7W3IsIGcsIGJdLm1hcCgobikgPT4gTWF0aC5yb3VuZChuICogMjU1KSkuam9pbignLCAnKX0sICR7YS50b0ZpeGVkKDQpfSlgO1xuICAgIH1cbiAgICBjb25zdCB0b0hleCA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBoZXggPSBNYXRoLnJvdW5kKHZhbHVlICogMjU1KS50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gJzAnICsgaGV4IDogaGV4O1xuICAgIH07XG4gICAgY29uc3QgaGV4ID0gW3RvSGV4KHIpLCB0b0hleChnKSwgdG9IZXgoYildLmpvaW4oJycpO1xuICAgIHJldHVybiBgIyR7aGV4fWA7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=