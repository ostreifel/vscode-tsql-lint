import * as fs from "fs";
import * as path from "path";

export interface ILintRulesConfiguration {
    [ruleName: string]: LintRuleArguments;
}
export type FailureLevel = "error";
export type LintRuleArguments = FailureLevel;
export interface ILintConfiguration {
    rules: ILintRulesConfiguration;
}

/** from tsqllint (c# impl) */
const defaultConfig: ILintConfiguration = {
    rules: {
        "conditional-begin-end": "error",
        "cross-database-transaction": "error",
        "data-compression": "error",
        "data-type-length": "error",
        "disallow-cursors": "error",
        "full-text": "error",
        "information-schema": "error",
        "keyword-capitalization": "error",
        "linked-server": "error",
        "multi-table-alias": "error",
        "non-sargable": "error",
        "object-property": "error",
        "print-statement": "error",
        "schema-qualify": "error",
        "select-star": "error",
        "semicolon-termination": "error",
        "set-ansi": "error",
        "set-nocount": "error",
        "set-quoted-identifier": "error",
        "set-transaction-isolation-level": "error",
        "set-variable": "error",
        "upper-lower": "error",
        "unicode-string" : "error",
    },
};

const configName = ".tsqllintrc";
function getPath(currentDir: string): string {
    const isConfig = (p: string) => fs.existsSync(p);
    const pathParts = path.resolve(currentDir).split(path.sep);
    do {
        const testPath = path.join(...pathParts, configName);
        console.log("testing config path", testPath);
        if (isConfig(testPath)) {
            return testPath;
        }
        pathParts.pop();
    } while (pathParts.length > 0);
    return "";
}

export function getLintConfiguration(currentDir: string = path.resolve(".")): ILintConfiguration {
    const configPath = getPath(currentDir);
    if (configPath) {
        const fileContents = fs.readFileSync(configPath, "utf8");
        console.log("fileContents", fileContents);
        return JSON.parse(fileContents);
    }
    return defaultConfig;
}
