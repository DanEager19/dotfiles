"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const which = __importStar(require("which"));
function activate(context) {
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('php', {
        async resolveDebugConfiguration(folder, debugConfiguration, token) {
            var _a;
            if (!debugConfiguration.type && !debugConfiguration.request && !debugConfiguration.name) {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'php') {
                    debugConfiguration.type = 'php';
                    debugConfiguration.name = 'Launch (dynamic)';
                    debugConfiguration.request = 'launch';
                    debugConfiguration.program = '${file}';
                    debugConfiguration.cwd = '${fileDirname}';
                    debugConfiguration.port = 0;
                    debugConfiguration.runtimeArgs = ['-dxdebug.start_with_request=yes'];
                    debugConfiguration.env = {
                        XDEBUG_MODE: 'debug,develop',
                        XDEBUG_CONFIG: 'client_port=${port}',
                    };
                    // debugConfiguration.stopOnEntry = true
                }
            }
            if ((debugConfiguration.program || debugConfiguration.runtimeArgs) &&
                !debugConfiguration.runtimeExecutable) {
                // See if we have runtimeExecutable configured
                const conf = vscode.workspace.getConfiguration('php.debug');
                const executablePath = conf.get('executablePath');
                if (executablePath) {
                    debugConfiguration.runtimeExecutable = executablePath;
                }
                // See if it's in path
                if (!debugConfiguration.runtimeExecutable) {
                    try {
                        await which.default('php');
                    }
                    catch (e) {
                        const selected = await vscode.window.showErrorMessage('PHP executable not found. Install PHP and add it to your PATH or set the php.debug.executablePath setting', 'Open settings');
                        if (selected === 'Open settings') {
                            await vscode.commands.executeCommand('workbench.action.openGlobalSettings', {
                                query: 'php.debug.executablePath',
                            });
                            return undefined;
                        }
                    }
                }
            }
            if (((_a = debugConfiguration.proxy) === null || _a === void 0 ? void 0 : _a.enable) === true) {
                // Proxy configuration
                if (!debugConfiguration.proxy.key) {
                    const conf = vscode.workspace.getConfiguration('php.debug');
                    const ideKey = conf.get('ideKey');
                    if (ideKey) {
                        debugConfiguration.proxy.key = ideKey;
                    }
                }
            }
            return debugConfiguration;
        },
    }));
    context.subscriptions.push(vscode.commands.registerCommand('php.debug.debugPhpFile', async (uri) => {
        vscode.debug.startDebugging(undefined, { type: '', name: '', request: '' });
    }));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map