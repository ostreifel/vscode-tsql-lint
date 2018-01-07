import * as fs from "fs";
import * as path from "path";
import { executeForFile } from "tsql-lint-ts";
import { SqlRuleFailure } from "tsql-lint-ts/lib/rules/common/SqlRuleFailure";
import {
    createConnection, Diagnostic, DiagnosticSeverity,
    IConnection, InitializeResult, IPCMessageReader, IPCMessageWriter,
    TextDocument,
    TextDocuments,
} from "vscode-languageserver";
import Uri from "vscode-uri";
import { getSqlLintCommands, resetFileFailures, storeFailure } from "./commands";
// import { SqlRuleFailure } from "./lint/rules/common/SqlRuleFailure";
// import { executeForFile } from "./lint/rulesManager";

const verboseLog = true;
function log(msg: string, ...args: object[]) {
    if (verboseLog) {
        console.log(msg, ...args);
    }
}

// Create a connection for the server. The connection uses Node's IPC as a transport
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
// let workspaceRoot: string;n
connection.onInitialize((params): InitializeResult => {
    // workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            codeActionProvider: true,
        },
    };
});
connection.onDidChangeConfiguration((change) => {
    log("settings", change.settings);
    // const settings = change.settings as ISettings;
    // maxNumberOfProblems = settings["tsql-lint"].maxNumberOfProblems || 100;
    // Revalidate any open text documents
    documents.all().forEach(validateTextDocument);
});

function validateTextDocument(document: TextDocument): void {
    const fileContent = document.getText();

    resetFileFailures(document.uri);
    function getFilePath(uriString: string): string | "" {
        const uri = Uri.parse(uriString);
        if (uri.scheme !== "file" || !uri.path) {
            return "";
        }
        const p1 = path.resolve(uri.path);
        if (fs.existsSync(p1)) {
            return p1;
        }
        // vscode-uri has a bugged regex search sometimes
        const p2 = path.resolve(uri.path.substr(1));
        if (fs.existsSync(p2)) {
            return p2;
        }
        return "";
    }
    function toDiagnostic(failure: SqlRuleFailure): Diagnostic {
        const diagnostic: Diagnostic =  {
            message: failure.message,
            range: {
                start: {
                    line: failure.startPos.line,
                    character: failure.startPos.column,
                },
                end: {
                    line: failure.endPos.line,
                    character: failure.endPos.column + 1,
                },
            },
            severity: DiagnosticSeverity.Error,
            code: failure.ruleName,
            source: "tsql-lint",
        };
        storeFailure(document, diagnostic, failure);
        return diagnostic;
    }
    const errors: SqlRuleFailure[] = executeForFile(fileContent, getFilePath(document.uri));
    const diagnostics: Diagnostic[] = errors.map(toDiagnostic);
    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: document.uri, diagnostics }); }

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

connection.onCodeAction(getSqlLintCommands);

// Listen on the connection
connection.listen();
