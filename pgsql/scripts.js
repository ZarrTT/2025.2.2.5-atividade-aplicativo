document.addEventListener("DOMContentLoaded", () => {
  let db;

  const request = indexedDB.open("todoDB", 1);

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = (e) => {
    db = e.target.result;
    loadTasks();
  };

  function addTask(text) {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").add({ text, done: false });
    tx.oncomplete = loadTasks;
  }

  function loadTasks() {
    const list = document.getElementById("task-list");
    list.innerHTML = "";

    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");

    store.getAll().onsuccess = (e) => {
      e.target.result.forEach(task => {
        const li = document.createElement("li");
        if (task.done) li.classList.add("done");

        const left = document.createElement("div");
        left.className = "task-left";

        const check = document.createElement("div");
        check.className = "check";
        check.onclick = () => toggleTask(task.id, !task.done);

        const span = document.createElement("span");
        span.textContent = task.text;

        const del = document.createElement("button");
        del.textContent = "✖";
        del.className = "delete";
        del.onclick = () => deleteTask(task.id);

        left.appendChild(check);
        left.appendChild(span);

        li.appendChild(left);
        li.appendChild(del);
        list.appendChild(li);
      });
    };
  }

  function toggleTask(id, done) {
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    store.get(id).onsuccess = (e) => {
      const task = e.target.result;
      task.done = done;
      store.put(task);
    };

    tx.oncomplete = loadTasks;
  }

  function deleteTask(id) {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").delete(id);
    tx.oncomplete = loadTasks;
  }

  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("task-input");
    addTask(input.value);
    input.value = "";
  });
});
