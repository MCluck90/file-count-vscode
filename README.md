# File Count

Count the number of files in the workspace.

## Features

- Include or exclude files using comma-separated globs
- Ignores files listed in .gitignore by default

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `file-count.include`: specify files to include using comma separated globs
  * Example: `*.js,src/**/*.js`
* `file-count.exclude`: exclude files using comma separated globs
  * Example: `node_modules/,src/**/*.snap`
