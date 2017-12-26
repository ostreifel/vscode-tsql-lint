import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { TSqlLexer } from "../../generated/TSqlLexer";
import { TSqlParser } from "../../generated/TSqlParser";

export function parseSql(sql: string) {
    const upperInput = sql.toLocaleUpperCase();
    // Create the lexer and parser
    const inputStream = new ANTLRInputStream(upperInput);
    const lexer = new TSqlLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new TSqlParser(tokenStream);

    // Parse the input, where `compilationUnit` is whatever entry point you defined
    const file = parser.tsql_file();
    return file;
}
