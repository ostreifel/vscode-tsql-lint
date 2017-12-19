const antlr4 = require("antlr4");
const TSqlLexer = require("../generated/TSqlLexer");
const TSqlParser = require("../generated/TSqlParser");


var input = 
"SELECT 1";
var chars = new antlr4.InputStream(input);
var lexer = new TSqlLexer.TSqlLexer(chars);
var tokens  = new antlr4.CommonTokenStream(lexer);
var parser = new TSqlParser.TSqlParser(tokens);
parser.buildParseTrees = true;
var tree = parser.tsql_file();

console.log(tree);