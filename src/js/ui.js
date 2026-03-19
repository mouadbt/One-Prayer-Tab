import { toggleClassName, saveData, loadData } from "./utils.js";

// render the settings options & search engines in the settings panel
export const renderSettings = (settings, engines, icons, reciters) => {
  const settingsContainer = document.querySelector("#settings-options");

  // render settings options
  settings.forEach(option => createOptionElement(option, icons, settingsContainer));

  // render reciters section
  renderReciters(reciters, icons);
}

// Render the search engines in the page
export const renderEngines = (engines) => {
  const searchEnginesList = document.querySelector("#search-engines-list");
  const preferedEngineLabel = document.querySelector("#prefered-engine-label");
  //  Clear the container of search engines because this function is called on load and on update of the search engines selection / delegation
  searchEnginesList.innerHTML = '';
  engines.filter((el) => el.active === true).forEach((el, i) => {

    const liEL = document.createElement("li");
    const liButtonEl = document.createElement("button");
    toggleClassName(liButtonEl, "search-engine", 'add');
    liButtonEl.textContent = el.label;
    liButtonEl.dataset.key = el.key;
    liEL.appendChild(liButtonEl);

    if (el.preferred) {
      toggleClassName(liButtonEl, 'active', 'add');
      renderPreferedEngineIcon(el.key);
      preferedEngineLabel.textContent = el.label;
    }

    searchEnginesList.appendChild(liEL);
  });
}

// Render icon of the active prefered search engine
const renderPreferedEngineIcon = (key) => {
  const iconEl = document.querySelector("#searchIcon");
  const icon = document.createElement('img');
  icon.src = `/assets/images/searchLogos/${key}.webp`;
  iconEl.innerHTML = '';
  iconEl.appendChild(icon);
}

// Embed the svg icon to the page  
export const buildTheSvgIcon = (svgIconContent, btn, withDimensions) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  if (withDimensions) {
    svg.setAttribute("width", "20px");
    svg.setAttribute("height", "20px");
  }
  svg.innerHTML += svgIconContent;
  btn.appendChild(svg);
}

// Render the icons in the relevant button
export const renderIcons = (icons) => {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const svgIconContent = icons[el.dataset.icon]?.content;
    el.innerHTML = '';
    buildTheSvgIcon(svgIconContent, el);
  });
}

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
  toggleClassName(checkDiv, 'check', 'add');

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
}

// render reciters or muadhins list (generic function)
export const renderAudioList = ({ containerId, storageKey, items, defaultItem, nameAttr }, icons) => {
  const container = document.querySelector(`#${containerId}`);
  const storedItem = loadData(storageKey, null);
  const currentItem = storedItem || defaultItem;

  // Remove extension from stored value for comparison
  const currentItemBase = currentItem.replace('.m4a', '').replace('.opus', '');

  items.forEach(item => {
    const liEl = document.createElement("li");
    const btnEl = document.createElement("button");
    btnEl.className = 'max-w-full w-full';
    if (item.file) {
      btnEl.dataset.muadhinFile = item.file;
    }

    const inputEl = document.createElement("input");
    inputEl.type = "radio";
    inputEl.name = nameAttr;
    inputEl.id = item.identifier;
    inputEl.checked = item.identifier === currentItemBase;

    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", item.identifier);
    labelEl.className = 'overflow-x-auto max-w-full w-full';

    const checkDiv = document.createElement("div");
    checkDiv.className = 'relative after:w-[200%] after:h-[125%] after:absolute after:inset-0 after:bg-gradient-to-r after:from-(--backgroundFilled) after:via-(--backgroundFilled) after:to-transparent [&_svg]:z-50 after:z-10 [&_svg]:translate-x-1/8 [&_svg]:translate-y-1/8'
    toggleClassName(checkDiv, 'check', 'add');

    const iconData = icons["check"];
    if (iconData && iconData.content) {
      buildTheSvgIcon(iconData.content, checkDiv, true);
    }

    const spanEl = document.createElement("span");
    spanEl.textContent = `${item.englishName} - ${item.name}`;
    spanEl.className = 'whitespace-nowrap text-right w-fit! ml-auto px-1';
    spanEl.classList.toggle('low-opacity', !inputEl.checked);

    labelEl.appendChild(checkDiv);
    labelEl.appendChild(spanEl);

    btnEl.appendChild(inputEl);
    btnEl.appendChild(labelEl);
    liEl.appendChild(btnEl);

    container.appendChild(liEl);
    
    setTimeout(() => {
      const islong = isALongReciterName(spanEl, container);
      if (islong) {
        labelEl.appendChild(spanEl);
        const secondSpan = spanEl.cloneNode(true);
        secondSpan.setAttribute('aria-hidden', true);
        labelEl.appendChild(secondSpan);
      }
      labelEl.classList.toggle('scrolledReciterName', islong);
    }, 1000);
  });
}

// render reciters in the reciters list
export const renderReciters = (reciters, icons) => {
  renderAudioList({
    containerId: 'reciters-list',
    storageKey: 'selectedReciter',
    items: reciters,
    defaultItem: 'ar.husarymujawwad',
    nameAttr: 'reciter'
  }, icons);
}

// render muadhins in the muadhins list
export const renderMuadhins = (muadhins, icons) => {
  renderAudioList({
    containerId: 'muadhins-list',
    storageKey: 'selectedMuadhin',
    items: muadhins,
    defaultItem: 'islam-subhi',
    nameAttr: 'muadhin'
  }, icons);
}

const isALongReciterName = (span, container) => {
  const spanRect = span.getBoundingClientRect();
  const spanWidth = spanRect.width;

  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;

  return containerWidth - spanWidth < 80;
}

// Render TodoLists in page
export const renderTask = (task, svgIconContent) => {
  const taskCollection = document.querySelector("#task-collection");
  const taskDiv = document.createElement('div');
  toggleClassName(taskDiv, 'task-entry', 'add');
  taskDiv.dataset.id = task.id;

  const inputEl = document.createElement('input');
  inputEl.type = 'checkbox';
  inputEl.className = 'task-toggle-box';
  inputEl.id = task.id;
  if (task.done) inputEl.checked = true;

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', task.id);
  labelEl.className = 'task-text-label';
  labelEl.title = 'Click to set done or undo it';
  labelEl.textContent = task.text;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'task-remove-action text-center flex items-center justify-center';
  removeBtn.dataset.icon = 'close';
  removeBtn.dataset.remove = task.id;
  removeBtn.title = 'Click to remove task';
  removeBtn.tabIndex = -1;
  if (svgIconContent) {
    buildTheSvgIcon(svgIconContent, removeBtn);
  } else {
    removeBtn.textContent = '×';
  }

  taskDiv.appendChild(inputEl);
  taskDiv.appendChild(labelEl);
  taskDiv.appendChild(removeBtn);

  taskCollection.appendChild(taskDiv);
  return true;
}

// Renders the next prayer in #next-prayer: name, hours left, and minutes left
export const renderNextPrayer = (name, hours, mins) => {
  const nameEl = document.querySelector("#next-prayer-name");
  const hoursEl = document.querySelector("#next-prayer-hours");
  const minsEl = document.querySelector("#next-prayer-mins");
  nameEl.textContent = name || "---";
  hoursEl.textContent = hours;
  minsEl.textContent = mins;
}

// Renders all prayers
export const renderAllPrayers = (categorizedPrayers) => {
  const listEl = document.getElementById("prayers-list");
  listEl.innerHTML = "";

  categorizedPrayers.forEach((prayer) => {
    const li = document.createElement("li");
    li.className = prayer.type;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = prayer.name;

    const timeSpan = document.createElement("span");
    timeSpan.textContent = prayer.time;
    timeSpan.classList.add("low-opacity");

    li.appendChild(nameSpan);
    li.appendChild(timeSpan);
    listEl.appendChild(li);
  });
}

export const renderTodayhijri = (todayDateInfo) => {
  const todayHijriEl = document.querySelector("#today-hijri");
  todayHijriEl.textContent = todayDateInfo?.hijri;
}

export const renderAyah = (ayah) => {
  const ayahInfo = document.querySelector("#ayah-info");
  const ayahEL = document.querySelector("#ayah-value");
  const ayahTafsir = document.querySelector("#ayah-tafsir");

  ayahInfo.textContent = `${ayah.surah} · الآية ${ayah.number}`;
  ayahEL.textContent = `﴿${ayah.arabic}﴾`;
  ayahTafsir.textContent = `${ayah.tafsir}`;
}

export const showPlayingAyahError = () => {
  const playingAyahErrorToast = document.querySelector('#playing-ayah-error-toast');

  if (playingAyahErrorToast) return;
  // Create a new div element
  const toast = document.createElement('div');

  // Set Tailwind CSS classes for styling
  toast.className = 'fixed bottom-4 left-1/2 w-10/12 max-w-sm rounded-3xl p-4 text-center text-(--background100)! bg-(--foreground100)! -translate-x-[50%] z-50 text-sm! opacity-50';
  toast.setAttribute('id', 'playing-ayah-error-toast');

  // Create a text node and append it to the toast
  const text = document.createTextNode('Error playing ayah. Check internet or change reciter. Report if persists.');
  toast.appendChild(text);

  // Append the toast to the body of the document
  document.body.appendChild(toast);

  // Remove the toast after 10 seconds
  setTimeout(() => {
    removeElement(toast);
  }, 10000);

  toast.addEventListener('click', () => {
    removeElement(toast);
  });
};

const removeElement = (el) => {
  el?.remove();
}