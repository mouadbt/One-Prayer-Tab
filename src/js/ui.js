
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