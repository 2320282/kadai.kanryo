const API_URL = "http://localhost:8000/todos";

const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("cancel-btn");
const addBtn = document.getElementById("add-btn");
const modal = document.getElementById("modal-overlay");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const todoList = document.getElementById("todo-list");
const todayList = document.getElementById("today-list");

// --- 初期データ取得 ---
window.addEventListener("DOMContentLoaded", fetchTodos);

async function fetchTodos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("サーバーに接続できません");
    const data = await response.json();

    todoList.innerHTML = "";
    todayList.innerHTML = "";
    data.forEach((task) => renderTask(task));
  } catch (err) {
    console.error("データ取得エラー:", err);
  }
}

// --- 描画処理 ---
function renderTask(task) {
  const todayStr = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

  // 要素を作成
  const liAll = createTaskElement(task);
  todoList.appendChild(liAll);

  if (task.date === todayStr) {
    const liToday = createTaskElement(task);
    todayList.appendChild(liToday);
  }
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.setAttribute("data-id", task.id);
  if (task.completed) li.classList.add("completed");

  // HTMLを作成
  li.innerHTML = `
    <button class="complete-btn">${
      task.completed ? "● 完了" : "○ 未完了"
    }</button>
    <div class="task-info">
      <span class="task-text">${task.text}</span>
      <span class="due-date">${
        task.date ? "期限: " + task.date : "期限なし"
      }</span>
    </div>
    <button class="delete-btn">削除</button>
  `;

  // --- ここが重要！直接関数を割り当てる ---
  const compBtn = li.querySelector(".complete-btn");
  const delBtn = li.querySelector(".delete-btn");

  compBtn.onclick = async () => {
    console.log("完了ボタンが押されました:", task.id);
    await updateTask(task.id, !task.completed);
  };

  delBtn.onclick = async () => {
    console.log("削除ボタンが押されました:", task.id);
    await deleteTask(task.id);
  };

  return li;
}

// --- API 通信処理 (各メソッド) ---

async function addTask() {
  const text = input.value.trim();
  const date = dateInput.value;
  if (!text) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, date }),
  });

  hideModal();
  fetchTodos();
}

async function updateTask(id, newStatus) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: newStatus }),
  });
  fetchTodos(); // サーバーの最新状態を反映
}

async function deleteTask(id) {
  if (!confirm("本当に削除しますか？")) return;
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  fetchTodos();
}

// --- モーダル制御 ---
openModalBtn.onclick = () => {
  modal.style.display = "flex";
  input.focus();
};
function hideModal() {
  modal.style.display = "none";
  input.value = "";
  dateInput.value = "";
}
closeModalBtn.onclick = hideModal;
addBtn.onclick = addTask;
