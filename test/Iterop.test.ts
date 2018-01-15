import * as assert from "assert";
import { lintContents } from "../src/server/interop";
describe("SqlRuleContext", () => {
    it("error index", () => {
        lintContents("sadf");
        // assert.equal(triggerText, "sele");
    });
});
