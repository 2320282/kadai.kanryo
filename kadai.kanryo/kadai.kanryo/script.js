const API_URL = "http://localhost:8000/todos";

// 描画関数
// script.js内
function renderTask(task) {
  const li = document.createElement("li");

  // サーバーのデータが「完了(true)」なら completed クラスを最初からつける
  if (task.completed) {
    li.classList.add("completed");
  }

  // ...ボタン作成などの処理...

  li.innerHTML = `
    <button class="complete-btn">${task.completed ? "●" : "○"}</button>
    <span class="task-text">${task.text}</span>
    <button class="delete-btn">削除</button>
  `;

  // --- ボタンが確実に反応するように設定 ---
  const compBtn = li.querySelector(".complete-btn");
  compBtn.onclick = async () => {
    // 完了状態を反転させてサーバーに送る
    await updateTask(task.id, !task.completed);
  };

  const delBtn = li.querySelector(".delete-btn");
  delBtn.onclick = async () => {
    await deleteTask(task.id);
  };

  document.getElementById("todo-list").appendChild(li);
}

// サーバーへ更新リクエストを送る関数
async function updateTask(id, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newStatus }),
    });
    if (res.ok) fetchTodos(); // 成功したら再描画
  } catch (err) {
    console.error("更新に失敗しました:", err);
  }
}
