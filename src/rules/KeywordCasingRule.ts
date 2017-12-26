import { ParseTree } from "antlr4ts/tree/ParseTree";
import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ConstantContext, IdContext } from "../../generated/TSqlParser";
import { BaseRuleWalker } from "../BaseRuleWalker";
import { BaseSqlRule } from "../BaseSqlRule";
import { SqlRuleContext } from "../SqlRuleContext";

export class KeywordCasingRule extends BaseSqlRule {
    constructor() {
        super("KeywordCasing");
    }
    protected applyContext(ctx: SqlRuleContext): void {
        new class extends BaseRuleWalker {
            public visitTerminal(node: TerminalNode): void {
                const symbol = node.symbol;
                const text = ctx.text(symbol);
                if (text.toLocaleUpperCase() !== text) {
                    ctx.addError(symbol.startIndex, symbol.stopIndex, "Keywords must be uppercase");
                }
            }
            public visitChildren(tree: RuleNode): void {
                if (tree instanceof ConstantContext) {
                    return;
                }
                if (tree instanceof IdContext) {
                    return;
                }
                super.visitChildren(tree);
            }
        }().visit(ctx.file);
    }
}
