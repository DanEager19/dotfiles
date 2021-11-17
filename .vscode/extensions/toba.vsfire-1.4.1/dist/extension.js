"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const completion_1 = __importDefault(require("./providers/completion"));
const hover_1 = __importDefault(require("./providers/hover"));
function activate(context) {
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider('firerules', new completion_1.default(), '.', ' '), vscode_1.languages.registerHoverProvider('firerules', new hover_1.default()));
}
exports.activate = activate;
