import { Hono } from "https://deno.land/x/hono@v3.11.7/mod.ts";

const app = new Hono();
const kv = await Deno.openKv();

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// 1. GET: 全てのToDoを取得
app.get("/api", async (c) => {
  const iter = kv.list<Todo>({ prefix: ["todos"] });
  const todos = [];
  for await (const res of iter) {
    todos.push(res.value);
  }
  return c.json(todos);
});

// 2. POST: 新しいToDoを追加
app.post("/api", async (c) => {
  const { title } = await c.req.json<{ title: string }>();
  if (!title) return c.json({ error: "Title is required" }, 400);

  const id = Crypto.randomUUID();
  const newTodo: Todo = { id, title, completed: false };

  await kv.set(["todos", id], newTodo);
  return c.json(newTodo);
});

// 3. PUT: ToDoの更新（完了フラグの切り替えなど）
app.put("/api/:id", async (c) => {
  const id = c.req.param("id");
  const { title, completed } = await c.req.json<Partial<Todo>>();

  const res = await kv.get<Todo>(["todos", id]);
  if (!res.value) return c.json({ error: "Not found" }, 404);

  const updatedTodo = {
    ...res.value,
    title: title ?? res.value.title,
    completed: completed ?? res.value.completed,
  };
  await kv.set(["todos", id], updatedTodo);

  return c.json(updatedTodo);
});

// 4. DELETE: ToDoの削除
app.delete("/api/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["todos", id]);
  return c.json({ message: `Deleted ${id}` });
});

Deno.serve(app.fetch);
