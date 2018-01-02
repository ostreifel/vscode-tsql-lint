import { ParserRuleContext, Token } from "antlr4ts";

export class Replacement {
    public static applyAll(content: string, replacements: Replacement[]) {
        // sort in reverse so that diffs are properly applied
        replacements.sort((a, b) => b.end !== a.end ? b.end - a.end : b.start - a.start);
        return replacements.reduce((text, r) => r.apply(text), content);
    }

    public static replace(node: ParserRuleContext | Token, text: string): Replacement {
        if (node instanceof ParserRuleContext) {
            const {startIndex} = node.start;
            const {stopIndex} = node.stop || node.start;
            return this.replaceFromTo(startIndex, stopIndex, text);
        }
        return this.replaceFromTo(node.startIndex, node.stopIndex + 1, text);
    }

    public static replaceFromTo(start: number, end: number, text: string) {
        return new Replacement(start, end - start, text);
    }

    public static deleteText(start: number, length: number) {
        return new Replacement(start, length, "");
    }

    public static deleteFromTo(start: number, end: number) {
        return new Replacement(start, end - start, "");
    }

    public static appendText(start: number, text: string) {
        return new Replacement(start, 0, text);
    }

    constructor(readonly start: number, readonly length: number, readonly text: string) {}

    get end() {
        return this.start + this.length;
    }

    public apply(content: string) {
        return content.substring(0, this.start) + this.text + content.substring(this.start + this.length);
    }
}
