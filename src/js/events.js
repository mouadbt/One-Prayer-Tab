import { handleEngineSelect } from './settings.js';

export const setupGlobalListeners = (engines, settings) => {
    const searchEnginesListTrigger = document.querySelector('#search-engines-list-trigger');
    const searchEnginesList = document.querySelector('#search-engines-list');
    const searchInput = document.querySelector("#search-input");
    const searchContainer = document.querySelector("#search-container");

    /*
        Toggle search engines list's appearence
        and handle focus
    */
    searchEnginesListTrigger.addEventListener('click', () => {

        // show or hide the search engines lists
        searchEnginesList.classList.toggle('hidden');

        // focus on the first searach engine element when list is displayed or on the trigger if it hidden 
        if (!searchEnginesList.classList.contains('hidden')) {
            const firstSearchEngineEl = searchEnginesList.querySelector('button');
            if (!firstSearchEngineEl) {
                return
            }
            firstSearchEngineEl.focus();
        } else {
            searchEnginesListTrigger.focus();
        }
    });

    /*
        Search engine selection / delegation
    */
    searchEnginesList.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
            handleEngineSelect(btn.dataset.key, engines, searchEnginesList, searchInput);
        };
    });

    /*
        handle keyboard events
    */
    document.addEventListener('keydown', (e) => {

        // Close settings panel
        if (e.key === 'Escape') {
            closeSearchEngineList();
            unsetSearchContainerFocusing(searchContainer);
        };

        // Focus on the search input
        if (e.key === '/' && document.activeElement.id !== "search-input") {
            e.preventDefault();
            searchInput.focus();
            // set search container as main widget
            focusOnSearchContainer(searchContainer);
        };
    });

    // when tsart typing set the search container as the main primary widget
    searchInput.addEventListener('input', () => {
        focusOnSearchContainer(searchContainer);
    });

    // Close any overlay or focused element when clicking outside
    document.addEventListener('click', (e) => {
        // if we click outside settings panel -> close it 

    });
};

/*
    focus on the search container and make it the primary widget and undo it
*/
const focusOnSearchContainer = (searchContainer) => {
    searchContainer.classList.add('-translate-y-[250%]');
};
const unsetSearchContainerFocusing = (el) => {
    el.classList.remove('-translate-y-[250%]');
};


const closeSearchEngineList = () => {
    searchEnginesList.classList.add('hidden');
}