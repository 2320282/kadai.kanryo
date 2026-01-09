import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.0.0/middleware.ts";

export const app = new Hono();
const kv = await Deno.openKv();

app.use("/*", cors());

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
