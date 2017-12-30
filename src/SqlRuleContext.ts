import { Token } from "antlr4ts";
import { ParsedSqlFile } from "./ParsedSqlFile";
import { Replacement } from "./Replacement";
import { SqlRuleFailure } from "./SqlRuleFailure";

export class SqlRuleContext {
    public readonly errors: SqlRuleFailure[] = [];
    constructor(
        public readonly file: ParsedSqlFile,
        public readonly ruleName: string,
    ) { }
    /**
     * Use this to get the orignal casing of the text.
     * Grammars were written for upper case only so all tokens have uppercase
     * versions of the original text
     */
    public text(token: Token) {
        return this.file.contents.substring(token.startIndex, token.stopIndex + 1);
    }
    public addError(start: number, end: number, message: string, fix: Replacement[]) {
        this.errors.push(new SqlRuleFailure(this.ruleName, this.file, start, end, message, fix));
    }
}
