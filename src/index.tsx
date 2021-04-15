import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import CodeEditor from "./components/code-editor";

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState("");

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async () => {
    if (!ref.current) {
      return;
    }

    const executeCode = `    
const { Parser } = require("node-sql-parser");
const parser = new Parser();
const ast = parser.astify('${input}');

const preview = document.querySelector('#preview');
preview.innerHTML = JSON.stringify(ast);
`;

    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(executeCode)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    eval(result.outputFiles[0].text);
  };

  return (
    <div>
      <CodeEditor initialValue="SELECT id, name, created_at FROM users;" />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre id="preview"></pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
