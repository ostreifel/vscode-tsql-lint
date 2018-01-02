import { IExemption } from "../../getExemptions";
import { ParsedSqlFile } from "../../ParsedSqlFile";
import { SqlRuleContext } from "./SqlRuleContext";
import { SqlRuleFailure } from "./SqlRuleFailure";

export abstract class BaseSqlRule {
    constructor(public readonly name: string) { }
    public apply(file: ParsedSqlFile, exemptions: IExemption[]): SqlRuleFailure[] {
        const ctx = new SqlRuleContext(this.name, file, exemptions);
        this.applyContext(ctx);
        return ctx.errors;
    }
    protected abstract applyContext(ctx: SqlRuleContext): void;
}
