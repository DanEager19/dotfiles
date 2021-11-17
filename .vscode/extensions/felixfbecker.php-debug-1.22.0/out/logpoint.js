"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPointManager = void 0;
const stringReplaceAsync = require("string-replace-async");
const paths_1 = require("./paths");
class LogPointManager {
    constructor() {
        this._logpoints = new Map();
    }
    addLogPoint(fileUri, lineNumber, logMessage) {
        if ((0, paths_1.isWindowsUri)(fileUri)) {
            fileUri = fileUri.toLowerCase();
        }
        if (!this._logpoints.has(fileUri)) {
            this._logpoints.set(fileUri, new Map());
        }
        this._logpoints.get(fileUri).set(lineNumber, logMessage);
    }
    clearFromFile(fileUri) {
        if ((0, paths_1.isWindowsUri)(fileUri)) {
            fileUri = fileUri.toLowerCase();
        }
        if (this._logpoints.has(fileUri)) {
            this._logpoints.get(fileUri).clear();
        }
    }
    hasLogPoint(fileUri, lineNumber) {
        if ((0, paths_1.isWindowsUri)(fileUri)) {
            fileUri = fileUri.toLowerCase();
        }
        return this._logpoints.has(fileUri) && this._logpoints.get(fileUri).has(lineNumber);
    }
    async resolveExpressions(fileUri, lineNumber, callback) {
        if ((0, paths_1.isWindowsUri)(fileUri)) {
            fileUri = fileUri.toLowerCase();
        }
        if (!this.hasLogPoint(fileUri, lineNumber)) {
            return Promise.reject('Logpoint not found');
        }
        const expressionRegex = /\{(.*?)\}/gm;
        return await stringReplaceAsync(this._logpoints.get(fileUri).get(lineNumber), expressionRegex, function (_, group) {
            return group.length === 0 ? Promise.resolve('') : callback(group);
        });
    }
}
exports.LogPointManager = LogPointManager;
//# sourceMappingURL=logpoint.js.map