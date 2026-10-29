const apiStatus = document.querySelector("#api-status");
const statusDot = document.querySelector(".status-dot");
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const message = document.querySelector("#message");

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) detail = body.error;
    } catch (_) {}
    throw new Error(detail);
  }

  return response.status === 204 ? null : response.json();
}

function showMessage(text = "") {
  message.textContent = text;
}

function renderTasks(tasks) {
  taskList.replaceChildren();
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  emptyState.hidden = tasks.length !== 0;

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} complete`);
    checkbox.addEventListener("change", async () => {
      try {
        await api(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: checkbox.checked })
        });
        await loadTasks();
      } catch (error) {
        showMessage(error.message);
        await loadTasks();
      }
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", async () => {
      try {
        await api(`/api/tasks/${task.id}`, { method: "DELETE" });
        showMessage("");
        await loadTasks();
      } catch (error) {
        showMessage(error.message);
      }
    });

    item.append(checkbox, title, remove);
    taskList.append(item);
  }
}

async function loadTasks() {
  const tasks = await api("/api/tasks");
  renderTasks(tasks);
}

async function checkHealth() {
  try {
    await api("/api/health");
    apiStatus.textContent = "API connected";
    statusDot.classList.add("ok");
    statusDot.classList.remove("error");
  } catch (_) {
    apiStatus.textContent = "API unavailable";
    statusDot.classList.add("error");
    statusDot.classList.remove("ok");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  const submitButton = form.querySelector("button");
  submitButton.disabled = true;
  showMessage("");

  try {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title })
    });
    titleInput.value = "";
    await loadTasks();
    titleInput.focus();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

(async function init() {
  await checkHealth();
  try {
    await loadTasks();
  } catch (error) {
    showMessage(`Could not load tasks: ${error.message}`);
  }
})();
