export class SqlRuleFailure {
    constructor(
        private readonly start: number,
        private readonly end: number,
        private readonly message: string,
        /** For debugging purposes */
        private readonly triggerText: string,
    ) { }
}