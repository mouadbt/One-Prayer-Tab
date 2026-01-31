// import { initLogic } from "./suggestions.js";
import { fetchResources, loadData } from "./utils.js";
import { renderEngines } from "./ui.js";
// import { applyAllSettings } from "./settings.js";
import { setupGlobalListeners } from "./events.js";
// import { renderTasks } from './ui.js';

const init = async () => {
  // get the default data
  const DEFAULTS = await fetchResources("defaults");

  // // Load icons from json file
  // const icons = await fetchResources("icons");

  // Get the search engines from localstorage or default const
  const engines = loadData("searchEngines", DEFAULTS.searchEngines);

  // // Get the settings from localstorage or default const
  // const settings = loadData("settingsOptions", DEFAULTS.settingsOptions);
  // const renderedSettings = settings.filter((el) => { return el.regular == true });

  // // get the Todo Items
  // const todoItems = loadData('tasks', []);

  // // Render the icons in the page
  // renderIcons(icons);

  //  Render the search engines in the page
  renderEngines(engines);

  // // Apply settings to the page element
  // applyAllSettings(settings);

  // handle page actions
  setupGlobalListeners(engines);

  // // Initialize searching logic
  // initLogic();

  // // Render TodoItems
  // renderTasks(todoItems);
};

// load and execute and start script after page fully load
document.addEventListener("DOMContentLoaded", () => {
  init();
});
