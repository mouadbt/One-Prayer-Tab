export function updateClock() {
    const clockElement = document.querySelector('#clock');
    if (!clockElement) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes}`;
}
 
export function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}