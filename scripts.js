let db;

const request = indexedDB.open("todoDB", 1);

/* ===== CRIAÇÃO DO BANCO ===== */
request.onupgradeneeded = (e) => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("tasks")) {
    db.createObjectStore("tasks", {
      keyPath: "id",
      autoIncrement: true
    });
  }
};

request.onsuccess = (e) => {
  db = e.target.result;
  renderTasks();
};

request.onerror = () => {
  console.error("Erro ao abrir IndexedDB");
};

/* ===== ADICIONAR TAREFA ===== */
document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const input = document.getElementById("task-input");
  const text = input.value.trim();

  if (!text) return;

  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  store.add({
    text,
    done: false
  });

  tx.oncomplete = () => {
    input.value = "";
    renderTasks(); // 🔥 agora sim, depois de salvar
  };
});

/* ===== LISTAR TAREFAS ===== */
function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");

  const request = store.getAll();

  request.onsuccess = () => {
    const tasks = request.result;

    if (tasks.length === 0) {
      list.innerHTML = `<li style="opacity:.5;text-align:center;">Nenhuma tarefa ainda</li>`;
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement("li");
      if (task.done) li.classList.add("done");

      li.innerHTML = `
        <span>${task.text}</span>
        <div>
          <button onclick="toggleTask(${task.id})">✔</button>
          <button onclick="deleteTask(${task.id})">✖</button>
        </div>
      `;

      list.appendChild(li);
    });
  };
}

/* ===== MARCAR COMO CONCLUÍDA ===== */
function toggleTask(id) {
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  const req = store.get(id);

  req.onsuccess = () => {
    const task = req.result;
    task.done = !task.done;
    store.put(task);
  };

  tx.oncomplete = renderTasks;
}

/* ===== EXCLUIR ===== */
function deleteTask(id) {
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  store.delete(id);
  tx.oncomplete = renderTasks;
}
