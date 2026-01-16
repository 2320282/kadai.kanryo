import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors"; // もし無ければ追加
import { serveStatic } from "jsr:@hono/hono/deno";

export const app = new Hono();
const kv = await Deno.openKv();

// --- 省略 (importやappの定義) ---

// 1. CORSの設定
app.use("/*", cors());

// 2. 静的ファイルの設定
// index.html が kadai.kanryo/index.html にある場合
app.get("/", serveStatic({ path: "./kadai.kanryo/index.html" }));

// CSSなどの他のファイルを kadai.kanryo フォルダ全体から探す設定
app.get("/*", serveStatic({ root: "./kadai.kanryo" }));

// --- 省略 (app.get("/todos") など) ---
// --- 以下、既存の app.get("/todos", ...) などの処理 ---

app.get("/todos", async (c) => {
  // ... (略)
});

// 最後はこの行で終わる
Deno.serve(app.fetch);
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
