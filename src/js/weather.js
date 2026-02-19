import { fetchData, loadData} from './utils.js';

const fetchWeather = async (lat, lon) => {
    const data = await fetchData(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weathercode,temperature_2m_max&timezone=auto`);

    if (!data?.current) {
        // loadBackupWeather();
        return;
    }
};

export const initWeather = (coords) => {
    const [lat, lon] = coords;
    fetchWeather(lat, lon);
};