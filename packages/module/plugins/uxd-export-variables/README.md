# UXD Export Variables Plugin

This plugin exports variables out of Figma and creates JSON files that can be added to the design tokens repo and processed by style dictionary.

### Setup
1. Clone the [design-tokens](https://github.com/patternfly/design-tokens) repository.
2. Open the Figma app.
3. In Figma, select **Plugins** > **Development** > **Import plugin from manifest**.
4. Browse to **design-tokens\packages\module\plugins\uxd-export-variables** and select the **manifest.json** file from your cloned design-tokens repository and click **Open**.

The uxd-export-variables plugin should now be available to use as a development plugin in your Figma environment.

### Usage
Once the plugin has been added to Figma via the manifest file:
1. In Figma, select **Plugins** > **Development** > **uxd-export-variables** > **Export Variables**.
2. Click **Export Variables**. The text area will display a concatenated list of all variables exported from the Figma library. Links to each exported JSON file are displayed at the bottom of the dialog.
3. Click each JSON file link to save them locally (do not rename the JSON files!).
4. Copy the local JSON files to your cloned design-tokens repo:
   1. Copy **base.dimension.json**, **base.json**, **semantic.dimension.json**, **semantic.json**, and **palette.color.json** to  **\packages\module\tokens\default**. 
   2. Copy **base.dark.json**, **semantic.dark.json**, and **palette.color.json** to **\packages\module\tokens\dark** to **\packages\module\tokens\dark**. 
Note that **palette.color.json** is saved to both the **default** and **dark** directories.
