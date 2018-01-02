import { CommonTokenStream, Token } from "antlr4ts";
import { TSqlParser } from "../../../generated/TSqlParser";

export interface IExemption {
    startChar: number;
    stopChar: number;
    /** Uppercase */
    ruleName?: string;
}

function getComments(tokenStream: CommonTokenStream): Token[] {
    const comments: Token[] = [];
    for (let i = 0; i < tokenStream.size; i++) {
        const token = tokenStream.get(i);
        if (token.channel === Token.HIDDEN_CHANNEL && token.type === TSqlParser.COMMENT) {
            comments.push(token);
        }
    }
    return comments;
}

export function getExemptions(tokenStream: CommonTokenStream): IExemption[] {
    const exemptions: IExemption[] = [];
    const comments = getComments(tokenStream);
    const currentState: {[ruleName: string]: IExemption} = {};
    for (const comment of comments) {
        if (!comment.text) {
            continue;
        }
        const match = comment.text.trim().match(/^\/\*\s*tsqllint-(enable|disable)(?:\s+([\w\-]+))?\s*\*\/$/i);
        if (!match) {
            continue;
        }
        const enabled = match[1] === "ENABLE";
        const ruleName = match[2];
        if (!enabled) {
            const exemption: IExemption = {
                ruleName,
                startChar: comment.startIndex,
                stopChar: Infinity,
            };
            currentState[ruleName] = exemption;
            exemptions.push(exemption);
        } else if (currentState[ruleName]) {
            currentState[ruleName].stopChar = comment.stopIndex;
        }
    }
    return exemptions;
}
