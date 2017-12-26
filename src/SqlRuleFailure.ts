export class SqlRuleFailure {
    constructor(
        public readonly start: number,
        public readonly end: number,
        public readonly message: string,
        /** For debugging purposes */
        public readonly triggerText: string,
    ) { }
}
