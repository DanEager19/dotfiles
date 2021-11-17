"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const grammar_1 = require("../grammar");
const parse_1 = require("../parse");
const cache = {};
/**
 * Provide suggestions for previous word or partial word.
 * https://code.visualstudio.com/docs/extensionAPI/language-support#_show-code-completion-proposals
 */
class RuleCompletionProvider {
    provideCompletionItems(doc, pos, _tok) {
        const word = parse_1.priorWord(doc, pos);
        if (word == null || word == '') {
            return null;
        }
        else if (word.slice(-1) == '.') {
            return members(word.slice(0, -1));
        }
        else {
            return directives(word);
        }
    }
}
exports.default = RuleCompletionProvider;
/**
 * Completions for stand-alone directives `service`, `match` and `allow`.
 */
async function directives(name) {
    if (cache[name]) {
        return Promise.resolve(cache[name]);
    }
    let items = null;
    if (name == 'allow') {
        const allows = await grammar_1.accessModifiers();
        items = allows.map(a => {
            const i = new vscode_1.CompletionItem(a.name, vscode_1.CompletionItemKind.Keyword);
            i.documentation = sanitize(a.about);
            return i;
        });
    }
    return Promise.resolve(items);
}
/**
 * Build `CompletionItem`s from `TypeInfo` and `MethodInfo` lists compiled in
 * the `grammar` module.
 */
async function members(name) {
    if (cache[name]) {
        return Promise.resolve(cache[name]);
    }
    const info = await grammar_1.findType(name);
    let items = null;
    if (info !== null) {
        items = [];
        if (info.fields) {
            addFields(items, info.fields);
        }
        if (info.methods) {
            addMethods(items, info.methods);
        }
        if (items.length == 0) {
            items = null;
        }
    }
    cache[name] = items;
    return items;
}
function addFields(items, fields) {
    Object.keys(fields).forEach(key => {
        const name = key;
        const f = fields[name];
        const c = new vscode_1.CompletionItem(name, vscode_1.CompletionItemKind.Field);
        c.documentation = sanitize(f.about);
        items.push(c);
    });
}
function addMethods(items, methods) {
    Object.keys(methods).forEach(key => {
        const name = key;
        const m = methods[name];
        const c = new vscode_1.CompletionItem(name, vscode_1.CompletionItemKind.Method);
        c.documentation = sanitize(m.about);
        if (m.snippet) {
            c.insertText = new vscode_1.SnippetString(m.snippet);
        }
        items.push(c);
    });
}
/**
 * Completions don't appear to support markdown.
 */
const sanitize = (text) => text.replace(/[`\*]/g, '');
