import * as path from "path";
import { getLintConfiguration, ILintConfiguration } from "./configuration";
import { getExemptions } from "./getExemptions";
import { ParsedSqlFile } from "./ParsedSqlFile";
import { BaseSqlRule } from "./rules/common/BaseSqlRule";
import { SqlRuleFailure } from "./rules/common/SqlRuleFailure";
import { KeywordCasingRule } from "./rules/KeywordCasingRule";

const allRules: BaseSqlRule[] = [
    new KeywordCasingRule(),
];
const ruleLookup: {[ruleName: string]: BaseSqlRule} = {};
for (const rule of allRules) {
    ruleLookup[rule.name] = rule;
}

function getRules(config: ILintConfiguration) {
    const rules: BaseSqlRule[] = [];
    for (const name in config.rules) {
        const rule = ruleLookup[name];
        // TODO error if rule not found
        if (rule) {
            rules.push(rule);
        }
    }
    return rules;
}

export function executeRules(fileContent: string, rules: BaseSqlRule[]) {
    const errors: SqlRuleFailure[] = [];
    const file = new ParsedSqlFile(fileContent);
    const exemptions = getExemptions(file.tokenStream);
    for (const rule of rules) {
        errors.push(...rule.apply(file, exemptions));
    }
    return errors;
}

export function executeForFile(fileContents: string, filePath: string | "") {
    const searchDir = filePath ? filePath : path.dirname(filePath);
    const config = getLintConfiguration(searchDir);
    const rules = getRules(config);
    return executeRules(fileContents, rules);
}
