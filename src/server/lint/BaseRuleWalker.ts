import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";

export abstract class BaseRuleWalker extends AbstractParseTreeVisitor<void> {
    protected defaultResult(): void {
        return undefined;
    }
}
