import {
    createConnection, Diagnostic, DiagnosticSeverity, DidChangeWatchedFilesParams,
    IConnection, InitializeResult, IPCMessageReader, IPCMessageWriter, TextDocument,
    TextDocuments,
} from "vscode-languageserver";
import { getErrors } from "../rulesManager";
import { SqlRuleFailure } from "../SqlRuleFailure";
const verboseLog = true;
function log(msg: string, ...args: object[]) {
    if (verboseLog) {
        console.log(msg, ...args);
    }
}

// Create a connection for the server. The connection uses Node's IPC as a transport
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));
log("Loading sqlLintServer.js");

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
// let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
    log("onintialize");
    // workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            // Tell the client that the server support code complete
            completionProvider: {
                resolveProvider: true,
            },
        },
    };
});

// The settings interface describe the server relevant settings part
// interface ISettings {
//     "tsql-lint": IExampleSettings;
// }

// // These are the example settings we defined in the client's package.json
// // file
// interface IExampleSettings {
//     maxNumberOfProblems: number;
// }

// hold the maxNumberOfProblems setting
// let maxNumberOfProblems: number;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
    log("settings", change.settings);
    // const settings = change.settings as ISettings;
    // maxNumberOfProblems = settings["tsql-lint"].maxNumberOfProblems || 100;
    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});

function validateTextDocument(textDocument: TextDocument): void {
    log(`Validating Doc ${textDocument.uri}`);
    const diagnostics: Diagnostic[] = [];
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((changeEvent: DidChangeWatchedFilesParams) => {
    // Monitored files have change in VSCode
    log("We recevied an file change event");
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    log(`documents.onDidChangeContent ${change.document.uri}`);
    const fileContent = change.document.getText();

    function toDiagnostic({message, start, end}: SqlRuleFailure): Diagnostic {
        return {
            message,
            range: {
                start: {
                    line: start.line,
                    character: start.column,
                },
                end: {
                    line: end.line,
                    character: end.column,
                },
            },
            severity: DiagnosticSeverity.Error,
        };
    }
    const errors: SqlRuleFailure[] = getErrors(fileContent);
    const diagnostics: Diagnostic[] = errors.map(toDiagnostic);
    log(`diagnotics count: ${diagnostics.length}`);
    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

// Listen on the connection
connection.listen();
