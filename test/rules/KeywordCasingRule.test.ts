import * as assert from 'assert';
import * as mocha from 'mocha';
import { parseSql } from './RuleTestUtils';
import { KeywordCasingRule } from '../../src/rules/KeywordCasingRule';

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
    const failures = rule.apply(sql, file).map(f => f.triggerText);
    assert.deepEqual(["select", "from", "where", "and"], failures);
});