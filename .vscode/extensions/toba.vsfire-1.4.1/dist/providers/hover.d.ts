import { CancellationToken, Hover, HoverProvider, ProviderResult, Position, TextDocument } from 'vscode';
export default class RuleHoverProvider implements HoverProvider {
    provideHover(doc: TextDocument, pos: Position, _tok: CancellationToken): ProviderResult<Hover>;
}
