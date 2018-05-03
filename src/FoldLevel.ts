"use strict";
import * as vscode from "vscode";
// ↓ https://github.com/dakaraphi/vscode-extension-common
import { Lines } from "./ext-common";

function setToParentLevelSelection(textEditor, targetLevel, originLineNum) {
  const parentLine = Lines.findNextLineUpSpacedLeft(
    textEditor.document,
    textEditor.selection.active.line,
    +textEditor.options.tabSize
  );

  // const selection = textEditor.selection;
  // const lineOfReferenceForFold = whenBlankLineUsePreviousOrNextLine(
  //   textEditor,
  //   selection.anchor.line
  // );
  // const parentLine = Lines.findNextLineUpSpacedLeft(
  //   textEditor.document,
  //   lineOfReferenceForFold,
  //   +textEditor.options.tabSize
  // );

  if (!parentLine) {
    // find upward to guess if there is a higher level line
    // equal means: origin line's level is higher than target level
    if (originLineNum === textEditor.selection.active.line) {
      let upperLineNum = textEditor.selection.active.line - 1;
      if (upperLineNum >= 0) {
        let line = textEditor.document.lineAt(upperLineNum);
        if (!line.text) {
          textEditor.selection = new vscode.Selection(
            upperLineNum,
            0,
            upperLineNum,
            0
          );
        }
      }
      return;
    }

    let wantLineNum = textEditor.selection.active.line - 1;

    if (wantLineNum === 0) {
      // no more lines before
      return;
    }

    textEditor.selection = new vscode.Selection(wantLineNum, 0, wantLineNum, 0);
    return;
  }

  const parentLevel = Lines.calculateLineLevel(
    textEditor,
    parentLine.lineNumber
  );
  if (parentLevel < targetLevel) {
    return;
  }

  textEditor.selection = new vscode.Selection(
    parentLine.lineNumber,
    0,
    parentLine.lineNumber,
    0
  );
  setToParentLevelSelection(textEditor, targetLevel, originLineNum);
}

/**
 * ref: https://github.com/dakaraphi/vscode-extension-fold/blob/master/src/Fold.ts
 *
 * If the line on which the command is executed is blank, then we want to use either the
 * previous line or next line with text to determine the correct level.
 * In this event, whichever line (previous or next) is the higher level (further right) will be used.
 *
 * @param editor
 * @param line
 */
function whenBlankLineUsePreviousOrNextLine(
  editor: vscode.TextEditor,
  line: number
) {
  const currentLine = editor.document.lineAt(line);
  if (!currentLine.isEmptyOrWhitespace) return line;

  const nextLineup = Lines.findNextLineUp(
    editor.document,
    line,
    line => !line.isEmptyOrWhitespace
  );
  const nextLineDown = Lines.findNextLineDown(
    editor.document,
    line,
    line => !line.isEmptyOrWhitespace
  );

  const lineUpLevel = Lines.calculateLineLevel(editor, nextLineup.lineNumber);
  const lineDownLevel = Lines.calculateLineLevel(
    editor,
    nextLineDown.lineNumber
  );

  return lineUpLevel > lineDownLevel
    ? nextLineup.lineNumber
    : nextLineDown.lineNumber;
}

export function level(targetLevel) {
  const textEditor = vscode.window.activeTextEditor;

  setToParentLevelSelection(
    textEditor,
    targetLevel,
    textEditor.selection.active.line
  );

  vscode.commands
    .executeCommand("editor.unfoldAll")
    .then(() =>
      vscode.commands.executeCommand("editor.foldLevel" + targetLevel)
    );
}
