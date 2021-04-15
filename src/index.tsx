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
  const [input, setInput] = useState<string>(initialSQL);
  const [isLoading, setLoading] = useState<boolean>(false);

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
    setLoading(true);

    const executionCode = await bundler(input, ref.current);
    eval(executionCode);
    setLoading(false);
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
          <li>なので、動きそうなJSとか書いちゃダメです。SQL文のみ頼みます</li>
          <li>
            SQL文章例
            <ul>
              <li>SELECT * FROM hoge WHERE id = 3;</li>
              <li>INSERT INTO syain VALUES (1,'鈴木','suzuki');</li>
              <li>
                UPDATE dept SET dname = '技術部', loc = '福岡' WHERE deptno =
                80;
              </li>
              <li>DELETE FROM dept WHERE deptno = 80;</li>
              <li>
                SELECT id_c, AVG(quantity), ( SELECT AVG(quantity) FROM
                purchase) FROM purchase GROUP BY id_c;
              </li>
              <li>
                SELECT id_p, fullname FROM purchase JOIN customer ON
                purchase.id_c=customer.id_c;
              </li>
              <li>create table mybook ( id integer );</li>
              <li>drop table users;</li>
            </ul>
          </li>
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
          disabled={isLoading}
        >
          astify
        </button>
        {isLoading && <p> 実行中...</p>}
      </div>
      <pre id="preview"></pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
