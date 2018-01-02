import { ANTLRInputStream, CommonTokenStream, Token } from "antlr4ts";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import * as assert from "assert";
import { TSqlLexer } from "../../generated/TSqlLexer";
import { ParsedSqlFile } from "../../src/server/lint/ParsedSqlFile";
import { BaseSqlRule } from "../../src/server/lint/rules/common/BaseSqlRule";
import { KeywordCasingRule } from "../../src/server/lint/rules/KeywordCasingRule";
import { executeRules } from "../../src/server/lint/rulesManager";

describe("KeywordCasingRule", () => {
    const rules: BaseSqlRule[] = [new KeywordCasingRule()];
    it("select", () => {
        const sql = `
                select
                    name
                from
                    products
                where
                    id = 21
                    and name <> 'sample'
            `;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual(["select", "from", "where", "and"], failures);
    });
    it("@var", () => {
        const sql = "declare @variable1 cursor;";
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual(["declare", "cursor"], failures);
    });
    it("string", () => {
        const sql = `CREATE LOGIN TestLogin
        WITH PASSWORD = 'SuperSecret52&&', SID = 0x241C11948AEEB749B0D22646DB1A19F2;`;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual([], failures);
    });
    it("varchar type", () => {
        const sql = `
            CREATE TABLE T1 (
                column_1 int,
                column_2 varchar(30)
            );
        `;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual(["int", "varchar"], failures);
    });
    it("datatypes", () => {
        const sql = `
            CREATE TABLE T1 (
                rowguid uniqueidentifier,
                LineTotal money NOT NULL
            );
        `;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual(["uniqueidentifier", "money"], failures);

    });
    it("special ids", () => {
        const sql = `SELECT "quoted", [bracketed], p.Id FROM products p`;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual([], failures);
    });
    it('"default"', () => {
        const sql = `CREATE WORKLOAD GROUP newReports
        USING "default" ;`;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual([], failures);
    });
    it("address", () => {
        const sql = `CREATE NONCLUSTERED INDEX IX_Address_PostalCode
        ON Person.Address (PostalCode)  `;
        const failures = executeRules(sql, rules).map((f) => f.triggerText);
        assert.deepEqual([], failures);
    });
});
