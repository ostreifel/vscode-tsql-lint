import { Tsql_fileContext } from "../generated/TSqlParser";
import { SqlRuleContext } from "./SqlRuleContext";
import { SqlRuleFailure } from "./SqlRuleFailure";

export abstract class BaseSqlRule {
    constructor(public readonly name) { }
    public apply(orignalFileText: string, file: Tsql_fileContext): SqlRuleFailure[] {
        const ctx = new SqlRuleContext(orignalFileText, file);
        this.applyContext(ctx);
        return ctx.errors;
    }
    protected abstract applyContext(ctx: SqlRuleContext): void;
}
