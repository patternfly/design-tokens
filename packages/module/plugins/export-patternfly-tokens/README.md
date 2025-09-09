# Export Patternfly Tokens Plugin

This plugin exports Patternfly tokens out of Figma and creates JSON files that can be added to the design tokens repo and processed by style dictionary.

### Setup
**Note:** Edit access to the Figma file is required to run the exporter.
1. Clone the [design-tokens](https://github.com/patternfly/design-tokens) repository.
1. Open the Figma app.
1. In Figma, select **Plugins** > **Development** > **Import plugin from manifest**.
1. Browse to **design-tokens\packages\module\plugins\export-patternfly-tokens** and select the **manifest.json** file from your cloned design-tokens repository and click **Open**.

The Export Patternfly Tokens plugin should now be available to use as a development plugin in your Figma environment.

### Usage
Once the plugin has been added to Figma via the manifest file:
1. Make sure you are **not** in Figma's developer mode.
1. In Figma, select **Plugins** > **Development** > **Export Patternfly Tokens** > **Export Tokens**.
1. Click **Export Tokens**. The text area will display a concatenated list of all tokens exported from the Figma library. Links to each exported JSON file are displayed at the bottom of the dialog. There is a "Download all files" link (named `tokens.zip`) at the top of the dialog that contains all of the exported files.
1. Click on the `tokens.zip` file to download all of the files, unless you only want to update a specific type of token. In that case, you can click any of the JSON file links to save them locally (do not rename the JSON files!). Note: it's much easier to download all of the files at once via the `tokens.zip` file. There is no harm in downloading all of the files at once, unless there is a specific reason you want to exclude any of them.
1. Copy the local JSON files you downloaded to your cloned design-tokens repo:
   1. If you downloaded `tokens.zip` in the previous step, unzip the file and simply copy it to **\packages\module\** and override the existing "tokens" directory.
   1. If you downloaded individual files:
       1. Copy files that do not end in **.dark.json** to  **\packages\module\tokens\default**. 
       1. Copy files ending in **.dark.json** and **palette.color.json** to **\packages\module\tokens\dark**.
   
   Note that **palette.color.json** is saved to both the **default** and **dark** directories.
