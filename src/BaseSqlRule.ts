import { ParsedSqlFile } from "./ParsedSqlFile";
import { SqlRuleContext } from "./SqlRuleContext";
import { SqlRuleFailure } from "./SqlRuleFailure";

export abstract class BaseSqlRule {
    constructor(public readonly name: string) { }
    public apply(file: ParsedSqlFile): SqlRuleFailure[] {
        const ctx = new SqlRuleContext(file, this.name);
        this.applyContext(ctx);
        return ctx.errors;
    }
    protected abstract applyContext(ctx: SqlRuleContext): void;
}
