"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as foldLevel from "./FoldLevel";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // https://code.visualstudio.com/docs/extensionAPI/overview
  for (let i = 1; i <= 6; i++) {
    let disposable = vscode.commands.registerCommand(
      "vikyd.FoldLevel.level" + i,
      () => {
        foldLevel.level(i);
      }
    );
    context.subscriptions.push(disposable);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
