// import { renderTask } from "./ui";
import { renderTask } from './ui.js';
import { loadData, saveData } from './utils.js';

// Add new Task
export const handleAddNewTask = (taskInput) => {
    addNewTask(taskInput)
    handleTodListEvents();
};

// Add a new task
export const addNewTask = (taskInput) => {
    const taskContent = taskInput.value.trim();
    if (!taskContent) return;
    const id = "taskItem" + Date.now();
    const task = { id, text: taskContent, done: false };
    const tasks = loadData('tasks', []);
    tasks.push(task);
    saveData('tasks', tasks);
    renderTask(task);
    taskInput.value = '';
};

// set a todo task as done or undo it
export const handleTodListEvents = () => {
    const taskInput = document.querySelectorAll(".task-toggle-box");
    const removeTaskBtns = document.querySelectorAll('.task-remove-action');
    handleRemoveTasks(removeTaskBtns);
    handleUpdateTask(taskInput);
};

// functions that handle removing and deleting if item
const handleRemoveTasks = (removeTaskBtns) => {
    removeTaskBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute("data-remove");
            removeTask(id);
        })
    });
};

// funcation that handles the updating of the task set it done or undo it
const handleUpdateTask = (taskInput) => {
    taskInput.forEach((el) => {
        el.addEventListener('change', () => {
            const id = el.id;
            updateTask(id, el);
        });
    });
};

// Remove a taks
const removeTask = (id) => {
    const taskEntry = document.querySelector(`.task-entry[data-id="${id}"]`);
    if (!taskEntry) return;

    taskEntry.classList.add("task-fade-out");

    setTimeout(() => {
        taskEntry.remove();
        const tasks = loadData('tasks', []);
        const updatedTasks = tasks.filter((t) => t.id !== id);
        saveData('tasks', updatedTasks);
    }, 300);

};

// Update a task
const updateTask = (id, el) => {
    const tasks = loadData('tasks', []);
    const idT = tasks.findIndex((task) => task.id === id);
    if (idT !== -1) {
        tasks[idT].done = el.checked;
        saveData('tasks', tasks);
    }
    if (el.checked) {
    }
};