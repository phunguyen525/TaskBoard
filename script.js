let db;

const request = indexedDB.open("taskboard-db", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  let store = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
  store.createIndex("task", "task", { unique: false });
};

request.onsuccess = function (e) {
  db = e.target.result;
  displayTasks();
};

function addTask() {
  let taskText = document.getElementById("taskInput").value;
  if (!taskText) return;

  let tx = db.transaction("tasks", "readwrite");
  tx.objectStore("tasks").add({ task: taskText });

  tx.oncomplete = displayTasks;
}

function deleteTask(id) {
  let tx = db.transaction("tasks", "readwrite");
  tx.objectStore("tasks").delete(id);
  tx.oncomplete = displayTasks;
}

function displayTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  let tx = db.transaction("tasks", "readonly");
  let store = tx.objectStore("tasks");

  store.openCursor().onsuccess = function (e) {
    let cursor = e.target.result;
    if (cursor) {
      let li = document.createElement("li");
      li.textContent = cursor.value.task;

      let btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.onclick = () => deleteTask(cursor.value.id);

      li.appendChild(btn);
      list.appendChild(li);

      cursor.continue();
    }
  };
}
