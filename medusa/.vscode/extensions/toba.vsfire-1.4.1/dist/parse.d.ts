/**
 * Consider formal symbolizing like
 * https://github.com/Krzysztof-Cieslak/vscode-elm/blob/master/src/elmWorkspaceSymbols.ts
 */
import { Position, TextDocument } from 'vscode';
/**
 * Get the previous word adjacent to the current position by getting the
 * substring of the current line up to the current position then use a compiled
 * regular expression to match the word nearest the end.
 */
export declare function priorWord(doc: TextDocument, pos: Position): string | null;
/**
 * Get the word at the current position.
 */
export declare function currentWord(doc: TextDocument, pos: Position): string | null;
