const apiKey = '192b19869101a954c31e5595376007d1';

const searchForm = document.getElementById('search-form');
const searchHistory = document.getElementById('search-history-list');
const currentWeather = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');

loadSearchHistory();

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchCity();
});

function searchCity() {
  const cityInput = document.getElementById('city-input').value.trim();
  if (!cityInput) return;

  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=1&appid=${apiKey}`;
  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        alert('City not found. Please try another city.');
        return;
      }
      const { lat, lon, name } = data[0];
      addCityToHistory(name, lat, lon);
      displayWeather(lat, lon);
    });
}

function addCityToHistory(city, lat, lon) {
  const existingCityBtn = document.querySelector(`button[data-lat="${lat}"][data-lon="${lon}"]`);

  if (existingCityBtn) {
    searchHistory.prepend(existingCityBtn);
    return;
  }

  const cityBtn = document.createElement('button');
  cityBtn.textContent = city;
  cityBtn.classList.add('city-btn');
  cityBtn.dataset.lat = lat;
  cityBtn.dataset.lon = lon;
  cityBtn.addEventListener('click', () => displayWeather(cityBtn.dataset.lat, cityBtn.dataset.lon));
  searchHistory.prepend(cityBtn);

  const searchHistoryData = JSON.parse(localStorage.getItem('searchHistory')) ?? [];
  if (!searchHistoryData.some(item => item[0] === city && item[1] === lat && item[2] === lon)) {
    searchHistoryData.push([city, lat, lon]);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryData));
  }
}

function displayWeather(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data);
      displayForecast(data);
    });
}

function displayCurrentWeather(data) {
  if (!data || !data.list || data.list.length === 0) {
    alert('Error displaying current weather data.');
    return;
  }

  const currentData = data.list[0];
  const date = new Date(currentData.dt * 1000);
  const icon = currentData.weather[0].icon;

  document.getElementById('city-name').textContent = data.city.name;
  document.getElementById('weather-date').textContent = date.toLocaleDateString();
  document.getElementById(
    'weather-icon'
  ).innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}.png" alt="${currentData.weather[0].description}">`;
  document.getElementById(
    'temperature'
  ).textContent = `Temperature: ${currentData.main.temp} °C (Feels like: ${currentData.main.feels_like} °C)`;
  document.getElementById('humidity').textContent = `Humidity: ${currentData.main.humidity} %`;
  document.getElementById(
    'wind-speed'
  ).textContent = `Wind Speed: ${currentData.wind.speed} m/s (Wind direction: ${currentData.wind.deg}°)`;
}

function displayForecast(data) {
  forecastContainer.innerHTML = '';

  const dailyData = data.list.filter((entry, index, array) => {
    const currentDate = new Date(entry.dt * 1000);
    const prevDate = index > 0 ? new Date(array[index - 1].dt * 1000) : null;
    return !prevDate || currentDate.getDate() !== prevDate.getDate();
  });

  for (let i = 1; i < dailyData.length; i++) {
    const entry = dailyData[i];
    const date = new Date(entry.dt * 1000);
    const icon = entry.weather[0].icon;

    const forecastCard = document.createElement('div');
    forecastCard.classList.add('forecast-card');
    forecastCard.innerHTML = `
        <h3>${date.toLocaleDateString()}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${entry.weather[0].description}">
        <p>Temperature: ${entry.main.temp} °C</p>
        <p>Wind Speed: ${entry.wind.speed} m/s</p>
        <p>Humidity: ${entry.main.humidity} %</p>
      `;
    forecastContainer.appendChild(forecastCard);
  }
}

function loadSearchHistory() {
  const searchHistoryData = JSON.parse(localStorage.getItem('searchHistory')) ?? [];

  for (let city of searchHistoryData) {
    addCityToHistory(city[0], city[1], city[2]);
  }
}
