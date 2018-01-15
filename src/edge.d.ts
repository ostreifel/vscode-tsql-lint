declare module 'edge' {
    function func<TInput, TOutput>(language: Language, options: Options): Func<TInput, TOutput>
    function func<TInput, TOutput>(options: Options): Func<TInput, TOutput>
    type SourceFile = string;
    type DLLFile = string;
    type SourceCode = string
    type Options = SourceFile | SourceCode | DLLFile | Function | Params;
    type Language = "cs" | string;
    type Params = {
      references?: string[];
      typeName?: string;
    } & (
      {
        assemblyFile: string;
        methodName?: string;
      } |
      {
        source: string | Function;
      }
    );
    interface Func<TInput, TOutput> {
      (payload: TInput, callback: (error: Error, result: TOutput) => void): void;
      (payload: TInput, sync: true): TOutput;
    }
  }