# File Count

Count the number of files in the workspace.

## Features

- Include or exclude files using comma-separated globs
- Ignores files listed in .gitignore by default

## Usage

Open the Command Palette and run one of the following commands:

- `File Count: Show # of Files`
  - Shows the number of files that match based on the [extension settings](#extension-settings)
- `File Count: Show # of Files (Custom)`
  - Shows the number of files that match the provided globs
- `File Count: Insert # of Files`
  - Insert the number of files in to the document that match based on the [extension settings](#extension-settings)
- `File Count: Insert # of Files (Custom)`
  - Insert the number of files in to the document that match the provided globs

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `file-count.include`: specify files to include using comma separated globs
  * Example: `*.js,src/**/*.js`
* `file-count.exclude`: exclude files using comma separated globs
  * Example: `node_modules/,src/**/*.snap`
