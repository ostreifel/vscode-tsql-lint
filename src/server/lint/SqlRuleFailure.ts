import { IPosition, ParsedSqlFile } from "./ParsedSqlFile";
import { Replacement } from "./Replacement";

export class SqlRuleFailure {
    public readonly startPos: IPosition;
    public readonly endPos: IPosition;
    /** For debugging purposes */
    public readonly triggerText: string;
    constructor(
        public readonly ruleName: string,
        private readonly file: ParsedSqlFile,
        public readonly start: number,
        public readonly end: number,
        public readonly message: string,
        public readonly fix?: Replacement[],
    ) {
        this.startPos = this.file.toPosition(start);
        this.endPos = this.file.toPosition(end);
        this.triggerText = this.file.contents.substring(start, end + 1);
    }
}
