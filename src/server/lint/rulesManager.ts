import { BaseSqlRule } from "./BaseSqlRule";
import { getExemptions } from "./getExemptions";
import { ParsedSqlFile } from "./ParsedSqlFile";
import { KeywordCasingRule } from "./rules/KeywordCasingRule";
import { SqlRuleFailure } from "./SqlRuleFailure";

const defaultRules: BaseSqlRule[] = [
    new KeywordCasingRule(),
];
export function executeRules(fileContent: string, rules: BaseSqlRule[] = defaultRules) {
    const errors: SqlRuleFailure[] = [];
    const file = new ParsedSqlFile(fileContent);
    const exemptions = getExemptions(file.tokenStream);
    for (const rule of rules) {
        errors.push(...rule.apply(file, exemptions));
    }
    return errors;
}
