import { Token } from "antlr4ts";
import { IExemption } from "../../getExemptions";
import { ParsedSqlFile } from "../../ParsedSqlFile";
import { Replacement } from "../../Replacement";
import { SqlRuleFailure } from "./SqlRuleFailure";

export class SqlRuleContext {
    public readonly errors: SqlRuleFailure[] = [];
    private exemptions: IExemption[];
    constructor(
        public readonly ruleName: string,
        public readonly file: ParsedSqlFile,
        exemptions: IExemption[],
    ) {
        this.exemptions = exemptions.filter((e) => !e.ruleName || e.ruleName === ruleName.toLocaleUpperCase());
    }
    /**
     * Use this to get the orignal casing of the text.
     * Grammars were written for upper case only so all tokens have uppercase
     * versions of the original text
     */
    public text(token: Token) {
        return this.file.contents.substring(token.startIndex, token.stopIndex + 1);
    }
    public addError(start: number, stop: number, message: string, fix: Replacement[]) {
        if (this.isIgnored(start, stop)) {
            return;
        }
        this.errors.push(new SqlRuleFailure(this.ruleName, this.file, start, stop, message, fix));
    }
    private isIgnored(start: number, stop: number) {
        return this.exemptions.some((e) => e.startChar < start && e.stopChar > stop);
    }
}
