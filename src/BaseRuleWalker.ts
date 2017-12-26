import { Token } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

export abstract class BaseRuleWalker extends AbstractParseTreeVisitor<void> {
    protected defaultResult(): void {
        return undefined;
    }
}
