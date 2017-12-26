import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ConstantContext, IdContext, TSqlParser } from "../../generated/TSqlParser";
import { BaseRuleWalker } from "../BaseRuleWalker";
import { BaseSqlRule } from "../BaseSqlRule";
import { SqlRuleContext } from "../SqlRuleContext";

export class KeywordCasingRule extends BaseSqlRule {
    private static readonly notKeyWords: number[] = [
        TSqlParser.LOCAL_ID,
        TSqlParser.BINARY,
        TSqlParser.BINARY_BASE64,
        TSqlParser.BINARY_CHECKSUM,
        TSqlParser.FLOAT,
        TSqlParser.STRING,
        TSqlParser.QUOTED_URL,
        TSqlParser.QUOTED_HOST_AND_PORT,
    ];
    constructor() {
        super("KeywordCasing");
    }
    protected applyContext(ctx: SqlRuleContext): void {
        new class extends BaseRuleWalker {
            public visitTerminal(node: TerminalNode): void {
                const symbol = node.symbol;
                if (
                    KeywordCasingRule.notKeyWords.indexOf(symbol.type) >= 0
                ) {
                    return;
                }
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
        }().visit(ctx.file.node);
    }
}
