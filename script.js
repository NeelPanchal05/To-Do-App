const inputBox = document.getElementById("input-box");
const prioritySelect = document.getElementById("priority-select");
const categorySelect = document.getElementById("category-select");
const tagsInput = document.getElementById("tags-input");
const dueDateInput = document.getElementById("due-date-input");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const headerCompletedCounter = document.getElementById("header-completed-counter");
const headerUncompletedCounter = document.getElementById("header-uncompleted-counter");
const totalCounter = document.getElementById("total-counter");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const emptyState = document.getElementById("empty-state");
const themeToggle = document.getElementById("theme-toggle");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

// Custom Modal Elements
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editCancelBtn = document.getElementById("edit-cancel-btn");
const editSaveBtn = document.getElementById("edit-save-btn");

const confirmModal = document.getElementById("confirm-modal");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
const confirmOkBtn = document.getElementById("confirm-ok-btn");

let currentFilter = "all";
let currentCategoryFilter = "all";
let tasks = [];
const STORAGE_KEY = "todoAppTasks";
const THEME_KEY = "todoAppTheme";

// Callbacks for custom modals
let activeConfirmCallback = null;
let activeEditCallback = null;

// ==========================================
// Theme Management
// ==========================================
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");
    themeToggle.textContent = "🌙";
  }
}

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// ==========================================
// Custom Modal Dialogs
// ==========================================
function showConfirmModal(title, message, onConfirm, isAlert = false) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmModal.classList.add("show");
  activeConfirmCallback = onConfirm;

  if (isAlert) {
    confirmCancelBtn.style.display = "none";
    confirmOkBtn.textContent = "OK";
    confirmOkBtn.className = "modal-btn primary-btn";
  } else {
    confirmCancelBtn.style.display = "inline-block";
    confirmOkBtn.textContent = "Confirm";
    confirmOkBtn.className = "modal-btn danger-btn";
  }
}

function hideConfirmModal() {
  confirmModal.classList.remove("show");
  activeConfirmCallback = null;
}

confirmCancelBtn.addEventListener("click", hideConfirmModal);
confirmOkBtn.addEventListener("click", () => {
  if (activeConfirmCallback) {
    activeConfirmCallback();
  }
  hideConfirmModal();
});

function showEditModal(currentText, onSave) {
  editInput.value = currentText;
  editModal.classList.add("show");
  editInput.focus();
  activeEditCallback = onSave;
}

function hideEditModal() {
  editModal.classList.remove("show");
  activeEditCallback = null;
}

editCancelBtn.addEventListener("click", hideEditModal);
editSaveBtn.addEventListener("click", () => {
  const updatedText = editInput.value.trim();
  if (updatedText && activeEditCallback) {
    activeEditCallback(updatedText);
  }
  hideEditModal();
});

// Close modals when clicking outside content area
window.addEventListener("click", (e) => {
  if (e.target === editModal) hideEditModal();
  if (e.target === confirmModal) hideConfirmModal();
});

// Enter key within Edit Input saves the task
editInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    editSaveBtn.click();
  }
});

// ==========================================
// Utility Functions
// ==========================================
// Formats standard ISO YYYY-MM-DD input date strictly in local timezone
function formatLocalDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

// Update progress bar
function updateProgressBar() {
  if (tasks.length === 0) {
    progressFill.style.width = "0%";
    progressText.textContent = "0% Complete";
    return;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((completedTasks / tasks.length) * 100);

  progressFill.style.width = percentage + "%";
  progressText.textContent = percentage + "% Complete";
}

// Load tasks from localStorage on page load
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Update counters
function updateCounters() {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const uncompletedTasks = tasks.filter((t) => !t.completed).length;
  const totalTasks = tasks.length;

  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
  headerCompletedCounter.textContent = completedTasks;
  headerUncompletedCounter.textContent = uncompletedTasks;
  totalCounter.textContent = totalTasks;

  updateProgressBar();
}

// Show/hide empty state intelligently
function updateEmptyState(filteredTasksCount) {
  if (tasks.length === 0) {
    emptyState.querySelector("p").textContent = "📝 No tasks yet! Add one to get started.";
    emptyState.classList.add("show");
    listContainer.style.display = "none";
  } else if (filteredTasksCount === 0) {
    emptyState.querySelector("p").textContent = "🔍 No matching tasks found.";
    emptyState.classList.add("show");
    listContainer.style.display = "none";
  } else {
    emptyState.classList.remove("show");
    listContainer.style.display = "block";
  }
}

// ==========================================
// Task CRUD Logic
// ==========================================
// Add task
function addTask() {
  const taskText = inputBox.value.trim();
  if (!taskText) {
    inputBox.classList.add("shake");
    setTimeout(() => {
      inputBox.classList.remove("shake");
    }, 400);
    return;
  }

  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    priority: prioritySelect.value,
    category: categorySelect.value,
    tags: tags,
    dueDate: dueDateInput.value || null,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Reset inputs
  inputBox.value = "";
  prioritySelect.value = "medium";
  categorySelect.value = "none";
  tagsInput.value = "";
  dueDateInput.value = "";
}

// Render tasks - The Unified Pipeline
function renderTasks() {
  const fragment = document.createDocumentFragment();

  // 1. Filter based on Completion state
  let filteredTasks = tasks.filter((task) => {
    if (currentFilter === "completed") return task.completed;
    if (currentFilter === "uncompleted") return !task.completed;
    return true;
  });

  // 2. Filter based on category
  if (currentCategoryFilter !== "all") {
    filteredTasks = filteredTasks.filter((task) => {
      if (currentCategoryFilter === "none") {
        return !task.category || task.category === "none";
      }
      return task.category === currentCategoryFilter;
    });
  }

  // 3. Filter based on search query
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    if (searchTerm.startsWith("#")) {
      const tagQuery = searchTerm.slice(1);
      filteredTasks = filteredTasks.filter((task) =>
        task.tags && task.tags.some((t) => t.includes(tagQuery))
      );
    } else {
      filteredTasks = filteredTasks.filter((task) =>
        task.text.toLowerCase().includes(searchTerm) ||
        (task.tags && task.tags.some((t) => t.includes(searchTerm)))
      );
    }
  }

  // 4. Render final output elements
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.draggable = false;
    li.dataset.id = task.id;

    const dueDateText = task.dueDate
      ? `<div class="due-date">📅 ${formatLocalDate(task.dueDate)}</div>`
      : "";

    // Ensure category exists
    const categoryVal = task.category || "none";
    const categoryLabel = categoryVal !== "none" ? categoryVal.toUpperCase() : "NO CATEGORY";
    const categoryBadge = `<span class="category-badge category-${categoryVal}">${categoryLabel}</span>`;

    // Ensure tags exist and format them
    let tagsText = "";
    if (task.tags && task.tags.length > 0) {
      const tagPills = task.tags
        .map((tag) => `<span class="tag-pill">#${tag}</span>`)
        .join("");
      tagsText = `<div class="tags-container">${tagPills}</div>`;
    }

    li.innerHTML = `
      <div class="drag-handle" title="Drag to reorder">⠿</div>
      <div class="task-info">
        <label>
          <input type="checkbox" ${task.completed ? "checked" : ""}>
          <span>${task.text}</span>
        </label>
        <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
        ${categoryBadge}
        ${dueDateText}
        ${tagsText}
      </div>
      <div class="task-buttons">
        <span class="edit-btn" title="Edit Task">✎</span>
        <span class="delete-btn" title="Delete Task">✕</span>
      </div>
    `;

    if (task.completed) {
      li.classList.add("completed");
    }

    li.classList.add("fade-in");

    // Checkbox toggle
    const checkbox = li.querySelector("input");
    checkbox.addEventListener("change", function () {
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      tasks[taskIndex].completed = checkbox.checked;

      // Smoothly hide item if it violates the active filter on toggle
      if ((currentFilter === "uncompleted" && checkbox.checked) || 
          (currentFilter === "completed" && !checkbox.checked)) {
        li.classList.add("fade-out");
        setTimeout(() => {
          saveTasks();
          renderTasks();
        }, 300);
      } else {
        li.classList.toggle("completed", checkbox.checked);
        saveTasks();
        updateCounters();
      }
    });

    // Tag pills click triggers tag search
    const tagPills = li.querySelectorAll(".tag-pill");
    tagPills.forEach((pill) => {
      pill.addEventListener("click", function (e) {
        e.stopPropagation();
        const tagName = pill.textContent.slice(1); // remove '#'
        searchInput.value = "#" + tagName;
        renderTasks();
      });
    });

    // Edit button
    const editBtn = li.querySelector(".edit-btn");
    editBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      showEditModal(task.text, (updatedText) => {
        const taskIndex = tasks.findIndex((t) => t.id === task.id);
        tasks[taskIndex].text = updatedText;
        tasks[taskIndex].completed = false; // Reset completion state on edit
        saveTasks();
        renderTasks();
      });
    });

    // Delete button
    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", function () {
      showConfirmModal("Delete Task", `Are you sure you want to delete "${task.text}"?`, () => {
        li.classList.add("fade-out");
        setTimeout(() => {
          tasks = tasks.filter((t) => t.id !== task.id);
          saveTasks();
          renderTasks();
        }, 300);
      });
    });

    // Drag handle interaction triggers
    const handle = li.querySelector(".drag-handle");
    const enableDrag = () => { li.draggable = true; };
    const disableDrag = () => { li.draggable = false; };

    handle.addEventListener("mousedown", enableDrag);
    handle.addEventListener("mouseup", disableDrag);
    handle.addEventListener("touchstart", enableDrag, { passive: true });
    handle.addEventListener("touchend", disableDrag);

    // Drag and drop event listeners
    li.addEventListener("dragstart", function (e) {
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", function () {
      li.classList.remove("dragging");
      li.classList.remove("drag-over");
      li.draggable = false;
    });

    li.addEventListener("dragover", function (e) {
      e.preventDefault();
      li.classList.add("drag-over");
    });

    li.addEventListener("dragleave", function () {
      li.classList.remove("drag-over");
    });

    li.addEventListener("drop", function (e) {
      e.preventDefault();
      const draggedItem = document.querySelector(".dragging");
      if (!draggedItem) return;
      const draggedId = parseInt(draggedItem.dataset.id);
      const targetId = parseInt(li.dataset.id);

      if (draggedId === targetId) return;

      const draggedIndex = tasks.findIndex((t) => t.id === draggedId);
      const targetIndex = tasks.findIndex((t) => t.id === targetId);

      // Splice-based drag-and-drop: natural sorting shift instead of strict element swap
      const [draggedTask] = tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, draggedTask);

      saveTasks();
      renderTasks();
    });

    fragment.appendChild(li);
  });

  listContainer.innerHTML = "";
  listContainer.appendChild(fragment);

  updateCounters();
  updateEmptyState(filteredTasks.length);
}

// ==========================================
// Filter and Search Events
// ==========================================
function filterTasks(filterType) {
  currentFilter = filterType;

  filterButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filterType) {
      btn.classList.add("active");
    }
  });

  renderTasks();
}

// Key events for filtering and search
searchInput.addEventListener("input", renderTasks);

categoryFilter.addEventListener("change", function () {
  currentCategoryFilter = categoryFilter.value;
  renderTasks();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterTasks(btn.dataset.filter);
  });
});

// Clear all tasks
clearAllBtn.addEventListener("click", function () {
  if (tasks.length === 0) {
    showConfirmModal("No Tasks", "You have no tasks to clear!", null, true);
    return;
  }

  showConfirmModal(
    "Clear All Tasks",
    "Are you sure you want to delete ALL tasks? This cannot be undone!",
    () => {
      const items = document.querySelectorAll("#list-container li");
      items.forEach((item) => {
        item.classList.add("fade-out");
      });

      setTimeout(() => {
        tasks = [];
        saveTasks();
        renderTasks();
      }, 300);
    }
  );
});

// Standard button click and keystroke hooks
const inputButton = document.getElementById("input-button");
inputButton.addEventListener("click", addTask);

inputBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// ==========================================
// App Initialization
// ==========================================
initializeTheme();
loadTasks();
renderTasks();
