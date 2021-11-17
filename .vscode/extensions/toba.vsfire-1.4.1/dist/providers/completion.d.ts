import { CancellationToken, CompletionItem, CompletionItemProvider, Position, TextDocument } from 'vscode';
/**
 * Provide suggestions for previous word or partial word.
 * https://code.visualstudio.com/docs/extensionAPI/language-support#_show-code-completion-proposals
 */
export default class RuleCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(doc: TextDocument, pos: Position, _tok: CancellationToken): Thenable<CompletionItem[]> | null;
}
