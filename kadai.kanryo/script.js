const todoInput = document.getElementById("todo-input");
const todoDate = document.getElementById("todo-date");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const todayList = document.getElementById("today-list");

// 重要：URLを /todos だけにする（localhostを書かない）
const API_URL = "/todos";

// タスク読み込み
async function loadTodos() {
  const res = await fetch(API_URL);
  const todos = await res.json();
  renderTodos(todos);
}

// タスク追加
addBtn.addEventListener("click", async () => {
  const text = todoInput.value;
  const date = todoDate.value;
  if (!text) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date }),
  });

  todoInput.value = "";
  loadTodos();
  // モダルを閉じる処理などがあればここに追加
  document.getElementById("modal-overlay").classList.remove("active");
});

// タスク完了（更新）
async function toggleTodo(id, completed) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  loadTodos();
}

// タスク表示（一部省略、あなたのコードに合わせて調整してください）
function renderTodos(todos) {
  todoList.innerHTML = "";
  todayList.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} onchange="toggleTodo('${todo.id}', this.checked)">
      <span>${todo.text} (${todo.date})</span>
    `;

    if (todo.date === today) {
      todayList.appendChild(li);
    } else {
      todoList.appendChild(li);
    }
  });
}

loadTodos();
