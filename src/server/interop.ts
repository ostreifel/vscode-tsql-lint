import * as edge from "edge";

export function lintContents(fileContents: string) {
    const options: edge.Options = {
        source: "./interop/FileLinter.cs",
        typeName: "FileLinter",
        methodName: "Lint",
        references: [
            "./node_modules/tsqllint/win-x64/TSQLLint.Common.dll",
            "./node_modules/tsqllint/win-x64/TSQLLint.Lib.dll",
        ],
    };
    const lintFileContents = edge.func<string, string[]>(options);
    console.log(lintFileContents(fileContents, true));
}
