import * as assert from "assert";
import { KeywordCasingRule } from "../../src/rules/KeywordCasingRule";
import { parseSql } from "./RuleTestUtils";

it("KeywordCasingRule", () => {
    const sql = `
            select
                name
            from
                products
            where
                id = 21
                and name <> "sample"
        `;
    const file = parseSql(sql);
    const rule = new KeywordCasingRule();
    const failures = rule.apply(sql, file).map((f) => f.triggerText);
    assert.deepEqual(["select", "from", "where", "and"], failures);
});
