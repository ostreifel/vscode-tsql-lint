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
export function activate(context: vscode.ExtensionContext) {

        // The server is implemented in node
        const serverModule = context.asAbsolutePath(path.join("out", "src", "server", "tsqlLintServer.js"));
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
        };

        // Create the language client and start the client.
        const client = new LanguageClient(
            "tsql-lint",
            "Language Server Example",
            serverOptions,
            clientOptions,
        );

        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(
            client.start(),
            vscode.commands.registerCommand("tsql-lint.fix", () => {}),
        );
}

// this method is called when your extension is deactivated
export function deactivate() {
    // noop
}
