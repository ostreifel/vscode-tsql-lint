import { BaseSqlRule } from "./BaseSqlRule";
import { ParsedSqlFile } from "./ParsedSqlFile";
import { KeywordCasingRule } from "./rules/KeywordCasingRule";
import { SqlRuleFailure } from "./SqlRuleFailure";

const rules: BaseSqlRule[] = [
    new KeywordCasingRule(),
];
export function getErrors(fileContent: string) {
    const errors: SqlRuleFailure[] = [];
    const file = new ParsedSqlFile(fileContent);
    for (const rule of rules) {
        errors.push(...rule.apply(file));
    }
    return errors;
}
