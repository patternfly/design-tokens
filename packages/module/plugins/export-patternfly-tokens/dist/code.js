/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************************************!*\
  !*** ./plugins/export-patternfly-tokens/src/code.ts ***!
  \******************************************************/
console.clear();
/* MAIN function */
figma.ui.onmessage = (e) => {
    console.log('code received message', e);
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
function processCollection({ name, modes, variableIds }) {
    const files = [];
    modes.forEach((mode) => {
        let file = { fileName: `${name}.${mode.name}.tokens.json`, body: {} };
        variableIds.forEach((variableId) => {
            const { name, resolvedType, valuesByMode, description } = figma.variables.getVariableById(variableId);
            if (name.includes('figma-only')) {
                return; // Skip this variable
            }
            const value = valuesByMode[mode.modeId];
            if (value !== undefined && ['COLOR', 'FLOAT', 'STRING'].includes(resolvedType)) {
                let obj = file.body;
                name.split('/').forEach((groupName) => {
                    obj[groupName] = obj[groupName] || {};
                    obj = obj[groupName];
                });
                if (description) {
                    obj.description = description;
                }
                if (value.type === 'VARIABLE_ALIAS') {
                    obj.$type = resolvedType === 'COLOR' ? 'color' : 'number';
                    obj.$value = `{${figma.variables.getVariableById(value.id).name.replace(/\//g, '.')}}`;
                    console.log(value);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLDhCQUE4QjtBQUN6RDtBQUNBO0FBQ0EsNkJBQTZCLDBCQUEwQjtBQUN2RDtBQUNBO0FBQ0EscUJBQXFCLGFBQWEsS0FBSyxHQUFHLFVBQVU7QUFDcEQ7QUFDQSxvQkFBb0IsZ0RBQWdEO0FBQ3BFO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsRUFBRSxvRUFBb0U7QUFDekc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFlBQVksYUFBYTtBQUN6QjtBQUNBLHVCQUF1QixxREFBcUQsSUFBSSxhQUFhO0FBQzdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsSUFBSTtBQUNuQiIsInNvdXJjZXMiOlsid2VicGFjazovL0BwYXR0ZXJuZmx5L2Rlc2lnbi10b2tlbnMvLi9wbHVnaW5zL2V4cG9ydC1wYXR0ZXJuZmx5LXRva2Vucy9zcmMvY29kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmNsZWFyKCk7XG4vKiBNQUlOIGZ1bmN0aW9uICovXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdjb2RlIHJlY2VpdmVkIG1lc3NhZ2UnLCBlKTtcbiAgICBpZiAoZS50eXBlID09PSAnRVhQT1JUJykge1xuICAgICAgICBleHBvcnRUb0pTT04oKTtcbiAgICB9XG59O1xuaWYgKGZpZ21hLmNvbW1hbmQgPT09ICdleHBvcnQnKSB7XG4gICAgZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7XG4gICAgICAgIHdpZHRoOiA4MjAsXG4gICAgICAgIGhlaWdodDogNjAwLFxuICAgICAgICB0aGVtZUNvbG9yczogdHJ1ZVxuICAgIH0pO1xufVxuLyogRVhQT1JUIEZ1bmN0aW9uYWxpdHkgKi9cbi8qIEVYUE9SVCAtIG1haW4gZnVuY3Rpb24gKi9cbmZ1bmN0aW9uIGV4cG9ydFRvSlNPTigpIHtcbiAgICBjb25zdCBjb2xsZWN0aW9ucyA9IGZpZ21hLnZhcmlhYmxlcy5nZXRMb2NhbFZhcmlhYmxlQ29sbGVjdGlvbnMoKTtcbiAgICBjb25zdCBmaWxlcyA9IFtdO1xuICAgIGNvbGxlY3Rpb25zLmZvckVhY2goKGNvbGxlY3Rpb24pID0+IGZpbGVzLnB1c2goLi4ucHJvY2Vzc0NvbGxlY3Rpb24oY29sbGVjdGlvbikpKTtcbiAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6ICdFWFBPUlRfUkVTVUxUJywgZmlsZXMgfSk7XG59XG4vKiBFWFBPUlQgLSBoZWxwZXIgZnVuY3Rpb25zICovXG5mdW5jdGlvbiBwcm9jZXNzQ29sbGVjdGlvbih7IG5hbWUsIG1vZGVzLCB2YXJpYWJsZUlkcyB9KSB7XG4gICAgY29uc3QgZmlsZXMgPSBbXTtcbiAgICBtb2Rlcy5mb3JFYWNoKChtb2RlKSA9PiB7XG4gICAgICAgIGxldCBmaWxlID0geyBmaWxlTmFtZTogYCR7bmFtZX0uJHttb2RlLm5hbWV9LnRva2Vucy5qc29uYCwgYm9keToge30gfTtcbiAgICAgICAgdmFyaWFibGVJZHMuZm9yRWFjaCgodmFyaWFibGVJZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBuYW1lLCByZXNvbHZlZFR5cGUsIHZhbHVlc0J5TW9kZSwgZGVzY3JpcHRpb24gfSA9IGZpZ21hLnZhcmlhYmxlcy5nZXRWYXJpYWJsZUJ5SWQodmFyaWFibGVJZCk7XG4gICAgICAgICAgICBpZiAobmFtZS5pbmNsdWRlcygnZmlnbWEtb25seScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBTa2lwIHRoaXMgdmFyaWFibGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzQnlNb2RlW21vZGUubW9kZUlkXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIFsnQ09MT1InLCAnRkxPQVQnLCAnU1RSSU5HJ10uaW5jbHVkZXMocmVzb2x2ZWRUeXBlKSkge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBmaWxlLmJvZHk7XG4gICAgICAgICAgICAgICAgbmFtZS5zcGxpdCgnLycpLmZvckVhY2goKGdyb3VwTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmpbZ3JvdXBOYW1lXSA9IG9ialtncm91cE5hbWVdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmpbZ3JvdXBOYW1lXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS50eXBlID09PSAnVkFSSUFCTEVfQUxJQVMnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdHlwZSA9IHJlc29sdmVkVHlwZSA9PT0gJ0NPTE9SJyA/ICdjb2xvcicgOiAnbnVtYmVyJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR2YWx1ZSA9IGB7JHtmaWdtYS52YXJpYWJsZXMuZ2V0VmFyaWFibGVCeUlkKHZhbHVlLmlkKS5uYW1lLnJlcGxhY2UoL1xcLy9nLCAnLicpfX1gO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc29sdmVkVHlwZSA9PT0gJ0NPTE9SJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgICAgICBvYmouJHZhbHVlID0gcmdiVG9IZXgodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNvbHZlZFR5cGUgPT09ICdGTE9BVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR0eXBlID0gJ251bWJlcic7XG4gICAgICAgICAgICAgICAgICAgIG9iai4kdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzb2x2ZWRUeXBlID09PSAnU1RSSU5HJykge1xuICAgICAgICAgICAgICAgICAgICBvYmouJHR5cGUgPSAnc3RyaW5nJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR2YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbGVzO1xufVxuZnVuY3Rpb24gcmdiVG9IZXgodmFsdWUpIHtcbiAgICBjb25zdCB7IHIsIGcsIGIsIGEgfSA9IHZhbHVlO1xuICAgIGlmIChhICE9PSAxKSB7XG4gICAgICAgIHJldHVybiBgcmdiYSgke1tyLCBnLCBiXS5tYXAoKG4pID0+IE1hdGgucm91bmQobiAqIDI1NSkpLmpvaW4oJywgJyl9LCAke2EudG9GaXhlZCg0KX0pYDtcbiAgICB9XG4gICAgY29uc3QgdG9IZXggPSAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgaGV4ID0gTWF0aC5yb3VuZCh2YWx1ZSAqIDI1NSkudG9TdHJpbmcoMTYpO1xuICAgICAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PT0gMSA/ICcwJyArIGhleCA6IGhleDtcbiAgICB9O1xuICAgIGNvbnN0IGhleCA9IFt0b0hleChyKSwgdG9IZXgoZyksIHRvSGV4KGIpXS5qb2luKCcnKTtcbiAgICByZXR1cm4gYCMke2hleH1gO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9