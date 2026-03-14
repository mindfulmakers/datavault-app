# datavault-app

## Getting started

This repo is a [multi](https://github.com/montaguegabe/multi) workspace to manage multiple sub-repositories:

- [web](https://github.com/openbase-community/web)
- [datavault-app-api](https://github.com/montaguegabe/datavault-app-api)
- [datavault-app-react](https://github.com/montaguegabe/datavault-app-react)
- [react-shared](https://github.com/openbase-community/react-shared)

To get started, install multi with `pipx install multi-workspace` or `uv tool install multi-workspace`.

Then install the [extension](https://marketplace.visualstudio.com/items?itemName=montaguegabe.multi-workspace) in Cursor or VS Code. When you make new changes to the VS Code configurations or other sync config files in a sub-repo, the changes will be automatically synced to the workspace.

## Running locally in VS Code

1. Press play on the `Django` runnable in VS Code.
2. Open the command pallette and run `Tasks: Run Task`.
3. Choose `React Dev`.
4. Open `http://localhost` in your browser.

The Django admin is at `http://localhost/admin/`.
