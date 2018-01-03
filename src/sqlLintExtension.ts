"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import {
    ForkOptions,
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from "vscode-languageclient";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(extensionContext: vscode.ExtensionContext) {

        // The server is implemented in node
        const serverModule = extensionContext.asAbsolutePath(path.join("out", "src", "server", "tsqlLintServer.js"));
        console.log("serverpath:", serverModule);
        // The debug options for the server
        const debugOptions: ForkOptions = { execArgv: [
            "--nolazy",
            "--debug=6009",
        ] };

        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run : { module: serverModule, transport: TransportKind.ipc },
            debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
    };

        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            // Register the server for plain text documents
            documentSelector: [{scheme: "file", language: "sql"}],
            synchronize: {
                // Synchronize the setting section 'tsql-lint' to the server
                configurationSection: "tsql-lint",
                // Notify the server about file changes to '.clientrc files contain in the workspace
                fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
            },
            diagnosticCollectionName: "tsql-lint",
            initializationFailedHandler: (error) => {
                client.error("Server initialization failed.", error);
                client.outputChannel.show(true);
                return false;
            },
            middleware: {
                provideCodeActions: (
                    document, range, context, token, next,
                ): vscode.ProviderResult<vscode.Command[]> => {
                    // do not ask server for code action when the diagnostic isn't from tsql-lint
                    if (!context.diagnostics || context.diagnostics.length === 0) {
                        return [];
                    }
                    const sqlLint: vscode.Diagnostic[] = [];
                    for (const diagnostic of context.diagnostics) {
                        if (diagnostic.source === "tsql-lint") {
                            sqlLint.push(diagnostic);
                        }
                    }
                    if (sqlLint.length === 0) {
                        return [];
                    }
                    const newContext: vscode.CodeActionContext = {
                        ...context,
                        diagnostics: sqlLint,
                    } as vscode.CodeActionContext;
                    return next(document, range, newContext, token);
                },
            },
        };

        // Create the language client and start the client.
        const client = new LanguageClient(
            "tsql-lint",
            "Language Server Example",
            serverOptions,
            clientOptions,
        );
        client.registerProposedFeatures();

        function applyTextEdits(uri: string, documentVersion: number, edits: vscode.TextEdit[]) {
            const textEditor = vscode.window.activeTextEditor;
            if (textEditor && textEditor.document.uri.toString() === uri) {
                if (textEditor.document.version !== documentVersion) {
                    vscode.window.showInformationMessage(
                        `SqlLint fixes are outdated and can't be applied to the document.`,
                    );
                }
                textEditor.edit((mutator) => {
                    for (const edit of edits) {
                        mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                    }
                }).then((success) => {
                    if (!success) {
                        vscode.window.showErrorMessage(
                            "Failed to apply SqlLint fixes to the document. " +
                            "Please consider opening an issue with steps to reproduce.",
                        );
                    }
                });
            }
        }

        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        extensionContext.subscriptions.push(
            client.start(),
            vscode.commands.registerCommand("_tsql-lint.fix", applyTextEdits),
        );
}

// this method is called when your extension is deactivated
export function deactivate() {
    // noop
}
