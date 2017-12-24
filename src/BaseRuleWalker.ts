import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { Token } from "antlr4ts";

export abstract class BaseRuleWalker extends AbstractParseTreeVisitor<void> {
    protected defaultResult(): void {
        return undefined;
    }
}