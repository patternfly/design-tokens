import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import * as JSZip from 'jszip';
import './ui.css';

let tokensZip;

const addToZip = (blob, fileName, folderNames, zip) => {
  // Add download files to folder structure
  folderNames.forEach((folderName) => {
    zip.folder(folderName).file(fileName, blob);
  });
};

const saveVars = (text, setJsonFiles, setZipFile) => {
  let splitFiles = text.split('\n\n\n');
  tokensZip = new JSZip();

  for (let i = 0; i < splitFiles.length; i++) {
    const splitFileName = splitFiles[i].split('\n', 1)[0];
    let saveFileName = '';
    let saveFolderNames = [];

    switch (splitFileName) {
      case '/* Base Dimension Tokens.Mode 1.tokens.json */':
        saveFileName = 'base.dimension.json';
        saveFolderNames = ['default'];
        break;
      case '/* Base Color Tokens - Light.Value.tokens.json */':
        saveFileName = 'base.json';
        saveFolderNames = ['default'];
        break;
      case '/* Color Palette.Mode 1.tokens.json */':
        saveFileName = 'palette.color.json';
        saveFolderNames = ['default', 'dark'];
        break;
      case '/* Semantic Dimension Tokens.Mode 1.tokens.json */':
        saveFileName = 'semantic.dimension.json';
        saveFolderNames = ['default'];
        break;
      case '/* Semantic Color Tokens.Light.tokens.json */':
        saveFileName = 'semantic.json';
        saveFolderNames = ['default'];
        break;
      case '/* Base Color Tokens - Dark.Mode 1.tokens.json */':
        saveFileName = 'base.dark.json';
        saveFolderNames = ['dark'];
        break;
      case '/* Semantic Color Tokens.Dark.tokens.json */':
        saveFileName = 'semantic.dark.json';
        saveFolderNames = ['dark'];
        break;
      case '/* Charts.Light.tokens.json */':
        saveFileName = 'charts.json';
        saveFolderNames = ['default'];
        break;
      case '/* Charts.Dark.tokens.json */':
        saveFileName = 'charts.dark.json';
        saveFolderNames = ['dark'];
        break;
      case '/* Base Motion Tokens.Mode 1.tokens.json */':
        saveFileName = 'base.motion.json';
        saveFolderNames = ['default'];
        break;
      case '/* Semantic Motion Tokens.Mode 1.tokens.json */':
        saveFileName = 'semantic.motion.json';
        saveFolderNames = ['default'];
        break;
      default:
        saveFileName = splitFiles[i].split('\n', 1)[0];
        saveFolderNames = ['default'];
    }

    const fileToExport = splitFiles[i].substring(splitFiles[i].indexOf('\n') + 1);
    const textToSaveAsBlob = new Blob([fileToExport], { type: 'text/plain' });

    // create download link per file
    const jsonLink = createLink(textToSaveAsBlob, saveFileName);
    setJsonFiles((prev: React.ReactNode[]) => [...prev, jsonLink]);
    // add each file zip
    addToZip(textToSaveAsBlob, saveFileName, saveFolderNames, tokensZip);
  }

  // create download link for finished zip file
  tokensZip.generateAsync({ type: 'blob' }).then((blob) => {
    const zipLink = createLink(blob, 'tokens.zip');
    setZipFile(zipLink);
  });
};

const createLink = (text, file) => {
  const textToSaveAsURL = window.URL.createObjectURL(text);
  return (
    <a key={file} download={file} href={textToSaveAsURL}>
      {file}
    </a>
  );
};

const exportTokens = () => parent.postMessage({ pluginMessage: { type: 'EXPORT' } }, '*');

const App = () => {
  const [jsonFiles, setJsonFiles] = React.useState([]);
  const [zipFile, setZipFile] = React.useState(null);
  const resetDownloads = () => {
    setJsonFiles([]);
    setZipFile(null);
  };

  React.useEffect(() => {
    exportTokens();
    // Listen for messages sent from the plugin code.ts file
    window.onmessage = ({ data: { pluginMessage } }) => {
      if (pluginMessage?.type === 'EXPORT_RESULT') {
        // Reset download files
        resetDownloads();
        // Display all tokens in textarea
        let textOutput = pluginMessage.files
          .map(({ fileName, body }) => `/* ${fileName} */\n\n${JSON.stringify(body, null, 2)}`)
          .join('\n\n\n');
        textOutput = textOutput.replaceAll('$type', 'type').replaceAll('$value', 'value');
        document.querySelector('textarea').innerHTML = textOutput;

        // Create downloadable token files
        saveVars(textOutput, setJsonFiles, setZipFile);
      }
    };
  }, []);

  return (
    <main>
      <div className="button-container">
        <button type="button" onClick={exportTokens}>
          Export Tokens
        </button>
      </div>
      <textarea placeholder="All exported tokens will render here..." readOnly></textarea>
      <div className="tokens-download-wrapper zip-wrapper">
        <p>Download all files:</p>
        <div className="zip-downloads">{zipFile}</div>
      </div>
      <div className="tokens-download-wrapper json-wrapper">
        <p>Download individual JSON files:</p>
        <div className="json-downloads">{jsonFiles}</div>
      </div>
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('export-patternfly-tokens-app')).render(<App />);
