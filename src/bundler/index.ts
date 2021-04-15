import { fetchPlugin } from "../plugins/fetch-plugin";
import { unpkgPathPlugin } from "../plugins/unpkg-path-plugin";

const bundler = async (rawCode: string, refCurrent: any) => {
  const executeCode = `    
const { Parser } = require("node-sql-parser");
const parser = new Parser();
const ast = parser.astify('${rawCode.trim().replace(/\n/g, " ")}');

const preview = document.querySelector('#preview');
preview.innerHTML = JSON.stringify(ast, null, 2);
`;
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

  return result.outputFiles[0].text;
};

export default bundler;
