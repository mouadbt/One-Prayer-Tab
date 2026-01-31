import { saveData } from './utils.js';
import { renderEngines } from './ui.js';

// Update the search engines list to set the selected engine as preferred and ensure it's active
export const handleEngineSelect = (key, engines, parent, input) => {
    // Find the engine that was clicked
    const clickedEngine = engines.find(e => e.key === key);

    // If the clicked engine is not active (not checked in settings), make it active
    if (clickedEngine && !clickedEngine.active) {
        clickedEngine.active = true;
    }

    // Set the clicked engine as preferred (active in the UI)
    const updated = engines.map(e => ({
        ...e,
        preferred: e.key === key,
        active: e.key === key ? true : e.active
    }));
    saveData('searchEngines', updated);
    renderEngines(updated);

    // hide the list and focus again on the triger
    parent.classList.add('hidden');
    input.focus();
};