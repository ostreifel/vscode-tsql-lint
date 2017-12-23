import { TSqlParser } from "../generated/TSqlParser";
import { TSqlLexer } from "../generated/TSqlLexer";

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';

const input = "SELECT * FROM work".toLocaleUpperCase();
// Create the lexer and parser
const inputStream = new ANTLRInputStream(input);
const lexer = new TSqlLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new TSqlParser(tokenStream);

// Parse the input, where `compilationUnit` is whatever entry point you defined
const result = parser.tsql_file();

result.accept(())
console.log(result);
