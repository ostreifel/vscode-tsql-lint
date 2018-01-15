using System;
using System.Threading.Tasks;
using TSQLLint.Lib.Parser;
using TSQLLint.Lib.Utility;

namespace Interop
{
    public class FileLinter
    {
        public async Task<object> Lint(string fileContents)
        {
            var sqlStream = ParsingUtility.GenerateStreamFromString("SELECT id FROM tbl_1");
            return new
            {
                errors = new string[]
                {
                    "File length " + fileContents.Length
                }
            };
        }
    }
}
