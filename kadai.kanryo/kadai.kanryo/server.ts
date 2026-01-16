import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { serveStatic } from "jsr:@hono/hono/deno";

const app = new Hono();

// KVデータベースの初期化（awaitなしで定義するのが一般的です）
const kv = await Deno.openKv();

// 1. CORSを許可
app.use("/*", cors());

// 2. 静的ファイルの配信
// エラー回避のため、まず index.html があるか確認して配信します
app.get("/", serveStatic({ path: "./kadai.kanryo/index.html" }));
// CSSや画像などのためのルート設定
app.get("/*", serveStatic({ root: "./kadai.kanryo" }));

// 3. API（Todoリストの取得など）
app.get("/todos", async (c) => {
  try {
    const iter = kv.list({ prefix: ["todos"] });
    const todos = [];
    for await (const res of iter) {
      todos.push(res.value);
    }
    return c.json(todos);
  } catch (e) {
    return c.json({ error: "KV Error" }, 500);
  }
});

// GET: 取得
app.get("/todos", async (c) => {
  const iter = kv.list({ prefix: ["todos"] });
  const todos = [];
  for await (const res of iter) todos.push(res.value);
  return c.json(todos);
});

// POST: 追加
app.post("/todos", async (c) => {
  const body = await c.req.json();
  const id = `task-${Date.now()}`;
  const newTodo = { id, text: body.text, date: body.date, completed: false };
  await kv.set(["todos", id], newTodo);
  return c.json(newTodo);
});

// PUT: 更新 (ここが完了ボタンの正体)
app.put("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await kv.get(["todos", id]);
  if (!res.value) return c.json({ error: "Not Found" }, 404);

  // 既存のデータに、新しい完了ステータスを上書き
  const updated = { ...res.value, completed: body.completed };
  await kv.set(["todos", id], updated);
  return c.json(updated);
});

// DELETE: 削除
app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["todos", id]);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
