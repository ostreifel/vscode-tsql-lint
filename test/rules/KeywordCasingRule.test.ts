import * as assert from 'assert';
import { parseSql } from './RuleTestUtils';
import { KeywordCasingRule } from '../../src/rules/KeywordCasingRule';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Keywoard Casing", () => {
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
    test("Keywoard Casing2", () => {
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
});