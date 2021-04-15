import { fetchPlugin } from "../plugins/fetch-plugin";
import { unpkgPathPlugin } from "../plugins/unpkg-path-plugin";

const bundler = async (rawCode: string, refCurrent: any) => {
  const escaped = rawCode
    .trim()
    .replace(/\n/g, " ")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  const executeCode = `    
const { Parser } = require("node-sql-parser");
const parser = new Parser();
const ast = parser.astify('${escaped}');

const preview = document.querySelector('#preview');
preview.innerHTML = JSON.stringify(ast, null, 4);
`;
  try {
    const result = await refCurrent.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(executeCode)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    return {
      code: result.outputFiles[0].text,
      error: false,
    };
  } catch (err) {
    return {
      code: "なんかエラー",
      error: true,
    };
  }
};

export default bundler;
