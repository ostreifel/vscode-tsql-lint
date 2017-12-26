import { IPosition } from "./ParsedSqlFile";

export class SqlRuleFailure {
    constructor(
        public readonly start: IPosition,
        public readonly end: IPosition,
        public readonly message: string,
        /** For debugging purposes */
        public readonly triggerText: string,
    ) { }
}
