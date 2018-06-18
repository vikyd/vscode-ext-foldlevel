# Fold Level

[VSCode Market](https://marketplace.visualstudio.com/items?itemName=vikyd.vscode-fold-level)

Additional Fold Commands by One Step Shortcut.

Like PhpStorm: [`Expand to level | 1, 2, 3, 4 or 5`](https://www.jetbrains.com/help/idea/code-folding.html#folding_menu)

![foldlevel](https://github.com/vikyd/vscode-ext-foldlevel/raw/master/img/foldlevel.gif)

# Usage & Commands

Set shortcuts:

* Press
  * Mac: `Command + Shift + p`
  * Win: `Ctrl + Shift + p`
* `Open Keyboard Shortcuts File`
* Append:
  ```json
  {
      "key": "alt+1",
      "command": "vikyd.FoldLevel.level1"
  },
  {
      "key": "alt+2",
      "command": "vikyd.FoldLevel.level2"
  },
  {
      "key": "alt+3",
      "command": "vikyd.FoldLevel.level3"
  },
  {
      "key": "alt+4",
      "command": "vikyd.FoldLevel.level4"
  },
  {
      "key": "alt+5",
      "command": "vikyd.FoldLevel.level5"
  },
  {
      "key": "alt+6",
      "command": "vikyd.FoldLevel.level6"
  },
  // ↓  optional
  {
      "key": "alt+-",
      "command": "editor.foldAll"
  },
  // ↓  optional
  {
      "key": "alt+=",
      "command": "editor.unfoldAll"
  }
  ```

# Thanks

* https://github.com/dakaraphi/vscode-extension-common
