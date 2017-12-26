import * as assert from "assert";
import { ParsedSqlFile } from "../../src/ParsedSqlFile";
import { KeywordCasingRule } from "../../src/rules/KeywordCasingRule";

describe("KeywordCasingRule", () => {
    it("select * from a where b", () => {
        const sql = `
                select
                    name
                from
                    products
                where
                    id = 21
                    and name <> "sample"
            `;
        const file = new ParsedSqlFile(sql);
        const rule = new KeywordCasingRule();
        const failures = rule.apply(file).map((f) => f.triggerText);
        assert.deepEqual(["select", "from", "where", "and"], failures);
    });
});
