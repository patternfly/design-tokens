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
            const varExcludePattern = /figma-only/i;
            if (varExcludePattern.test(varName)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsOEJBQThCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBLFlBQVksMkJBQTJCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsYUFBYSxLQUFLLEdBQUcsVUFBVTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQix5REFBeUQ7QUFDN0U7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxFQUFFLG9FQUFvRTtBQUN6RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFlBQVksYUFBYTtBQUN6QjtBQUNBLHVCQUF1QixxREFBcUQsSUFBSSxhQUFhO0FBQzdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsSUFBSTtBQUNuQiIsInNvdXJjZXMiOlsid2VicGFjazovL0BwYXR0ZXJuZmx5L2Rlc2lnbi10b2tlbnMvLi9wbHVnaW5zL2V4cG9ydC1wYXR0ZXJuZmx5LXRva2Vucy9zcmMvY29kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBNQUlOIGZ1bmN0aW9uICovXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgIGlmIChlLnR5cGUgPT09ICdFWFBPUlQnKSB7XG4gICAgICAgIGV4cG9ydFRvSlNPTigpO1xuICAgIH1cbn07XG5pZiAoZmlnbWEuY29tbWFuZCA9PT0gJ2V4cG9ydCcpIHtcbiAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHtcbiAgICAgICAgd2lkdGg6IDgyMCxcbiAgICAgICAgaGVpZ2h0OiA2MDAsXG4gICAgICAgIHRoZW1lQ29sb3JzOiB0cnVlXG4gICAgfSk7XG59XG4vKiBFWFBPUlQgRnVuY3Rpb25hbGl0eSAqL1xuLyogRVhQT1JUIC0gbWFpbiBmdW5jdGlvbiAqL1xuZnVuY3Rpb24gZXhwb3J0VG9KU09OKCkge1xuICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gZmlnbWEudmFyaWFibGVzLmdldExvY2FsVmFyaWFibGVDb2xsZWN0aW9ucygpO1xuICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgY29sbGVjdGlvbnMuZm9yRWFjaCgoY29sbGVjdGlvbikgPT4gZmlsZXMucHVzaCguLi5wcm9jZXNzQ29sbGVjdGlvbihjb2xsZWN0aW9uKSkpO1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgdHlwZTogJ0VYUE9SVF9SRVNVTFQnLCBmaWxlcyB9KTtcbn1cbi8qIEVYUE9SVCAtIGhlbHBlciBmdW5jdGlvbnMgKi9cbmZ1bmN0aW9uIHByb2Nlc3NDb2xsZWN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICBjb25zdCB7IG5hbWUsIG1vZGVzLCB2YXJpYWJsZUlkcyB9ID0gY29sbGVjdGlvbjtcbiAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYW4gZXh0ZW5kZWQgY29sbGVjdGlvblxuICAgIGNvbnN0IGlzRXh0ZW5kZWQgPSBjb2xsZWN0aW9uLnBhcmVudFZhcmlhYmxlQ29sbGVjdGlvbklkICE9PSB1bmRlZmluZWQ7XG4gICAgY29uc3QgdmFyaWFibGVPdmVycmlkZXMgPSBjb2xsZWN0aW9uLnZhcmlhYmxlT3ZlcnJpZGVzIHx8IHt9O1xuICAgIG1vZGVzLmZvckVhY2goKG1vZGUpID0+IHtcbiAgICAgICAgbGV0IGZpbGUgPSB7IGZpbGVOYW1lOiBgJHtuYW1lfS4ke21vZGUubmFtZX0udG9rZW5zLmpzb25gLCBib2R5OiB7fSB9O1xuICAgICAgICAvLyBGb3IgZXh0ZW5kZWQgY29sbGVjdGlvbnMsIG9ubHkgcHJvY2VzcyBvdmVycmlkZGVuIHZhcmlhYmxlc1xuICAgICAgICBjb25zdCB2YXJzVG9Qcm9jZXNzID0gaXNFeHRlbmRlZCA/IE9iamVjdC5rZXlzKHZhcmlhYmxlT3ZlcnJpZGVzKSA6IHZhcmlhYmxlSWRzO1xuICAgICAgICB2YXJzVG9Qcm9jZXNzLmZvckVhY2goKHZhcmlhYmxlSWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlID0gZmlnbWEudmFyaWFibGVzLmdldFZhcmlhYmxlQnlJZCh2YXJpYWJsZUlkKTtcbiAgICAgICAgICAgIGlmICghdmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IG5hbWU6IHZhck5hbWUsIHJlc29sdmVkVHlwZSwgdmFsdWVzQnlNb2RlLCBkZXNjcmlwdGlvbiB9ID0gdmFyaWFibGU7XG4gICAgICAgICAgICBjb25zdCB2YXJFeGNsdWRlUGF0dGVybiA9IC9maWdtYS1vbmx5L2k7XG4gICAgICAgICAgICBpZiAodmFyRXhjbHVkZVBhdHRlcm4udGVzdCh2YXJOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gU2tpcCB0aGlzIHZhcmlhYmxlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3IgZXh0ZW5kZWQgY29sbGVjdGlvbnMsIGdldCB0aGUgb3ZlcnJpZGRlbiB2YWx1ZVxuICAgICAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICAgICAgaWYgKGlzRXh0ZW5kZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVycmlkZXMgPSB2YXJpYWJsZU92ZXJyaWRlc1t2YXJpYWJsZUlkXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG92ZXJyaWRlcyA/IG92ZXJyaWRlc1ttb2RlLm1vZGVJZF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc0J5TW9kZVttb2RlLm1vZGVJZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCAmJiBbJ0NPTE9SJywgJ0ZMT0FUJywgJ1NUUklORyddLmluY2x1ZGVzKHJlc29sdmVkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2JqID0gZmlsZS5ib2R5O1xuICAgICAgICAgICAgICAgIHZhck5hbWUuc3BsaXQoJy8nKS5mb3JFYWNoKChncm91cE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2dyb3VwTmFtZV0gPSBvYmpbZ3JvdXBOYW1lXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqW2dyb3VwTmFtZV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PT0gJ1ZBUklBQkxFX0FMSUFTJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSByZXNvbHZlZFR5cGUgPT09ICdDT0xPUicgPyAnY29sb3InIDogJ251bWJlcic7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdmFsdWUgPSBgeyR7ZmlnbWEudmFyaWFibGVzLmdldFZhcmlhYmxlQnlJZCh2YWx1ZS5pZCkubmFtZS5yZXBsYWNlKC9cXC8vZywgJy4nKX19YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzb2x2ZWRUeXBlID09PSAnQ09MT1InKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdHlwZSA9ICdjb2xvcic7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdmFsdWUgPSByZ2JUb0hleCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc29sdmVkVHlwZSA9PT0gJ0ZMT0FUJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSAnbnVtYmVyJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR2YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNvbHZlZFR5cGUgPT09ICdTVFJJTkcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdHlwZSA9ICdzdHJpbmcnO1xuICAgICAgICAgICAgICAgICAgICBvYmouJHZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZmlsZXM7XG59XG5mdW5jdGlvbiByZ2JUb0hleCh2YWx1ZSkge1xuICAgIGNvbnN0IHsgciwgZywgYiwgYSB9ID0gdmFsdWU7XG4gICAgaWYgKGEgIT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGByZ2JhKCR7W3IsIGcsIGJdLm1hcCgobikgPT4gTWF0aC5yb3VuZChuICogMjU1KSkuam9pbignLCAnKX0sICR7YS50b0ZpeGVkKDQpfSlgO1xuICAgIH1cbiAgICBjb25zdCB0b0hleCA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBoZXggPSBNYXRoLnJvdW5kKHZhbHVlICogMjU1KS50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gJzAnICsgaGV4IDogaGV4O1xuICAgIH07XG4gICAgY29uc3QgaGV4ID0gW3RvSGV4KHIpLCB0b0hleChnKSwgdG9IZXgoYildLmpvaW4oJycpO1xuICAgIHJldHVybiBgIyR7aGV4fWA7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=