const API_URL = "http://localhost:8000/todos";

// 描画関数
function renderTask(task) {
  const li = document.createElement("li");
  // サーバーのデータに合わせてクラスを付ける
  if (task.completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
    <button class="complete-btn">${task.completed ? "●" : "○"}</button>
    <div class="task-info">
      <span class="task-text">${task.text}</span>
    </div>
    <button class="delete-btn">削除</button>
  `;

  // --- 【重要】完了ボタンの動作 ---
  const compBtn = li.querySelector(".complete-btn");
  compBtn.onclick = async () => {
    console.log("完了ボタンが押されました！ ID:", task.id); // 動作確認用

    // 現在のステータスを反転させてサーバーに送る
    const nextStatus = !task.completed;
    await updateTask(task.id, nextStatus);
  };

  // --- 削除ボタンの動作 ---
  const delBtn = li.querySelector(".delete-btn");
  delBtn.onclick = async () => {
    if (confirm("削除しますか？")) {
      await deleteTask(task.id);
    }
  };

  document.getElementById("todo-list").appendChild(li);
}

// サーバーに更新リクエストを送る関数
async function updateTask(id, newStatus) {
  console.log(
    `サーバーに更新送信中... URL: ${API_URL}/${id}, Status: ${newStatus}`
  );

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newStatus }),
    });

    if (res.ok) {
      console.log("更新成功！画面をリロードします。");
      location.reload(); // 一番確実な方法で画面を更新
    } else {
      const errorData = await res.json();
      console.error("サーバーがエラーを返しました:", errorData);
    }
  } catch (err) {
    console.error(
      "ネットワークエラー（サーバーが動いていない可能性があります）:",
      err
    );
    alert("サーバーに接続できませんでした。Denoを起動していますか？");
  }
}

// データ取得
async function fetchTodos() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "読み込み中...";
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    list.innerHTML = "";
    data.forEach((task) => renderTask(task));
  } catch (err) {
    list.innerHTML = "データ取得エラー";
  }
}

// 起動時に実行
window.onload = fetchTodos;
