"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Match last word in text preceded by space or open paren/bracket. */
const priorWordPattern = new RegExp('[\\s\\(\\[]([A-Za-z0-9_\\.]+)\\s*$');
/**
 * Get the previous word adjacent to the current position by getting the
 * substring of the current line up to the current position then use a compiled
 * regular expression to match the word nearest the end.
 */
function priorWord(doc, pos) {
    const match = priorWordPattern.exec(doc.lineAt(pos.line).text.substring(0, pos.character));
    return match && match.length > 1 ? match[1] : null;
}
exports.priorWord = priorWord;
/**
 * Get the word at the current position.
 */
function currentWord(doc, pos) {
    const range = doc.getWordRangeAtPosition(pos);
    return range === undefined || range.isEmpty ? null : doc.getText(range);
}
exports.currentWord = currentWord;
