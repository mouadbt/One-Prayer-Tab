import { handleTodListEvents } from './todo.js';

// render the settings options & search engines in the settings panel
export const renderSettings = (settings, engines, icons) => {
  const settingsContainer = document.querySelector("#settings-options");

  // render settings options
  settings.forEach(option => createOptionElement(option, icons, settingsContainer));
};

// Render the search engines in the page
export const renderEngines = (engines) => {
  const searchEnginesList = document.querySelector("#search-engines-list");
  const preferedEngineLabel = document.querySelector("#prefered-engine-label");
  //  Clear the container of search engines because this function is called on load and on update of the search engines selection / delegation
  searchEnginesList.innerHTML = '';
  engines.filter((el) => el.active === true).forEach((el, i) => {

    const liEL = document.createElement("li");
    const liButtonEl = document.createElement("button");
    liButtonEl.classList.add("search-engine");
    liButtonEl.textContent = el.label;
    liButtonEl.dataset.key = el.key;
    liEL.appendChild(liButtonEl);

    if (el.preferred) {
      liButtonEl.classList.add("active");
      renderPreferedEngineIcon(el.key);
      preferedEngineLabel.textContent = el.label;
    }

    searchEnginesList.appendChild(liEL);
  });
};

// Render icon of the active prefered search engine
const renderPreferedEngineIcon = (key) => {
  const iconEl = document.querySelector("#searchIcon");
  const icon = document.createElement('img');
  icon.src = `./assets/images/searchLogos/${key}.webp`;
  iconEl.innerHTML = '';
  iconEl.appendChild(icon);
};

// Embed the svg icon to the page  
export const buildTheSvgIcon = (svgIconContent, btn, withDimensions) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  if (withDimensions) {
    svg.setAttribute("width", "20px");
    svg.setAttribute("height", "20px");
  }
  svg.innerHTML += svgIconContent;
  btn.appendChild(svg);
};

// Render the icons in the relevant button
export const renderIcons = (icons) => {
  document.querySelectorAll('.icon-btn').forEach((btn) => {
    const svgIconContent = icons[btn.dataset.icon]?.content;
    btn.innerHTML = '';
    buildTheSvgIcon(svgIconContent, btn);
  });
};

// helper to create & append a single option
const createOptionElement = (option, icons, container) => {

  const liEl = document.createElement("li");
  const btnEl = document.createElement("button");

  const inputEl = document.createElement("input");
  inputEl.type = "checkbox";
  inputEl.id = option.key;
  inputEl.checked = option.active;

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", option.key);

  const checkDiv = document.createElement("div");
  checkDiv.classList.add("check");

  const iconData = icons["check"];
  if (iconData && iconData.content) {
    buildTheSvgIcon(iconData.content, checkDiv, true);
  }

  const spanEl = document.createElement("span");
  spanEl.textContent = option.label;

  labelEl.appendChild(checkDiv);
  labelEl.appendChild(spanEl);

  btnEl.appendChild(inputEl);
  btnEl.appendChild(labelEl);
  liEl.appendChild(btnEl);

  container.appendChild(liEl);
};

// Render TodoLists in page
export const renderTask = (task) => {
  const taskCollection = document.querySelector("#task-collection");
  const taskDiv = document.createElement('div');
  taskDiv.classList.add("task-entry");
  taskDiv.dataset.id = task.id;
  taskDiv.innerHTML = `
    <input type="checkbox" class="task-toggle-box" id="${task.id}" ${task.done ? "checked" : ""}>
    <label for="${task.id}" class="task-text-label" title="Click to set done or undo it">${task.text}</label>
    <button class="task-remove-action" data-remove="${task.id}" title="Click to remove task" tabindex="-1">×</button>
  `;
  taskCollection.appendChild(taskDiv);
  return true;
};

export const renderTasks = (todoItems) => {
  todoItems.forEach((task) => {
    renderTask(task)
  });
  handleTodListEvents();
};