import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";

const app = new Hono();
const kv = await Deno.openKv();

// --- 1. 手動でCORSを設定（モジュール不要） ---
app.use("*", async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
});

// --- 2. 確実にファイルを探す設定 ---
// 修正後：CSSフォルダの中のindex.htmlを指定する
app.get("/", serveStatic({ path: "./index.html" }));
app.get("/*", serveStatic({ root: "./" }));
app.get("/todos", async (c) => {
  const iter = kv.list({ prefix: ["todos"] });
  const todos = [];
  for await (const res of iter) todos.push(res.value);
  return c.json(todos);
});

app.post("/todos", async (c) => {
  const body = await c.req.json();
  const id = `task-${Date.now()}`;
  const newTodo = { id, text: body.text, date: body.date, completed: false };
  await kv.set(["todos", id], newTodo);
  return c.json(newTodo);
});

app.put("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await kv.get(["todos", id]);
  if (!res.value) return c.json({ error: "Not Found" }, 404);
  const updated = { ...(res.value as object), completed: body.completed };
  await kv.set(["todos", id], updated);
  return c.json(updated);
});

app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["todos", id]);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
