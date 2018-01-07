import { Replacement } from "tsql-lint-ts/lib/Replacement";
import { SqlRuleFailure } from "tsql-lint-ts/lib/rules/common/SqlRuleFailure";
import * as server from "vscode-languageserver";
import { CodeActionParams, Command } from "vscode-languageserver";

interface IFileFixes {
    [diagnosticKey: string]: IAutoFix;
}
const allFixes: {[uri: string]: IFileFixes} = {};
function computeKey(diagnostic: server.Diagnostic): string {
    const range = diagnostic.range;
    return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}

function getFileFixes(uri: string): IFileFixes {
    if (!(uri in allFixes)) {
        allFixes[uri] = {};
    }
    return allFixes[uri];
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
        getFileFixes(document.uri)[computeKey(diagnostic)] = fix;
    }
}

export function resetFileFailures(uri: string) {
    delete allFixes[uri];
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
        return getFileFixes(uri)[computeKey(diagnostic)];
    }
    function createTextEdit(autoFix: IAutoFix): server.TextEdit[] {
        return autoFix.edits.map(
            (each) => server.TextEdit.replace(server.Range.create(each.range[0], each.range[1]), each.text || ""),
        );
    }

    function fixComparer(a: IAutoFix, b: IAutoFix): number {
        const editA: IEdit = a.edits[0];
        const editB: IEdit = b.edits[0];

        if (editA.range[0].line < editB.range[0].line) {
            return -1;
        }
        if (editA.range[0].line > editB.range[0].line) {
            return 1;
        }
        // lines are equal
        if (editA.range[1].character < editB.range[1].character) {
            return -1;
        }
        if (editA.range[1].character > editB.range[1].character) {
            return 1;
        }
        // characters are equal
        return 0;
    }

    function overlaps(lastFix: IAutoFix | undefined, nextFix: IAutoFix): boolean {
        if (!lastFix) {
            return false;
        }
        let doesOverlap = false;
        lastFix.edits.some((last) => {
            return nextFix.edits.some((next) => {
                if (last.range[1].line > next.range[0].line) {
                    doesOverlap = true;
                    return true;
                } else if (last.range[1].line < next.range[0].line) {
                    return false;
                } else if (last.range[1].character >= next.range[0].character) {
                    doesOverlap = true;
                    return true;
                }
                return false;
            });
        });
        return doesOverlap;
    }

    function getLastEdit(array: IAutoFix[]): IAutoFix | undefined {
        const length = array.length;
        if (length === 0) {
            return undefined;
        }
        return array[length - 1];
    }

    function concatenateEdits(fixes: IAutoFix[]): server.TextEdit[] {
        let textEdits: server.TextEdit[] = [];
        fixes.forEach((each) => {
            textEdits = textEdits.concat(createTextEdit(each));
        });
        return textEdits;
    }

    const document = params.textDocument;
    const commands: Command[] = [];
    let ruleId: string = "";
    let documentVersion: number = -1;

    for (const diagnostic of params.context.diagnostics) {
        const fix = getFix(document.uri, diagnostic);
        if (!fix) {
            continue;
        }
        ruleId = fix.failure.ruleName;
        documentVersion = fix.documentVersion;
        commands.push(Command.create(
            diagnostic.message,
            "_tsql-lint.fix",
            document.uri,
            fix.documentVersion,
            createTextEdit(fix),
        ));
    }

    if (commands.length > 0) {
        const same: IAutoFix[] = [];
        const all: IAutoFix[] = [];
        const documentFixes = getFileFixes(document.uri);
        const fixes: IAutoFix[] = Object.keys(documentFixes).map((key) => documentFixes[key]).sort(fixComparer);

        for (const autofix of fixes) {
            if (documentVersion === -1) {
                documentVersion = autofix.documentVersion;
            }
            if (autofix.failure.ruleName === ruleId && !overlaps(getLastEdit(same), autofix)) {
                same.push(autofix);
            }
            if (!overlaps(getLastEdit(all), autofix)) {
                all.push(autofix);
            }
        }

        // if the same rule warning exists more than once, provide a command to fix all these warnings
        if (same.length > 1) {
            commands.push(
                server.Command.create(
                    `Fix all: ${same[0].failure.ruleName}`,
                    "_tsql-lint.fix",
                    document.uri,
                    documentVersion, concatenateEdits(same)));
        }
    }
    // TODO fixall
    // TODO fix all of type
    return commands;
}
