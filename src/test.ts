import { TSqlParser } from "../generated/TSqlParser";
import { TSqlLexer } from "../generated/TSqlLexer";

import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { KeywordCasingRule } from "./rules/KeywordCasingRule";

const input = "select * from work";
const upperInput = input.toLocaleUpperCase();
// Create the lexer and parser
const inputStream = new ANTLRInputStream(upperInput);
const lexer = new TSqlLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new TSqlParser(tokenStream);

// Parse the input, where `compilationUnit` is whatever entry point you defined
const file = parser.tsql_file();

const rule = new KeywordCasingRule();
const errors = rule.apply(input, file);
console.log(errors);
