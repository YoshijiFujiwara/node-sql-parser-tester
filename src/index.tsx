import "bulmaswatch/cerulean/bulmaswatch.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import * as esbuild from "esbuild-wasm";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import CodeEditor from "./components/code-editor";
import bundler from "./bundler";

const initialSQL = "SELECT id, name, created_at FROM users;";

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState(initialSQL);

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
    const executionCode = await bundler(input, ref.current);
    eval(executionCode);
  };

  return (
    <div>
      <h1 className="is-size-1">node-sql-parserでastifyするやつ</h1>
      <div className="content is-size-5">
        <ul>
          <li>
            node-sql-parserのparser.astifyしたものを、JSON.stringifyした結果を出します
          </li>
          <li>エラー処理が甘いので、SQL文を間違うと、赤い画面が出そう</li>
          <li>ブラウザで動かすためにesbuildでバンドルしてeval()してます</li>
        </ul>
      </div>
      <CodeEditor
        onChange={(val) => {
          setInput(val);
        }}
        initialValue={initialSQL}
      />
      <div>
        <button
          className="button is-rounded is-primary is-big"
          onClick={onClick}
        >
          astify
        </button>
      </div>
      <pre id="preview"></pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
