import * as assert from "assert";
import { BaseSqlRule } from "../../src/server/lint/BaseSqlRule";
import { getExemptions, IExemption } from "../../src/server/lint/getExemptions";
import { ParsedSqlFile } from "../../src/server/lint/ParsedSqlFile";
import { KeywordCasingRule } from "../../src/server/lint/rules/KeywordCasingRule";
import { executeRules } from "../../src/server/lint/rulesManager";

describe("Parse Exemptions", () => {
    it ("Indicies", () => {
        const sql = "/*tsqllint-disable*//*tsqllint-enable*/";
        const tokens = new ParsedSqlFile(sql).tokenStream;
        const exemptions = getExemptions(tokens);
        assert.deepEqual(exemptions, [{ruleName: undefined, startChar: 0, stopChar: sql.length - 1} as IExemption]);
    });
    it ("Multiple", () => {
        const sql = `
        /*tsqllint-disable    rule1*/
        /*  tsqllint-enable rule1*/
        /*tsqllint-disable  */
        /*tsqllint-enable*/
        `;
        const tokens = new ParsedSqlFile(sql).tokenStream;
        const exemptions = getExemptions(tokens).map((e) => e.ruleName);
        assert.deepEqual(exemptions, ["RULE1", undefined]);
    });
});

describe("Disable Rule", () => {
    const rules: BaseSqlRule[] = [new KeywordCasingRule()];
    it("single rule", () => {
        const sql = `
                /*tsqllint-disable rule-that-dosnt-exist*/
                select
                /*tsqllint-enable rule-that-dosnt-exist*/
                    name
                /*tsqllint-disable keyword-capitalization*/
                from
                    products
                where
                /* tsqllint-enable keyword-capitalization*/
                    id = 21
                    and name <> 'sample'
            `;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual(["select", "and"], failures);
    });
});
