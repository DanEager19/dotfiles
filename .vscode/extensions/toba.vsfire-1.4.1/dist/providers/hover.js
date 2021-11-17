"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const grammar_1 = require("../grammar");
const parse_1 = require("../parse");
const cache = {};
class RuleHoverProvider {
    provideHover(doc, pos, _tok) {
        const word = parse_1.currentWord(doc, pos);
        if (word == null || word == '') {
            return null;
        }
        else {
            return members(word);
        }
    }
}
exports.default = RuleHoverProvider;
/**
 * Build `Hover`s from `TypeInfo` and `MethodInfo` lists compiled in the
 * `grammar` module.
 */
async function members(name) {
    if (cache[name]) {
        return Promise.resolve(cache[name]);
    }
    const info = await grammar_1.findAny(name);
    let h = null;
    if (info) {
        h = new vscode_1.Hover(info.about);
    }
    cache[name] = h;
    return h;
}
