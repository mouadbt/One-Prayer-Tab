
import { calculatePrayerTimes } from "@masaajid/prayer-times";
import { loadData } from "./utils";


// retrun the calculation method that is the closest to user's coords for best accuracy
function getClosestMethod([lat, lon], methods) {
    let closest = null;
    let minDistance = Infinity;

    methods.forEach(m => {
        if (!m.location) return;
        const dist = Math.hypot(
            lat - m.location.latitude,
            lon - m.location.longitude
        );
        if (dist < minDistance) {
            minDistance = dist;
            closest = m;
        }
    });
    return closest;
}

export const initPrayers = (prayerTimesMethods) => {
    const userCoords = loadData('location', null);
    if (!userCoords) return;
    const [lat, lon] = userCoords;

    const method = getClosestMethod([lat, lon], prayerTimesMethods);

    let times;
    if (method.is_built_in) {
        times = calculatePrayerTimes({
            method: method.key,
            location: [lat, lon],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    } else {
        times = calculatePrayerTimes({
            method: "Custom",
            location: [lat, lon],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            params: method.params
        });
    }
}