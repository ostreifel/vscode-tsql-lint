import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Data_typeContext, TSqlParser } from "../../generated/TSqlParser";
import { BaseRuleWalker } from "../BaseRuleWalker";
import { BaseSqlRule } from "../BaseSqlRule";
import { SqlRuleContext } from "../SqlRuleContext";

export class KeywordCasingRule extends BaseSqlRule {
    private static readonly notKeyWords: number[] = [
        TSqlParser.LOCAL_ID,
        TSqlParser.ID,
        TSqlParser.DOUBLE_QUOTE_ID,
        TSqlParser.SQUARE_BRACKET_ID,
        TSqlParser.BINARY,
        TSqlParser.BINARY_BASE64,
        TSqlParser.BINARY_CHECKSUM,
        TSqlParser.FLOAT,
        TSqlParser.STRING,
        TSqlParser.QUOTED_URL,
        TSqlParser.QUOTED_HOST_AND_PORT,
        TSqlParser.IPV4_ADDR,
        TSqlParser.IPV6_ADDR,
        TSqlParser.NAME,
    ];
    constructor() {
        super("KeywordCasing");
    }
    protected applyContext(ctx: SqlRuleContext): void {
        let isDataType = false;
        new class extends BaseRuleWalker {
            public visitTerminal(node: TerminalNode): void {
                const symbol = node.symbol;
                if (
                    !isDataType &&
                    KeywordCasingRule.notKeyWords.indexOf(symbol.type) >= 0
                ) {
                    return;
                }
                const text = ctx.text(symbol);
                if (text.toLocaleUpperCase() !== text) {
                    ctx.addError(symbol.startIndex, symbol.stopIndex, `Keywords must be uppercase ${symbol.type}`);
                }
            }
            public visitChildren(tree: RuleNode): void {
                const prevIsDataType = isDataType;
                if (tree instanceof Data_typeContext) {
                    isDataType = true;
                }
                super.visitChildren(tree);
                isDataType = prevIsDataType;
            }
        }().visit(ctx.file.node);
    }
}
