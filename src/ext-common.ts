"use strict";
import * as vscode from "vscode";

// This file is Copied from: https://github.com/vikyd/vscode-extension-common

export interface lineInfo {
  line: vscode.TextLine;
  range: vscode.Range;
}

const EMPTY_RANGE = new vscode.Range(
  new vscode.Position(0, 0),
  new vscode.Position(0, 1)
);

export namespace Lines {
  export function makeLineInfos(
    textEditor: vscode.TextEditor,
    ranges: Array<vscode.Range>
  ) {
    const lineAndCursors: Map<number, lineInfo> = new Map();
    for (const range of ranges) {
      const line = textEditor.document.lineAt(range.start.line);
      let lineAndCursor = lineAndCursors.get(line.lineNumber);
      if (!lineAndCursor) lineAndCursor = { line, range };

      lineAndCursors.set(line.lineNumber, lineAndCursor);
    }
    return Array.from(lineAndCursors.values());
  }

  export function linesFromRanges(
    document: vscode.TextDocument,
    ranges: Array<vscode.Range>
  ) {
    return ranges
      .map(range => linesFromRange(document, range))
      .reduce((acc, cur) => acc.concat(cur));
  }

  export function linesFromRange(
    document: vscode.TextDocument,
    range: vscode.Range
  ) {
    const startLine = range.start.line;
    const endLine = range.end.line;

    return collectLines(document, startLine, endLine);
  }

  export function collectLines(
    document: vscode.TextDocument,
    startLine: number,
    endLine: number
  ): Array<vscode.TextLine> {
    const lines = [];
    for (let index = startLine; index <= endLine; index++) {
      lines.push(document.lineAt(index));
    }
    return lines;
  }

  export function filterLines(
    document: vscode.TextDocument,
    range: vscode.Range,
    filter: (lineText: string) => boolean
  ) {
    const filteredLines: Array<vscode.TextLine> = [];

    const totalLines = range.end.line - range.start.line + 1;
    for (
      let lineIndex = range.start.line;
      lineIndex < totalLines + range.start.line;
      lineIndex++
    ) {
      const line = document.lineAt(lineIndex);
      if (filter(line.text)) {
        filteredLines.push(line);
      }
    }
    return filteredLines;
  }

  export function findNextLineDown(
    document: vscode.TextDocument,
    lineNumber: number,
    stopWhen: (line: vscode.TextLine) => boolean
  ) {
    const line = document.lineAt(lineNumber);
    const documentLength = document.lineCount;
    for (let index = lineNumber + 1; index < documentLength; index++) {
      const nextLine = document.lineAt(index);
      if (stopWhen(nextLine)) return nextLine;
    }
    return null;
  }

  export function findNextLineUp(
    document: vscode.TextDocument,
    lineNumber: number,
    stopWhen: (line: vscode.TextLine) => boolean
  ) {
    const line = document.lineAt(lineNumber);
    for (let index = lineNumber - 1; index >= 0; index--) {
      const nextLine = document.lineAt(index);
      if (stopWhen(nextLine)) return nextLine;
    }
    return null;
  }

  export function findLastLineOfBlock(
    document: vscode.TextDocument,
    lineNumber: number,
    isInBlock: (line: vscode.TextLine) => boolean
  ) {
    const line = document.lineAt(lineNumber);
    let previousLine = line;
    const documentLength = document.lineCount;
    for (let index = lineNumber + 1; index < documentLength; index++) {
      const nextLine = document.lineAt(index);
      if (!isInBlock(nextLine)) break;
      previousLine = nextLine;
    }
    return previousLine;
  }

  export function findFirstLineOfBlock(
    document: vscode.TextDocument,
    lineNumber: number,
    isInBlock: (line: vscode.TextLine) => boolean
  ) {
    const line = document.lineAt(lineNumber);
    let previousLine = line;
    for (let index = lineNumber - 1; index >= 0; index--) {
      const nextLine = document.lineAt(index);
      if (!isInBlock(nextLine)) break;
      previousLine = nextLine;
    }
    return previousLine;
  }

  export function findNextLineDownSameSpacingOrLeft(
    document: vscode.TextDocument,
    lineNumber: number,
    tabSize: number
  ) {
    const line = document.lineAt(lineNumber);
    const documentLength = document.lineCount;
    let lastSpacing = calculateLineSpacing(line.text, tabSize);
    for (let index = lineNumber + 1; index < documentLength; index++) {
      const nextLine = document.lineAt(index);
      if (!nextLine.isEmptyOrWhitespace) {
        const currentSpacing = calculateLineSpacing(nextLine.text, tabSize);
        if (currentSpacing <= lastSpacing) return nextLine;
      }
    }
    return null;
  }

  export function findNextLineUpSpacedLeft(
    document: vscode.TextDocument,
    lineNumber: number,
    tabSize: number
  ) {
    const line = document.lineAt(lineNumber);
    let lastSpacing = calculateLineSpacing(line.text, tabSize);
    for (let index = lineNumber; index >= 0; index--) {
      const line = document.lineAt(index);
      if (!line.isEmptyOrWhitespace) {
        const currentSpacing = calculateLineSpacing(line.text, tabSize);
        if (currentSpacing < lastSpacing) return line;
      }
    }
    return null;
  }

  export function isNextLineDownSpacedRight(
    document: vscode.TextDocument,
    lineNumber: number,
    tabSize: number
  ) {
    const line = document.lineAt(lineNumber);
    const documentLength = document.lineCount;
    let lastSpacing = calculateLineSpacing(line.text, tabSize);
    for (let index = lineNumber + 1; index < documentLength; index++) {
      const nextLine = document.lineAt(index);
      if (!nextLine.isEmptyOrWhitespace) {
        const currentSpacing = calculateLineSpacing(nextLine.text, tabSize);
        return currentSpacing > lastSpacing;
      }
    }
    return null;
  }

  export function findAllLineNumbersContaining(
    document: vscode.TextDocument,
    text: RegExp
  ) {
    let lineNumbers = Array<number>();
    for (let index = 0; index < document.lineCount; index++) {
      const line = document.lineAt(index);
      if (line.text.search(text) > -1) lineNumbers.push(line.lineNumber);
    }
    return lineNumbers;
  }

  export function findAllLinesSpacedOneLevelRight(
    document: vscode.TextDocument,
    lineNumber: number,
    tabSize: number
  ) {
    const line = document.lineAt(lineNumber);
    const documentLength = document.lineCount;
    const parentLineSpacing = calculateLineSpacing(line.text, tabSize);
    const foundLines = <vscode.TextLine[]>[];

    const nextLineDown = findNextLineDown(
      document,
      lineNumber,
      line => !line.isEmptyOrWhitespace
    );
    const childSpacing = calculateLineSpacing(nextLineDown.text, tabSize);
    if (childSpacing <= parentLineSpacing) return foundLines;

    for (let index = lineNumber + 1; index < documentLength; index++) {
      const nextLine = document.lineAt(index);
      if (!nextLine.isEmptyOrWhitespace) {
        const currentSpacing = calculateLineSpacing(nextLine.text, tabSize);
        if (currentSpacing <= parentLineSpacing) break;
        if (currentSpacing == childSpacing) foundLines.push(nextLine);
      }
    }
    return foundLines;
  }

  export function findLinesByLevelToRoot(
    document: vscode.TextDocument,
    lineNumber: number,
    tabSize: number
  ) {
    const lines = [document.lineAt(lineNumber)];
    let nextLine = findNextLineUpSpacedLeft(document, lineNumber, tabSize);
    while (nextLine) {
      lines.push(nextLine);
      nextLine = findNextLineUpSpacedLeft(
        document,
        nextLine.lineNumber,
        tabSize
      );
    }
    return lines;
  }

  export function findAllLinesContainingCurrentWordOrSelection() {
    const textEditor = vscode.window.activeTextEditor;
    const selection = textEditor.selection;
    const regExForFold = makeRegExpToMatchWordUnderCursorOrSelection(
      textEditor.document,
      selection
    );
    return findAllLineNumbersContaining(textEditor.document, regExForFold);
  }

  export function makeRegExpToMatchWordUnderCursorOrSelection(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ) {
    let range = selection as vscode.Range;
    if (selection.isEmpty) {
      range = document.getWordRangeAtPosition(
        new vscode.Position(selection.anchor.line, selection.anchor.character)
      );
      return new RegExp("\\b" + document.getText(range) + "\\b");
    }
    return new RegExp(document.getText(range));
  }

  export function calculateLineLevel(
    textEditor: vscode.TextEditor,
    lineNumber: number
  ) {
    let level = 1;
    let nextLine = findNextLineUpSpacedLeft(
      textEditor.document,
      lineNumber,
      +textEditor.options.tabSize
    );
    while (nextLine) {
      level++;
      nextLine = findNextLineUpSpacedLeft(
        textEditor.document,
        nextLine.lineNumber,
        +textEditor.options.tabSize
      );
    }
    return level;
  }

  export function calculateLineSpacing(
    lineText: string,
    tabSize: number
  ): number {
    let spacing = 0;
    for (let index = 0; index < lineText.length; index++) {
      if (lineText.charAt(index) === " ") spacing++;
      else if (lineText.charAt(index) === "\t")
        spacing += tabSize - spacing % tabSize;
      else break;
    }
    return spacing;
  }

  export function calculateColumnFromCharIndex(
    lineText: string,
    charIndex: number,
    tabSize: number
  ): number {
    let spacing = 0;
    for (let index = 0; index < charIndex; index++) {
      if (lineText.charAt(index) === "\t")
        spacing += tabSize - spacing % tabSize;
      else spacing++;
    }
    return spacing;
  }

  export function calculateCharIndexFromColumn(
    lineText: string,
    column: number,
    tabSize: number
  ): number {
    let spacing = 0;
    for (let index = 0; index <= column; index++) {
      if (spacing >= column) return index;
      if (lineText.charAt(index) === "\t")
        spacing += tabSize - spacing % tabSize;
      else spacing++;
    }
    return spacing;
  }

  /**
   * Returns selected text on a single line, or word under cursor if no selection.
   * If multiline selected, returns empty string
   * @param document
   * @param selection
   */
  export function textOfLineSelectionOrWordAtCursor(
    document: vscode.TextDocument,
    selection: vscode.Selection
  ) {
    if (!selection.isSingleLine) return "";
    let range;
    if (selection.isEmpty) {
      range = document.getWordRangeAtPosition(
        new vscode.Position(selection.anchor.line, selection.anchor.character)
      );
    }
    if (!range) range = selection as vscode.Range;
    return document.getText(range);
  }

  export function textFromLines(
    document: vscode.TextDocument,
    lines: Array<vscode.TextLine>
  ) {
    return lines
      .map(line => line.text)
      .reduce((text, lineText) => text + lineText + "\n");
  }
}
