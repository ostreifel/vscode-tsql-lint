import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { TSqlLexer } from "../generated/TSqlLexer";
import { Tsql_fileContext, TSqlParser } from "../generated/TSqlParser";
export interface IPosition {
    line: number;
    column: number;
}
interface ILine {
    startCharIdx: number;
}
export class ParsedSqlFile {
    public readonly node: Tsql_fileContext;
    private readonly lines: ILine[];
    constructor(readonly contents: string) {
        const upperInput = contents.toLocaleUpperCase();
        // Create the lexer and parser
        const inputStream = new ANTLRInputStream(upperInput);
        const lexer = new TSqlLexer(inputStream);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new TSqlParser(tokenStream);

        // Parse the input, where `compilationUnit` is whatever entry point you defined
        this.node = parser.tsql_file();

        function getLines(): ILine[] {
            const lines: ILine[] = [];
            const lineTexts = contents.split(/\n/g);
            let start = 0;
            for (const line of lineTexts) {
                lines.push({startCharIdx: start});
                start += line.length + 1;
            }
            return lines;
        }
        this.lines = getLines();
    }
    public toPosition(charIndex: number): IPosition {
        const compareToLine = (testIdx: number, testLineNum: number): number => {
            const line = this.lines[testLineNum];
            const nextLine = this.lines[testLineNum + 1];
            if (testIdx < line.startCharIdx) {
                return -1;
            }
            if (nextLine && nextLine.startCharIdx < testIdx) {
                return 1;
            }
            return 0;
        };
        let left = 0;
        let right = this.lines.length - 1;
        let lineIdx: number;
        let compareVal: number;
        do {
            if (left > right) {
                throw new Error(`Cannot get position for char index ${charIndex}`);
            }
            lineIdx = Math.floor((left + right) / 2);
            compareVal = compareToLine(charIndex, lineIdx);
            if (compareVal < 0) {
                right = lineIdx - 1;
            } else if (compareVal > 0) {
                left = lineIdx + 1;
            }
        } while (compareVal !== 0);
        const column = charIndex - this.lines[lineIdx].startCharIdx;
        return {column, line: lineIdx};
    }
}
