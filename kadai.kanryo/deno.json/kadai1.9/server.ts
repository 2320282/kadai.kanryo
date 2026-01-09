import { Hono } from "https://deno.land/x/hono@v4.0.0/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.0.0/middleware.ts";

const app = new Hono();
const kv = await Deno.openKv();

app.use("/*", cors());

interface Todo {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

// GET
app.get("/todos", async (c) => {
  const iter = kv.list<Todo>({ prefix: ["todos"] });
  const todos = [];
  for await (const res of iter) {
    todos.push(res.value);
  }
  return c.json(todos);
});

// POST
app.post("/todos", async (c) => {
  const body = await c.req.json();
  const id = `task-${Date.now()}`;
  const newTodo: Todo = {
    id,
    text: body.text,
    date: body.date,
    completed: false,
  };
  await kv.set(["todos", id], newTodo);
  return c.json(newTodo, 201);
});

// PUT
app.put("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const res = await kv.get<Todo>(["todos", id]);
  if (!res.value) return c.json({ error: "Not Found" }, 404);

  const updatedTodo = { ...res.value, ...body };
  await kv.set(["todos", id], updatedTodo);
  return c.json(updatedTodo);
});

// DELETE
app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  await kv.delete(["todos", id]);
  return c.json({ success: true });
});

// ⭐ 最後に1回だけ
Deno.serve(app.fetch);
