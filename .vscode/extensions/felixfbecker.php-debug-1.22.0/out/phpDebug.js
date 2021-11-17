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
const vscode = __importStar(require("vscode-debugadapter"));
const net = __importStar(require("net"));
const xdebug = __importStar(require("./xdebugConnection"));
const moment = require("moment");
const url = __importStar(require("url"));
const childProcess = __importStar(require("child_process"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs"));
const terminal_1 = require("./terminal");
const paths_1 = require("./paths");
const minimatch = require("minimatch");
const breakpoints_1 = require("./breakpoints");
const semver = __importStar(require("semver"));
const logpoint_1 = require("./logpoint");
const proxyConnect_1 = require("./proxyConnect");
if (process.env['VSCODE_NLS_CONFIG']) {
    try {
        moment.locale(JSON.parse(process.env['VSCODE_NLS_CONFIG']).locale);
    }
    catch (e) {
        // ignore
    }
}
/** formats a xdebug property value for VS Code */
function formatPropertyValue(property) {
    let displayValue;
    if (property.hasChildren || property.type === 'array' || property.type === 'object') {
        if (property.type === 'array') {
            // for arrays, show the length, like a var_dump would do
            displayValue = 'array(' + (property.hasChildren ? property.numberOfChildren : 0) + ')';
        }
        else if (property.type === 'object' && property.class) {
            // for objects, show the class name as type (if specified)
            displayValue = property.class;
        }
        else {
            // edge case: show the type of the property as the value
            displayValue = property.type;
        }
    }
    else {
        // for null, uninitialized, resource, etc. show the type
        displayValue = property.value || property.type === 'string' ? property.value : property.type;
        if (property.type === 'string') {
            displayValue = '"' + displayValue + '"';
        }
        else if (property.type === 'bool') {
            displayValue = !!parseInt(displayValue) + '';
        }
    }
    return displayValue;
}
class PhpDebugSession extends vscode.DebugSession {
    constructor() {
        super();
        /**
         * A map from VS Code thread IDs to Xdebug Connections.
         * Xdebug makes a new connection for each request to the webserver, we present these as threads to VS Code.
         * The threadId key is equal to the id attribute of the connection.
         */
        this._connections = new Map();
        /** A counter for unique source IDs */
        this._sourceIdCounter = 1;
        /** A map of VS Code source IDs to Xdebug file URLs for virtual files (dpgp://whatever) and the corresponding connection */
        this._sources = new Map();
        /** A counter for unique stackframe IDs */
        this._stackFrameIdCounter = 1;
        /** A map from unique stackframe IDs (even across connections) to Xdebug stackframes */
        this._stackFrames = new Map();
        /** A map from Xdebug connections to their current status */
        this._statuses = new Map();
        /** A counter for unique context, property and eval result properties (as these are all requested by a VariableRequest from VS Code) */
        this._variableIdCounter = 1;
        /** A map from unique VS Code variable IDs to Xdebug statuses for virtual error stack frames */
        this._errorStackFrames = new Map();
        /** A map from unique VS Code variable IDs to Xdebug statuses for virtual error scopes */
        this._errorScopes = new Map();
        /** A map from unique VS Code variable IDs to an Xdebug contexts */
        this._contexts = new Map();
        /** A map from unique VS Code variable IDs to a Xdebug properties */
        this._properties = new Map();
        /** A map from unique VS Code variable IDs to Xdebug eval result properties, because property children returned from eval commands are always inlined */
        this._evalResultProperties = new Map();
        /** A flag to indicate that the adapter has already processed the stopOnEntry step request */
        this._hasStoppedOnEntry = false;
        /** Breakpoint Manager to map VS Code to Xdebug breakpoints */
        this._breakpointManager = new breakpoints_1.BreakpointManager();
        /** Breakpoint Adapters */
        this._breakpointAdapters = new Map();
        /**
         * The manager for logpoints. Since xdebug does not support anything like logpoints,
         * it has to be managed by the extension/debug server. It does that by a Map referencing
         * the log messages per file. Xdebug sees it as a regular breakpoint.
         */
        this._logPointManager = new logpoint_1.LogPointManager();
        this.setDebuggerColumnsStartAt1(true);
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerPathFormat('uri');
    }
    initializeRequest(response, args) {
        response.body = {
            supportsConfigurationDoneRequest: true,
            supportsEvaluateForHovers: false,
            supportsConditionalBreakpoints: true,
            supportsFunctionBreakpoints: true,
            supportsLogPoints: true,
            supportsHitConditionalBreakpoints: true,
            exceptionBreakpointFilters: [
                {
                    filter: 'Notice',
                    label: 'Notices',
                },
                {
                    filter: 'Warning',
                    label: 'Warnings',
                },
                {
                    filter: 'Error',
                    label: 'Errors',
                },
                {
                    filter: 'Exception',
                    label: 'Exceptions',
                },
                {
                    filter: '*',
                    label: 'Everything',
                },
            ],
            supportTerminateDebuggee: true,
        };
        this.sendResponse(response);
    }
    attachRequest(response, args) {
        this.sendErrorResponse(response, new Error('Attach requests are not supported'));
        this.shutdown();
    }
    async launchRequest(response, args) {
        var _a;
        if (args.localSourceRoot && args.serverSourceRoot) {
            let pathMappings = {};
            if (args.pathMappings) {
                pathMappings = args.pathMappings;
            }
            pathMappings[args.serverSourceRoot] = args.localSourceRoot;
            args.pathMappings = pathMappings;
        }
        this._args = args;
        this._donePromise = new Promise((resolve, reject) => {
            this._donePromiseResolveFn = resolve;
        });
        /** launches the script as CLI */
        const launchScript = async (port) => {
            // check if program exists
            if (args.program) {
                await new Promise((resolve, reject) => fs.access(args.program, fs.constants.F_OK, err => (err ? reject(err) : resolve())));
            }
            const runtimeArgs = (args.runtimeArgs || []).map(v => v.replace('${port}', port.toString()));
            const runtimeExecutable = args.runtimeExecutable || 'php';
            const programArgs = args.args || [];
            const program = args.program ? [args.program] : [];
            const cwd = args.cwd || process.cwd();
            const env = Object.fromEntries(Object.entries(args.env || process.env).map(v => { var _a; return [v[0], (_a = v[1]) === null || _a === void 0 ? void 0 : _a.replace('${port}', port.toString())]; }));
            // launch in CLI mode
            if (args.externalConsole) {
                const script = await terminal_1.Terminal.launchInTerminal(cwd, [runtimeExecutable, ...runtimeArgs, ...program, ...programArgs], env);
                if (script) {
                    // we only do this for CLI mode. In normal listen mode, only a thread exited event is send.
                    script.on('exit', () => {
                        this.sendEvent(new vscode.TerminatedEvent());
                    });
                }
            }
            else {
                const script = childProcess.spawn(runtimeExecutable, [...runtimeArgs, ...program, ...programArgs], {
                    cwd,
                    env,
                });
                // redirect output to debug console
                script.stdout.on('data', (data) => {
                    this.sendEvent(new vscode.OutputEvent(data + '', 'stdout'));
                });
                script.stderr.on('data', (data) => {
                    this.sendEvent(new vscode.OutputEvent(data + '', 'stderr'));
                });
                // we only do this for CLI mode. In normal listen mode, only a thread exited event is send.
                script.on('exit', () => {
                    this.sendEvent(new vscode.TerminatedEvent());
                });
                script.on('error', (error) => {
                    this.sendEvent(new vscode.OutputEvent(util.inspect(error) + '\n'));
                });
                this._phpProcess = script;
            }
        };
        /** sets up a TCP server to listen for Xdebug connections */
        const createServer = () => new Promise((resolve, reject) => {
            const server = (this._server = net.createServer());
            server.on('connection', async (socket) => {
                var _a;
                try {
                    // new Xdebug connection
                    // first check if we have a limit on connections
                    if ((_a = args.maxConnections) !== null && _a !== void 0 ? _a : 0 > 0) {
                        if (this._connections.size >= args.maxConnections) {
                            if (args.log) {
                                this.sendEvent(new vscode.OutputEvent(`new connection from ${socket.remoteAddress} - dropping due to max connection limit\n`), true);
                            }
                            socket.end();
                            return;
                        }
                    }
                    const connection = new xdebug.Connection(socket);
                    if (args.log) {
                        this.sendEvent(new vscode.OutputEvent(`new connection ${connection.id} from ${socket.remoteAddress}\n`), true);
                    }
                    this._connections.set(connection.id, connection);
                    const disposeConnection = (error) => {
                        if (this._connections.has(connection.id)) {
                            if (args.log) {
                                this.sendEvent(new vscode.OutputEvent(`connection ${connection.id} closed\n`));
                            }
                            if (error) {
                                this.sendEvent(new vscode.OutputEvent(`connection ${connection.id}: ${error.message}\n`));
                            }
                            this.sendEvent(new vscode.ContinuedEvent(connection.id, false));
                            this.sendEvent(new vscode.ThreadEvent('exited', connection.id));
                            connection.close();
                            this._connections.delete(connection.id);
                            this._statuses.delete(connection);
                            this._breakpointAdapters.delete(connection);
                        }
                    };
                    connection.on('warning', (warning) => {
                        this.sendEvent(new vscode.OutputEvent(warning + '\n'));
                    });
                    connection.on('error', disposeConnection);
                    connection.on('close', disposeConnection);
                    connection.on('log', (text) => {
                        if (this._args && this._args.log) {
                            const log = `xd(${connection.id}) ${text}\n`;
                            this.sendEvent(new vscode.OutputEvent(log), true);
                        }
                    });
                    try {
                        const initPacket = await connection.waitForInitPacket();
                        // support for breakpoints
                        let feat;
                        const supportedEngine = initPacket.engineName === 'Xdebug' &&
                            semver.valid(initPacket.engineVersion, { loose: true }) &&
                            semver.gte(initPacket.engineVersion, '3.0.0', { loose: true });
                        if (supportedEngine ||
                            ((feat = await connection.sendFeatureGetCommand('resolved_breakpoints')) &&
                                feat.supported === '1')) {
                            await connection.sendFeatureSetCommand('resolved_breakpoints', '1');
                        }
                        if (supportedEngine ||
                            ((feat = await connection.sendFeatureGetCommand('notify_ok')) && feat.supported === '1')) {
                            await connection.sendFeatureSetCommand('notify_ok', '1');
                            connection.on('notify_user', notify => this.handleUserNotify(notify, connection));
                        }
                        if (supportedEngine ||
                            ((feat = await connection.sendFeatureGetCommand('extended_properties')) &&
                                feat.supported === '1')) {
                            await connection.sendFeatureSetCommand('extended_properties', '1');
                        }
                        // override features from launch.json
                        try {
                            const xdebugSettings = args.xdebugSettings || {};
                            await Promise.all(Object.keys(xdebugSettings).map(setting => connection.sendFeatureSetCommand(setting, xdebugSettings[setting])));
                        }
                        catch (error) {
                            throw new Error('Error applying xdebugSettings: ' + (error instanceof Error ? error.message : error));
                        }
                        this.sendEvent(new vscode.ThreadEvent('started', connection.id));
                        // wait for all breakpoints
                        await this._donePromise;
                        let bpa = new breakpoints_1.BreakpointAdapter(connection, this._breakpointManager);
                        bpa.on('dapEvent', event => this.sendEvent(event));
                        this._breakpointAdapters.set(connection, bpa);
                        // sync breakpoints to connection
                        await bpa.process();
                        let xdebugResponse;
                        // either tell VS Code we stopped on entry or run the script
                        if (this._args.stopOnEntry) {
                            // do one step to the first statement
                            this._hasStoppedOnEntry = false;
                            xdebugResponse = await connection.sendStepIntoCommand();
                        }
                        else {
                            xdebugResponse = await connection.sendRunCommand();
                        }
                        this._checkStatus(xdebugResponse);
                    }
                    catch (error) {
                        this.sendEvent(new vscode.OutputEvent(`Failed initializing connection ${connection.id}: ` +
                            (error instanceof Error ? error.message : error) +
                            '\n', 'stderr'));
                        disposeConnection();
                        socket.destroy();
                    }
                }
                catch (error) {
                    this.sendEvent(new vscode.OutputEvent('Error in socket server: ' + (error instanceof Error ? error.message : error) + '\n', 'stderr'));
                    this.shutdown();
                }
            });
            server.on('error', (error) => {
                this.sendEvent(new vscode.OutputEvent(util.inspect(error) + '\n'));
                reject(error);
            });
            server.on('listening', () => {
                const port = server.address().port;
                resolve(port);
            });
            const listenPort = args.port === undefined ? 9003 : args.port;
            server.listen(listenPort, args.hostname);
        });
        try {
            let port = 0;
            if (!args.noDebug) {
                port = await createServer();
                if (((_a = args.proxy) === null || _a === void 0 ? void 0 : _a.enable) === true) {
                    await this.setupProxy(port);
                }
            }
            if (args.program || args.runtimeArgs) {
                await launchScript(port);
            }
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
        // request breakpoints
        this.sendEvent(new vscode.InitializedEvent());
    }
    async setupProxy(idePort) {
        this._proxyConnect = new proxyConnect_1.ProxyConnect(this._args.proxy.host, this._args.proxy.port, idePort, this._args.proxy.allowMultipleSessions, this._args.proxy.key, this._args.proxy.timeout);
        const proxyConsole = (str) => this.sendEvent(new vscode.OutputEvent(str + '\n'), true);
        this._proxyConnect.on('log_request', proxyConsole);
        this._proxyConnect.on('log_response', proxyConsole);
        this._proxyConnect.on('log_error', (error) => {
            this.sendEvent(new vscode.OutputEvent('PROXY ERROR: ' + error.message + '\n', 'stderr'));
        });
        return this._proxyConnect.sendProxyInitCommand();
    }
    /**
     * Checks the status of a StatusResponse and notifies VS Code accordingly
     * @param {xdebug.StatusResponse} response
     */
    async _checkStatus(response) {
        const connection = response.connection;
        this._statuses.set(connection, response);
        if (response.status === 'stopping') {
            const response = await connection.sendStopCommand();
            this._checkStatus(response);
        }
        else if (response.status === 'stopped') {
            this._connections.delete(connection.id);
            this._statuses.delete(connection);
            this._breakpointAdapters.delete(connection);
            this.sendEvent(new vscode.ThreadEvent('exited', connection.id));
            connection.close();
        }
        else if (response.status === 'break') {
            // First sync breakpoints
            let bpa = this._breakpointAdapters.get(connection);
            if (bpa) {
                await bpa.process();
            }
            // StoppedEvent reason can be 'step', 'breakpoint', 'exception' or 'pause'
            let stoppedEventReason;
            let exceptionText;
            if (response.exception) {
                // If one of the ignore patterns matches, ignore this exception
                if (this._args.ignore &&
                    this._args.ignore.some(glob => minimatch((0, paths_1.convertDebuggerPathToClient)(response.fileUri).replace(/\\/g, '/'), glob))) {
                    const response = await connection.sendRunCommand();
                    await this._checkStatus(response);
                    return;
                }
                stoppedEventReason = 'exception';
                exceptionText = response.exception.name + ': ' + response.exception.message; // this seems to be ignored currently by VS Code
            }
            else if (this._args.stopOnEntry && !this._hasStoppedOnEntry) {
                stoppedEventReason = 'entry';
                this._hasStoppedOnEntry = true;
            }
            else if (response.command.indexOf('step') === 0) {
                stoppedEventReason = 'step';
            }
            else {
                stoppedEventReason = 'breakpoint';
            }
            // Check for log points
            if (this._logPointManager.hasLogPoint(response.fileUri, response.line)) {
                const logMessage = await this._logPointManager.resolveExpressions(response.fileUri, response.line, async (expr) => {
                    const evaluated = await connection.sendEvalCommand(expr);
                    return formatPropertyValue(evaluated.result);
                });
                this.sendEvent(new vscode.OutputEvent(logMessage + '\n', 'console'));
                if (stoppedEventReason === 'breakpoint') {
                    const responseCommand = await connection.sendRunCommand();
                    await this._checkStatus(responseCommand);
                    return;
                }
            }
            const event = new vscode.StoppedEvent(stoppedEventReason, connection.id, exceptionText);
            event.body.allThreadsStopped = false;
            this.sendEvent(event);
        }
    }
    /** Logs all requests before dispatching */
    dispatchRequest(request) {
        if (this._args && this._args.log) {
            const log = `-> ${request.command}Request\n${util.inspect(request, { depth: Infinity })}\n\n`;
            super.sendEvent(new vscode.OutputEvent(log));
        }
        super.dispatchRequest(request);
    }
    sendEvent(event, bypassLog = false) {
        if (this._args && this._args.log && !bypassLog) {
            const log = `<- ${event.event}Event\n${util.inspect(event, { depth: Infinity })}\n\n`;
            super.sendEvent(new vscode.OutputEvent(log));
        }
        super.sendEvent(event);
    }
    sendResponse(response) {
        if (this._args && this._args.log) {
            const log = `<- ${response.command}Response\n${util.inspect(response, { depth: Infinity })}\n\n`;
            super.sendEvent(new vscode.OutputEvent(log));
        }
        super.sendResponse(response);
    }
    sendErrorResponse(response) {
        if (arguments[1] instanceof Error) {
            const error = arguments[1];
            const dest = arguments[2];
            let code;
            if (typeof error.code === 'number') {
                code = error.code;
            }
            else if (typeof error.errno === 'number') {
                code = error.errno;
            }
            else {
                code = 0;
            }
            super.sendErrorResponse(response, code, error.message, dest);
        }
        else {
            super.sendErrorResponse(response, arguments[1], arguments[2], arguments[3], arguments[4]);
        }
    }
    handleUserNotify(notify, connection) {
        if (notify.property !== undefined) {
            const event = new vscode.OutputEvent('', 'stdout');
            const property = new xdebug.SyntheticProperty('', 'object', formatPropertyValue(notify.property), [
                notify.property,
            ]);
            let variablesReference = this._variableIdCounter++;
            this._evalResultProperties.set(variablesReference, property);
            event.body.variablesReference = variablesReference;
            if (notify.fileUri.startsWith('file://')) {
                const filePath = (0, paths_1.convertDebuggerPathToClient)(notify.fileUri, this._args.pathMappings);
                event.body.source = { name: path.basename(filePath), path: filePath };
                event.body.line = notify.line;
            }
            this.sendEvent(event);
        }
    }
    /** This is called for each source file that has breakpoints with all the breakpoints in that file and whenever these change. */
    async setBreakPointsRequest(response, args) {
        try {
            const fileUri = (0, paths_1.convertClientPathToDebugger)(args.source.path, this._args.pathMappings);
            const vscodeBreakpoints = this._breakpointManager.setBreakPoints(args.source, fileUri, args.breakpoints);
            response.body = { breakpoints: vscodeBreakpoints };
            // Process logpoints
            this._logPointManager.clearFromFile(fileUri);
            args.breakpoints.filter(breakpoint => breakpoint.logMessage).forEach(breakpoint => {
                this._logPointManager.addLogPoint(fileUri, breakpoint.line, breakpoint.logMessage);
            });
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
        this._breakpointManager.process();
    }
    /** This is called once after all line breakpoints have been set and whenever the breakpoints settings change */
    async setExceptionBreakPointsRequest(response, args) {
        try {
            const vscodeBreakpoints = this._breakpointManager.setExceptionBreakPoints(args.filters);
            response.body = { breakpoints: vscodeBreakpoints };
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
        this._breakpointManager.process();
    }
    async setFunctionBreakPointsRequest(response, args) {
        try {
            const vscodeBreakpoints = this._breakpointManager.setFunctionBreakPointsRequest(args.breakpoints);
            response.body = { breakpoints: vscodeBreakpoints };
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
        this._breakpointManager.process();
    }
    /** Executed after all breakpoints have been set by VS Code */
    async configurationDoneRequest(response, args) {
        this.sendResponse(response);
        this._donePromiseResolveFn();
    }
    /** Executed after a successful launch or attach request and after a ThreadEvent */
    threadsRequest(response) {
        // PHP doesn't have threads, but it may have multiple requests in parallel.
        // Think about a website that makes multiple, parallel AJAX requests to your PHP backend.
        // Xdebug opens a new socket connection for each of them, we tell VS Code that these are our threads.
        const connections = Array.from(this._connections.values());
        response.body = {
            threads: connections.map(connection => new vscode.Thread(connection.id, `Request ${connection.id} (${moment(connection.timeEstablished).format('LTS')})`)),
        };
        this.sendResponse(response);
    }
    /** Called by VS Code after a StoppedEvent */
    async stackTraceRequest(response, args) {
        try {
            const connection = this._connections.get(args.threadId);
            if (!connection) {
                throw new Error('Unknown thread ID');
            }
            const { stack } = await connection.sendStackGetCommand();
            // First delete the old stack trace info ???
            // this._stackFrames.clear();
            // this._properties.clear();
            // this._contexts.clear();
            const status = this._statuses.get(connection);
            if (stack.length === 0 && status && status.exception) {
                // special case: if a fatal error occurs (for example after an uncaught exception), the stack trace is EMPTY.
                // in that case, VS Code would normally not show any information to the user at all
                // to avoid this, we create a virtual stack frame with the info from the last status response we got
                const status = this._statuses.get(connection);
                const id = this._stackFrameIdCounter++;
                const name = status.exception.name;
                let line = status.line;
                let source;
                const urlObject = url.parse(status.fileUri);
                if (urlObject.protocol === 'dbgp:') {
                    let sourceReference;
                    const src = Array.from(this._sources).find(([, v]) => v.url === status.fileUri && v.connection === connection);
                    if (src) {
                        sourceReference = src[0];
                    }
                    else {
                        sourceReference = this._sourceIdCounter++;
                        this._sources.set(sourceReference, { connection, url: status.fileUri });
                    }
                    // for eval code, we need to include .php extension to get syntax highlighting
                    source = { name: status.exception.name + '.php', sourceReference, origin: status.exception.name };
                    // for eval code, we add a "<?php" line at the beginning to get syntax highlighting (see sourceRequest)
                    line++;
                }
                else {
                    // Xdebug paths are URIs, VS Code file paths
                    const filePath = (0, paths_1.convertDebuggerPathToClient)(urlObject, this._args.pathMappings);
                    // "Name" of the source and the actual file path
                    source = { name: path.basename(filePath), path: filePath };
                }
                this._errorStackFrames.set(id, status);
                response.body = { stackFrames: [{ id, name, source, line, column: 1 }] };
            }
            else {
                response.body = {
                    stackFrames: stack.map((stackFrame) => {
                        let source;
                        let line = stackFrame.line;
                        const urlObject = url.parse(stackFrame.fileUri);
                        if (urlObject.protocol === 'dbgp:') {
                            let sourceReference;
                            const src = Array.from(this._sources).find(([, v]) => v.url === stackFrame.fileUri && v.connection === connection);
                            if (src) {
                                sourceReference = src[0];
                            }
                            else {
                                sourceReference = this._sourceIdCounter++;
                                this._sources.set(sourceReference, { connection, url: stackFrame.fileUri });
                            }
                            // for eval code, we need to include .php extension to get syntax highlighting
                            source = {
                                name: stackFrame.type === 'eval'
                                    ? `eval ${stackFrame.fileUri.substr(7)}.php`
                                    : stackFrame.name,
                                sourceReference,
                                origin: stackFrame.type,
                            };
                            // for eval code, we add a "<?php" line at the beginning to get syntax highlighting (see sourceRequest)
                            line++;
                        }
                        else {
                            // Xdebug paths are URIs, VS Code file paths
                            const filePath = (0, paths_1.convertDebuggerPathToClient)(urlObject, this._args.pathMappings);
                            // "Name" of the source and the actual file path
                            source = { name: path.basename(filePath), path: filePath };
                        }
                        // a new, unique ID for scopeRequests
                        const stackFrameId = this._stackFrameIdCounter++;
                        // save the connection this stackframe belongs to and the level of the stackframe under the stacktrace id
                        this._stackFrames.set(stackFrameId, stackFrame);
                        // prepare response for VS Code (column is always 1 since Xdebug doesn't tell us the column)
                        return { id: stackFrameId, name: stackFrame.name, source, line, column: 1 };
                    }),
                };
            }
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
    }
    async sourceRequest(response, args) {
        try {
            if (!this._sources.has(args.sourceReference)) {
                throw new Error(`Unknown sourceReference ${args.sourceReference}`);
            }
            const { connection, url } = this._sources.get(args.sourceReference);
            let { source } = await connection.sendSourceCommand(url);
            if (!/^\s*<\?(php|=)/.test(source)) {
                // we do this because otherwise VS Code would not show syntax highlighting for eval() code
                source = '<?php\n' + source;
            }
            response.body = { content: source, mimeType: 'application/x-php' };
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
    }
    async scopesRequest(response, args) {
        try {
            let scopes = [];
            if (this._errorStackFrames.has(args.frameId)) {
                // VS Code is requesting the scopes for a virtual error stack frame
                const status = this._errorStackFrames.get(args.frameId);
                if (status.exception) {
                    const variableId = this._variableIdCounter++;
                    this._errorScopes.set(variableId, status);
                    scopes = [new vscode.Scope(status.exception.name.replace(/^(.*\\)+/g, ''), variableId)];
                }
            }
            else {
                const stackFrame = this._stackFrames.get(args.frameId);
                if (!stackFrame) {
                    throw new Error(`Unknown frameId ${args.frameId}`);
                }
                const contexts = await stackFrame.getContexts();
                scopes = contexts.map(context => {
                    const variableId = this._variableIdCounter++;
                    // remember that this new variable ID is assigned to a SCOPE (in Xdebug "context"), not a variable (in Xdebug "property"),
                    // so when VS Code does a variablesRequest with that ID we do a context_get and not a property_get
                    this._contexts.set(variableId, context);
                    // send VS Code the variable ID as identifier
                    return new vscode.Scope(context.name, variableId);
                });
                const status = this._statuses.get(stackFrame.connection);
                if (status && status.exception) {
                    const variableId = this._variableIdCounter++;
                    this._errorScopes.set(variableId, status);
                    scopes.unshift(new vscode.Scope(status.exception.name.replace(/^(.*\\)+/g, ''), variableId));
                }
            }
            response.body = { scopes };
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
    }
    async variablesRequest(response, args) {
        try {
            const variablesReference = args.variablesReference;
            let variables;
            if (this._errorScopes.has(variablesReference)) {
                // this is a virtual error scope
                const status = this._errorScopes.get(variablesReference);
                variables = [
                    new vscode.Variable('type', status.exception.name),
                    new vscode.Variable('message', '"' + status.exception.message + '"'),
                ];
                if (status.exception.code !== undefined) {
                    variables.push(new vscode.Variable('code', status.exception.code + ''));
                }
            }
            else {
                // it is a real scope
                let properties;
                if (this._contexts.has(variablesReference)) {
                    // VS Code is requesting the variables for a SCOPE, so we have to do a context_get
                    const context = this._contexts.get(variablesReference);
                    properties = await context.getProperties();
                }
                else if (this._properties.has(variablesReference)) {
                    // VS Code is requesting the subelements for a variable, so we have to do a property_get
                    const property = this._properties.get(variablesReference);
                    if (property.hasChildren) {
                        if (property.children.length === property.numberOfChildren) {
                            properties = property.children;
                        }
                        else {
                            properties = await property.getChildren();
                        }
                    }
                    else {
                        properties = [];
                    }
                }
                else if (this._evalResultProperties.has(variablesReference)) {
                    // the children of properties returned from an eval command are always inlined, so we simply resolve them
                    const property = this._evalResultProperties.get(variablesReference);
                    properties = property.hasChildren ? property.children : [];
                }
                else {
                    throw new Error('Unknown variable reference');
                }
                variables = properties.map(property => {
                    var _a;
                    const displayValue = formatPropertyValue(property);
                    let variablesReference;
                    let evaluateName;
                    if (property.hasChildren || property.type === 'array' || property.type === 'object') {
                        // if the property has children, we have to send a variableReference back to VS Code
                        // so it can receive the child elements in another request.
                        // for arrays and objects we do it even when it does not have children so the user can still expand/collapse the entry
                        variablesReference = this._variableIdCounter++;
                        if (property instanceof xdebug.Property) {
                            this._properties.set(variablesReference, property);
                        }
                        else if (property instanceof xdebug.EvalResultProperty) {
                            this._evalResultProperties.set(variablesReference, property);
                        }
                    }
                    else {
                        variablesReference = 0;
                    }
                    if (property instanceof xdebug.Property) {
                        evaluateName = property.fullName;
                    }
                    else {
                        evaluateName = property.name;
                    }
                    let presentationHint = {};
                    if ((_a = property.facets) === null || _a === void 0 ? void 0 : _a.length) {
                        if (property.facets.includes('public')) {
                            presentationHint.visibility = 'public';
                        }
                        else if (property.facets.includes('private')) {
                            presentationHint.visibility = 'private';
                        }
                        else if (property.facets.includes('protected')) {
                            presentationHint.visibility = 'protected';
                        }
                        if (property.facets.includes('readonly')) {
                            presentationHint.attributes = presentationHint.attributes || [];
                            presentationHint.attributes.push('readOnly');
                        }
                        if (property.facets.includes('static')) {
                            presentationHint.attributes = presentationHint.attributes || [];
                            presentationHint.attributes.push('static');
                        }
                        if (property.facets.includes('virtual')) {
                            presentationHint.kind = 'virtual';
                        }
                    }
                    const variable = {
                        name: property.name,
                        value: displayValue,
                        type: property.type,
                        variablesReference,
                        presentationHint,
                        evaluateName,
                    };
                    return variable;
                });
            }
            response.body = { variables };
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
    }
    async continueRequest(response, args) {
        let connection;
        try {
            connection = this._connections.get(args.threadId);
            if (!connection) {
                return this.sendErrorResponse(response, new Error('Unknown thread ID ' + args.threadId));
            }
            response.body = {
                allThreadsContinued: false,
            };
            this.sendResponse(response);
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        try {
            const xdebugResponse = await connection.sendRunCommand();
            this._checkStatus(xdebugResponse);
        }
        catch (error) {
            this.sendEvent(new vscode.OutputEvent('continueRequest thread ID ' + args.threadId + ' error: ' + error.message + '\n'), true);
        }
    }
    async nextRequest(response, args) {
        let connection;
        try {
            connection = this._connections.get(args.threadId);
            if (!connection) {
                return this.sendErrorResponse(response, new Error('Unknown thread ID ' + args.threadId));
            }
            this.sendResponse(response);
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        try {
            const xdebugResponse = await connection.sendStepOverCommand();
            this._checkStatus(xdebugResponse);
        }
        catch (error) {
            this.sendEvent(new vscode.OutputEvent('nextRequest thread ID ' + args.threadId + ' error: ' + error.message + '\n'), true);
        }
    }
    async stepInRequest(response, args) {
        let connection;
        try {
            connection = this._connections.get(args.threadId);
            if (!connection) {
                return this.sendErrorResponse(response, new Error('Unknown thread ID ' + args.threadId));
            }
            this.sendResponse(response);
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        try {
            const xdebugResponse = await connection.sendStepIntoCommand();
            this._checkStatus(xdebugResponse);
        }
        catch (error) {
            this.sendEvent(new vscode.OutputEvent('stepInRequest thread ID ' + args.threadId + ' error: ' + error.message + '\n'), true);
        }
    }
    async stepOutRequest(response, args) {
        let connection;
        try {
            connection = this._connections.get(args.threadId);
            if (!connection) {
                return this.sendErrorResponse(response, new Error('Unknown thread ID ' + args.threadId));
            }
            this.sendResponse(response);
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        try {
            const xdebugResponse = await connection.sendStepOutCommand();
            this._checkStatus(xdebugResponse);
        }
        catch (error) {
            this.sendEvent(new vscode.OutputEvent('stepOutRequest thread ID ' + args.threadId + ' error: ' + error.message + '\n'), true);
        }
    }
    pauseRequest(response, args) {
        this.sendErrorResponse(response, new Error('Pausing the execution is not supported by Xdebug'));
    }
    async disconnectRequest(response, args) {
        try {
            await Promise.all(Array.from(this._connections).map(async ([id, connection]) => {
                if ((args === null || args === void 0 ? void 0 : args.terminateDebuggee) !== false) {
                    // Try to send stop command for 500ms
                    // If the script is running, just close the connection
                    await Promise.race([
                        connection.sendStopCommand(),
                        new Promise(resolve => setTimeout(resolve, 500)),
                    ]);
                }
                await connection.close();
                this._connections.delete(id);
                this._statuses.delete(connection);
                this._breakpointAdapters.delete(connection);
            }));
            // If listening for connections, close server
            if (this._server) {
                await new Promise(resolve => this._server.close(resolve));
            }
            // If launched as CLI, kill process
            if (this._phpProcess) {
                this._phpProcess.kill();
            }
            // Unregister proxy
            if (this._proxyConnect) {
                await this._proxyConnect.sendProxyStopCommand();
            }
        }
        catch (error) {
            this.sendErrorResponse(response, error);
            return;
        }
        this.sendResponse(response);
        this.shutdown();
    }
    async evaluateRequest(response, args) {
        try {
            if (!args.frameId) {
                throw new Error('Cannot evaluate code without a connection');
            }
            if (!this._stackFrames.has(args.frameId)) {
                throw new Error(`Unknown frameId ${args.frameId}`);
            }
            const connection = this._stackFrames.get(args.frameId).connection;
            const { result } = await connection.sendEvalCommand(args.expression);
            if (result) {
                const displayValue = formatPropertyValue(result);
                let variablesReference;
                // if the property has children, generate a variable ID and save the property (including children) so VS Code can request them
                if (result.hasChildren || result.type === 'array' || result.type === 'object') {
                    variablesReference = this._variableIdCounter++;
                    this._evalResultProperties.set(variablesReference, result);
                }
                else {
                    variablesReference = 0;
                }
                response.body = { result: displayValue, variablesReference };
            }
            else {
                response.body = { result: 'no result', variablesReference: 0 };
            }
            this.sendResponse(response);
        }
        catch (error) {
            response.message = error.message;
            response.success = false;
            this.sendResponse(response);
        }
    }
}
vscode.DebugSession.run(PhpDebugSession);
//# sourceMappingURL=phpDebug.js.map