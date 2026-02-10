let db;

const request = indexedDB.open("todoDB", 1);

/* ===== Criar DB ===== */
request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = e => {
  db = e.target.result;
  renderTasks();
};

/* ===== Adicionar tarefa ===== */
document.getElementById("task-form").addEventListener("submit", e => {
  e.preventDefault();

  const text = document.getElementById("task-input").value;

  const transaction = db.transaction("tasks", "readwrite");
  const store = transaction.objectStore("tasks");

  store.add({
    text,
    done: false
  });

  transaction.oncomplete = () => {
    e.target.reset();
    renderTasks();
  };
});

/* ===== Listar tarefas ===== */
function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  const transaction = db.transaction("tasks", "readonly");
  const store = transaction.objectStore("tasks");

  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (cursor) {
      const task = cursor.value;

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
      cursor.continue();
    }
  };
}

/* ===== Marcar como concluída ===== */
function toggleTask(id) {
  const transaction = db.transaction("tasks", "readwrite");
  const store = transaction.objectStore("tasks");

  const req = store.get(id);
  req.onsuccess = () => {
    const task = req.result;
    task.done = !task.done;
    store.put(task);
  };

  transaction.oncomplete = renderTasks;
}

/* ===== Excluir tarefa ===== */
function deleteTask(id) {
  const transaction = db.transaction("tasks", "readwrite");
  const store = transaction.objectStore("tasks");

  store.delete(id);
  transaction.oncomplete = renderTasks;
}
