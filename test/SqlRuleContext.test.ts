import * as assert from "assert";
import { ParsedSqlFile } from "../src/ParsedSqlFile";
import { SqlRuleContext } from "../src/SqlRuleContext";

describe("SqlRuleContext", () => {
    it("error index", () => {
        const file = new ParsedSqlFile("select 1");
        const context = new SqlRuleContext(file);
        context.addError(0, 3, "test");
        assert.equal(context.errors.length, 1);
        const [{ start, end, triggerText}] = context.errors;
        assert.equal(start.line, 0, "start row");
        assert.equal(start.column, 0, "start column");
        assert.equal(end.line, 0, "end row");
        assert.equal(end.column, 4, "end column");
        assert.equal(triggerText, "sele");
    });
});
