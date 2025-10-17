/*
 * app.js
 *
 * This script powers the Daily Tag‑Up dashboard. It manages the tasks board
 * (adding tasks, drag and drop, assigning to users) and saves both tasks
 * and tag‑up submissions to localStorage. Tasks are grouped into three
 * statuses: "todo", "in-progress", and "done". Each task includes a
 * description, an assignee, a unique id, and its current status. Users
 * can drag tasks between columns to update their status. Tag‑up entries
 * are persisted for reference but not displayed in the UI.
 */

// Global array to hold tasks loaded from localStorage
let tasks = [];

/**
 * Load tasks from localStorage into the `tasks` array. If there are no
 * previously saved tasks, initialise with an empty array.
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
    tasks = [];
  }
}

/**
 * Save the current `tasks` array to localStorage.
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Create a DOM element for a task. Each task is a draggable div with the
 * description and assignee. Event handlers for drag events are attached
 * here.
 *
 * @param {Object} task - A task object with id, desc, assignee and status.
 * @returns {HTMLElement} A DOM element representing the task.
 */
function createTaskElement(task) {
  const taskEl = document.createElement('div');
  taskEl.classList.add('task');
  taskEl.draggable = true;
  taskEl.dataset.id = task.id;

  // Inner HTML: description and assignee label
  const descDiv = document.createElement('div');
  descDiv.className = 'task-desc';
  descDiv.textContent = task.desc;

  const assigneeDiv = document.createElement('div');
  assigneeDiv.className = 'task-assignee';
  assigneeDiv.textContent = task.assignee || '';

  taskEl.appendChild(descDiv);
  taskEl.appendChild(assigneeDiv);

  // Add drag events
  taskEl.addEventListener('dragstart', handleDragStart);
  taskEl.addEventListener('dragend', handleDragEnd);

  return taskEl;
}

/**
 * Render all tasks into their respective columns based on status. This
 * function clears the existing lists first and then appends updated
 * elements.
 */
function renderTasks() {
  // Get references to each task list
  const todoList = document.getElementById('todo-list');
  const inProgressList = document.getElementById('in-progress-list');
  const doneList = document.getElementById('done-list');

  // Clear existing content
  todoList.innerHTML = '';
  inProgressList.innerHTML = '';
  doneList.innerHTML = '';

  // Group tasks by status and append to appropriate lists
  tasks.forEach(task => {
    const taskEl = createTaskElement(task);
    switch (task.status) {
      case 'todo':
        todoList.appendChild(taskEl);
        break;
      case 'in-progress':
        inProgressList.appendChild(taskEl);
        break;
      case 'done':
        doneList.appendChild(taskEl);
        break;
      default:
        // Unknown status -> default to todo
        todoList.appendChild(taskEl);
    }
  });
}

/**
 * Handler for dragstart event. Stores the dragged task's id in the
 * dataTransfer object so it can be retrieved on drop. Also adds a
 * `dragging` class for styling.
 *
 * @param {DragEvent} e
 */
function handleDragStart(e) {
  const id = e.target.dataset.id;
  e.dataTransfer.setData('text/plain', id);
  // Add a small timeout to allow the dragging class to apply after drag
  requestAnimationFrame(() => e.target.classList.add('dragging'));
}

/**
 * Handler for dragend event. Removes the `dragging` class.
 *
 * @param {DragEvent} e
 */
function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

/**
 * Initialise drag-and-drop on the columns. Add dragover and drop
 * listeners to each task list (dropzone). When a task is dropped, its
 * status is updated based on the parent column's data-status attribute,
 * tasks are re-saved, and the board is re-rendered.
 */
function initDragAndDrop() {
  const lists = document.querySelectorAll('.task-list');
  lists.forEach(list => {
    list.addEventListener('dragover', e => {
      e.preventDefault();
      // Optionally highlight drop zone
    });
    list.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const task = tasks.find(t => t.id == id);
      if (!task) return;
      // Determine new status from parent column's id or data-status
      const column = list.parentElement;
      const newStatus = column.dataset.status;
      task.status = newStatus;
      saveTasks();
      renderTasks();
    });
  });
}

/**
 * Adds a new task based on the description and assignee inputs. Tasks
 * default to "todo" status. After adding, saves and re-renders.
 */
function handleAddTask() {
  const descInput = document.getElementById('task-input');
  const assigneeSelect = document.getElementById('task-assignee');
  const desc = descInput.value.trim();
  const assignee = assigneeSelect.value;
  if (!desc) return;
  const task = {
    id: Date.now(),
    desc: desc,
    assignee: assignee,
    status: 'todo'
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
  descInput.value = '';
  assigneeSelect.value = '';
}

/**
 * Handle submission of the tag-up form. Collects values, stores them in
 * localStorage under 'tagUps', and resets the form. This does not
 * display saved tag-ups; it is for record-keeping only.
 *
 * @param {SubmitEvent} e
 */
function handleTagUpSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const workDate = document.getElementById('workdate').value;
  const projectDO = document.getElementById('projectdo').value;
  const building = document.getElementById('building').value;
  const yesterday = document.getElementById('yesterday').value;
  const today = document.getElementById('today').value;
  const blockers = document.getElementById('blockers').value;

  const tagUp = {
    id: Date.now(),
    name,
    workDate,
    projectDO,
    building,
    yesterday,
    today,
    blockers
  };
  let tagUps = [];
  try {
    tagUps = JSON.parse(localStorage.getItem('tagUps') || '[]');
  } catch {}
  tagUps.push(tagUp);
  localStorage.setItem('tagUps', JSON.stringify(tagUps));
  e.target.reset();
  alert('Tag‑up saved');
}

/**
 * Initialise the page. Load tasks, render them, set up drag-and-drop,
 * and attach event handlers for adding tasks and saving tag-ups.
 */
function init() {
  loadTasks();
  renderTasks();
  initDragAndDrop();
  // Attach event handlers
  document.getElementById('add-task-btn').addEventListener('click', handleAddTask);
  document.getElementById('tagup-form').addEventListener('submit', handleTagUpSubmit);
}

// Run init on page load
window.addEventListener('DOMContentLoaded', init);