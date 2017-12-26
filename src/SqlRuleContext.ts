import { Token } from "antlr4ts";
import { Tsql_fileContext } from "../generated/TSqlParser";
import { SqlRuleFailure } from "./SqlRuleFailure";

export class SqlRuleContext {
    public readonly errors: SqlRuleFailure[] = [];
    constructor(
        public readonly originalFileText: string,
        public readonly file: Tsql_fileContext,
    ) { }
    /**
     * Use this to get the orignal casing of the text.
     * Grammars were written for upper case only so all tokens have uppercase
     * versions of the original text
     */
    public text(token: Token) {
        return this.originalFileText.substring(token.startIndex, token.stopIndex + 1);
    }
    public addError(start: number, end: number, message: string) {
        const text = this.originalFileText.substring(start, end + 1);
        this.errors.push(new SqlRuleFailure(start, end, message, text));
    }
}
