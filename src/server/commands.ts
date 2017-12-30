import * as server from "vscode-languageserver";
import { CodeActionParams, Command } from "vscode-languageserver";
import { Replacement } from "../Replacement";
import { SqlRuleFailure } from "../SqlRuleFailure";

interface IFileFailures {
    [diagnosticKey: string]: IAutoFix;
}
const failures: {[uri: string]: IFileFailures} = {};
function computeKey(diagnostic: server.Diagnostic): string {
    const range = diagnostic.range;
    return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}

function getFileFailures(uri: string): IFileFailures {
    if (!(uri in failures)) {
        failures[uri] = {};
    }
    return failures[uri];
}

export function storeFailure(
    document: server.TextDocument, diagnostic: server.Diagnostic, failure: SqlRuleFailure,
): void {
    function toAutoFix(): IAutoFix | null {
        function convertReplacementToEdit(replacement: Replacement): IEdit {
            const start: server.Position = document.positionAt(replacement.start);
            const end: server.Position = document.positionAt(replacement.end);
            return {
                range: [start, end],
                text: replacement.text,
            };
        }
        if (!failure.fix) {
            return null;
        }
        return {
            documentVersion: document.version,
            edits: failure.fix.map(convertReplacementToEdit),
            label: failure.message,
            failure,
        };
    }
    const fix = toAutoFix();
    if (fix) {
        getFileFailures(document.uri)[computeKey(diagnostic)] = fix;
    }
}

interface IAutoFix {
    label: string;
    documentVersion: number;
    failure: SqlRuleFailure;
    edits: IEdit[];
}
interface IEdit {
    range: [server.Position, server.Position];
    text: string;
}

export function getSqlLintCommands(params: CodeActionParams): Command[] {
    function getFix(uri: string, diagnostic: server.Diagnostic): IAutoFix | undefined {
        return getFileFailures(uri)[computeKey(diagnostic)];
    }
    function createTextEdit(autoFix: IAutoFix): server.TextEdit[] {
        return autoFix.edits.map(
            (each) => server.TextEdit.replace(server.Range.create(each.range[0], each.range[1]), each.text || ""),
        );
    }
    console.log("on code action called", params);
    const document = params.textDocument;
    const commands: Command[] = [];

    for (const diagnostic of params.context.diagnostics) {
        const fix = getFix(document.uri, diagnostic);
        if (!fix) {
            continue;
        }
        commands.push(Command.create(diagnostic.message, "_tsql-lint.fix", document.uri, createTextEdit(fix)));
    }
    // TODO fixall
    // TODO fix all of type
    return commands;
}
