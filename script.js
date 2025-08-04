import OPEN_WEATHER_API_KEY from "./apikey.js";

// DOM Elements
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const weatherIconMain = document.getElementById("weather-icon-main");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const feelsLike = document.getElementById("feels-like");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const forecastItems = document.getElementById("forecast-items");
const loading = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");
const weatherData = document.getElementById("weather-data");
const weatherApp = document.getElementById("weather-app");
const themeToggle = document.getElementById("theme-toggle");
const historyItems = document.getElementById("history-items");
const airQuality = document.getElementById("air-quality");
const weatherAlerts = document.getElementById("weather-alerts");
const alertsContainer = document.getElementById("alerts-container");
const notificationToggle = document.getElementById("notification-toggle");

// App State
let state = {
  weatherHistory: JSON.parse(localStorage.getItem("weatherHistory")) || [],
  isDarkMode: localStorage.getItem("weatherDarkMode") === "true",
  notificationsEnabled: localStorage.getItem("weatherNotifications") === "true",
};

// Initialize theme
if (state.isDarkMode) {
  document.body.classList.add("dark-theme");
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Initialize notifications
if (state.notificationsEnabled) {
  notificationToggle.classList.add("active");
  notificationToggle.innerHTML = '<i class="fas fa-bell"></i>';
} else {
  notificationToggle.innerHTML = '<i class="fas fa-bell-slash"></i>';
}

themeToggle.addEventListener("click", toggleTheme);
notificationToggle.addEventListener("click", toggleNotifications);
locationBtn.addEventListener("click", getWeatherByLocation);

// Get weather by geolocation
async function getWeatherByLocation() {
  showLoading();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Get city name from coordinates
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPEN_WEATHER_API_KEY}`
          );

          const data = await response.json();

          console.log(data);

          if (data.length > 0) {
            const city = data[0].name;
            cityInput.value = city;
            getWeather(city);
          } else {
            throw new Error("Location not found");
          }
        } catch (error) {
          showError(error.message || "Failed to get location");
        }
      },
      () => {
        showError("Geolocation permission denied. Please search manually.");
      }
    );
  } else {
    showError("Geolocation not supported by this browser");
  }
}

// Toggle dark/light theme
function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;

  document.body.classList.toggle("dark-theme", state.isDarkMode);

  themeToggle.innerHTML = state.isDarkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';

  localStorage.setItem("weatherDarkMode", state.isDarkMode);
}

// Toggle notifications
function toggleNotifications() {
  state.notificationsEnabled = !state.notificationsEnabled;

  if (state.notificationsEnabled) {
    notificationToggle.classList.add("active");
    notificationToggle.innerHTML = '<i class="fas fa-bell"></i>';
    
    // Request permission if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  } else {
    notificationToggle.classList.remove("active");
    notificationToggle.innerHTML = '<i class="fas fa-bell-slash"></i>';
  }

  localStorage.setItem("weatherNotifications", state.notificationsEnabled);
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city) {
    getWeather(city);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();

    if (city) {
      getWeather(city);
    }
  }
});

// Display current weather and forecast
async function getWeather(city) {
  showLoading();

  try {
    // Get current weather
    const currentWeather = await getCurrentWeather(city);

    // Add to search history
    addToSearchHistory(currentWeather.name);

    // Get forecast using coordinates from current weather
    const forecastData = await getForecast(
      currentWeather.coord.lat,
      currentWeather.coord.lon
    );

    // Get air quality data
    const airQualityData = await getAirQuality(
      currentWeather.coord.lat,
      currentWeather.coord.lon
    );

    // Get weather alerts
    const alertsData = await getWeatherAlerts(
      currentWeather.coord.lat,
      currentWeather.coord.lon
    );

    // Process and display the data
    displayWeather(currentWeather, forecastData, airQualityData, alertsData);
  } catch (error) {
    showError(error.message || "Failed to fetch weather data");
  }
}

// Add city to search history
function addToSearchHistory(city) {
  // Remove city if it already exists in history
  state.weatherHistory = state.weatherHistory.filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );

  // Add city to the beginning of the history array
  state.weatherHistory.unshift(city);

  // Limit history to 5 items
  if (state.weatherHistory.length > 5) {
    state.weatherHistory.pop();
  }

  // Save to localStorage
  localStorage.setItem("weatherHistory", JSON.stringify(state.weatherHistory));

  // Update UI
  updateSearchHistory();
}

// Update search history UI
function updateSearchHistory() {
  historyItems.innerHTML = "";

  state.weatherHistory.forEach((city) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.textContent = city;

    historyItem.addEventListener("click", () => {
      cityInput.value = city;
      getWeather(city);
    });

    historyItems.appendChild(historyItem);
  });
}

// Process and display the weather data
function displayWeather(currentData, forecastData, airQualityData, alertsData) {
  // Display current weather
  cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
  currentDate.textContent = formatDate(currentData.dt);
  weatherIconMain.innerHTML = getWeatherIcon(currentData.weather[0].id);
  temperature.textContent = `${Math.round(currentData.main.temp)}°C`;
  weatherDescription.textContent = currentData.weather[0].description;
  feelsLike.textContent = `${Math.round(currentData.main.feels_like)}°C`;
  wind.textContent = `${currentData.wind.speed} m/s`;
  humidity.textContent = `${currentData.main.humidity}%`;
  pressure.textContent = `${currentData.main.pressure} hPa`;
  visibility.textContent = `${(currentData.visibility / 1000).toFixed(1)} km`;

  // Display air quality
  displayAirQuality(airQualityData);

  // Apply weather theme
  const themeClass = getWeatherTheme(currentData.weather[0].id);
  const currentWeatherElement = document.querySelector(".current-weather");
  currentWeatherElement.className = "current-weather";

  if (themeClass) {
    currentWeatherElement.classList.add(themeClass);
  }

  // Display 5-day forecast
  displayForecast(forecastData);

  // Display weather alerts
  displayWeatherAlerts(alertsData);

  // Show the weather data section
  showWeatherData();
}

// Show weather data
function showWeatherData() {
  loading.style.display = "none";
  errorContainer.style.display = "none";
  weatherData.style.display = "block";
  
  // Add a small delay to ensure the display change is processed
  setTimeout(() => {
    weatherData.classList.add("show");
  }, 10);
}

// Display the 5-day forecast
function displayForecast(forecastData) {
  forecastItems.innerHTML = "";

  // Process forecast data (one forecast per day)
  const dailyForecasts = {};

  forecastData.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toDateString();

    if (date.getDate() !== new Date().getDate()) {
      dailyForecasts[day] = forecast;
    }
  });

  // Display up to 5 forecasts
  Object.values(dailyForecasts).forEach((forecast) => {
    const forecastItem = document.createElement("div");
    forecastItem.className = "forecast-item";

    const forecastDate = new Date(forecast.dt * 1000);
    const day = formatDay(forecast.dt);
    const date = forecastDate.getDate() + "/" + (forecastDate.getMonth() + 1);

    forecastItem.innerHTML = `
        <div class="forecast-day">${day}</div>
        <div class="forecast-date">${date}</div>
        <div class="forecast-icon">${getWeatherIcon(
          forecast.weather[0].id
        )}</div>
        <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
        <div class="forecast-description">${
          forecast.weather[0].description
        }</div>
      `;

    forecastItems.appendChild(forecastItem);
  });
}

// Format day
function formatDay(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Get weather theme class based on weather condition
function getWeatherTheme(weatherId) {
  if (weatherId >= 200 && weatherId < 300) {
    return "weather-theme-thunderstorm";
  } else if (weatherId >= 500 && weatherId < 600) {
    return "weather-theme-rain";
  } else if (weatherId >= 600 && weatherId < 700) {
    return "weather-theme-snow";
  } else if (weatherId === 800) {
    return "weather-theme-clear";
  } else if (weatherId === 801) {
    return "weather-theme-clear"; // Few clouds - still mostly clear
  } else if (weatherId >= 802 && weatherId <= 804) {
    return "weather-theme-clouds";
  }

  return "";
}

// Get weather icon class based on weather condition
function getWeatherIcon(weatherId) {
  if (weatherId >= 200 && weatherId < 300) {
    return '<i class="fas fa-bolt"></i>'; // Thunderstorm
  } else if (weatherId >= 300 && weatherId < 400) {
    return '<i class="fas fa-cloud-rain"></i>'; // Drizzle
  } else if (weatherId >= 500 && weatherId < 600) {
    return '<i class="fas fa-cloud-showers-heavy"></i>'; // Rain
  } else if (weatherId >= 600 && weatherId < 700) {
    return '<i class="fas fa-snowflake"></i>'; // Snow
  } else if (weatherId >= 700 && weatherId < 800) {
    return '<i class="fas fa-smog"></i>'; // Atmosphere
  } else if (weatherId === 800) {
    return '<i class="fas fa-sun"></i>'; // Clear sky
  } else if (weatherId === 801) {
    return '<i class="fas fa-cloud-sun"></i>'; // Few clouds
  } else if (weatherId === 802) {
    return '<i class="fas fa-cloud"></i>'; // Scattered clouds
  } else if (weatherId === 803) {
    return '<i class="fas fa-cloud"></i>'; // Broken clouds
  } else if (weatherId === 804) {
    return '<i class="fas fa-cloud"></i>'; // Overcast clouds
  } else {
    return '<i class="fas fa-cloud"></i>'; // Default fallback
  }
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

// Get current weather data
async function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      throw new Error("City not found");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Get 5-day forecast data
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}

// Show loading indicator
function showLoading() {
  loading.style.display = "flex";
  errorContainer.style.display = "none";
  weatherData.style.display = "none";
  weatherData.classList.remove("show");
}

// Show error message
function showError(message) {
  loading.style.display = "none";
  errorContainer.style.display = "flex";
  weatherData.style.display = "none";
  weatherData.classList.remove("show");
  errorMessage.textContent = message;
}

// Get air quality data
async function getAirQuality(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "404") {
      throw new Error("Air quality data not available");
    }

    return data;
  } catch (error) {
    console.warn("Failed to fetch air quality data:", error);
    return null;
  }
}

// Get weather alerts
async function getWeatherAlerts(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${OPEN_WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    
    // Check if the response is not ok (401, 403, etc.)
    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Weather alerts require a paid OpenWeather API subscription");
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.cod === "404") {
      throw new Error("Weather alerts not available");
    }

    return data;
  } catch (error) {
    console.warn("Failed to fetch weather alerts:", error.message);
    return null;
  }
}

// Display air quality
function displayAirQuality(airQualityData) {
  if (!airQualityData || !airQualityData.list || !airQualityData.list[0]) {
    airQuality.textContent = "N/A";
    airQuality.className = "";
    return;
  }

  const aqi = airQualityData.list[0].main.aqi;
  const aqiText = getAQIText(aqi);
  const aqiClass = getAQIClass(aqi);

  airQuality.textContent = aqiText;
  airQuality.className = aqiClass;

  // Show notification for poor air quality
  if (aqi >= 4 && state.notificationsEnabled) {
    showNotification("Poor Air Quality Alert", `Air quality is ${aqiText.toLowerCase()} in your area.`);
  }
}

// Display weather alerts
function displayWeatherAlerts(alertsData) {
  if (!alertsData) {
    alertsContainer.innerHTML = `
      <div class="no-alerts">
        <i class="fas fa-info-circle"></i>
        <p>Weather alerts require a paid OpenWeather subscription</p>
      </div>
    `;
    return;
  }
  
  if (!alertsData.alerts || alertsData.alerts.length === 0) {
    alertsContainer.innerHTML = `
      <div class="no-alerts">
        <i class="fas fa-check-circle"></i>
        <p>No weather alerts for this location</p>
      </div>
    `;
    return;
  }

  alertsContainer.innerHTML = "";

  alertsData.alerts.forEach((alert) => {
    const alertItem = document.createElement("div");
    alertItem.className = `alert-item ${getAlertSeverity(alert.severity)}`;

    const alertTime = new Date(alert.start * 1000);
    const formattedTime = alertTime.toLocaleString();

    alertItem.innerHTML = `
      <div class="alert-header">
        <i class="fas fa-exclamation-triangle alert-icon"></i>
        <div class="alert-title">${alert.event}</div>
      </div>
      <div class="alert-description">${alert.description}</div>
      <div class="alert-time">Effective: ${formattedTime}</div>
    `;

    alertsContainer.appendChild(alertItem);

    // Show notification for severe alerts
    if (alert.severity === "Extreme" && state.notificationsEnabled) {
      showNotification("Severe Weather Alert", alert.event);
    }
  });
}

// Get AQI text based on index
function getAQIText(aqi) {
  switch (aqi) {
    case 1:
      return "Good";
    case 2:
      return "Fair";
    case 3:
      return "Moderate";
    case 4:
      return "Poor";
    case 5:
      return "Very Poor";
    default:
      return "Unknown";
  }
}

// Get AQI CSS class based on index
function getAQIClass(aqi) {
  switch (aqi) {
    case 1:
      return "aqi-good";
    case 2:
      return "aqi-moderate";
    case 3:
      return "aqi-unhealthy-sensitive";
    case 4:
      return "aqi-unhealthy";
    case 5:
      return "aqi-very-unhealthy";
    default:
      return "";
  }
}

// Get alert severity class
function getAlertSeverity(severity) {
  switch (severity) {
    case "Extreme":
      return "severe";
    case "Severe":
      return "severe";
    case "Moderate":
      return "moderate";
    case "Minor":
      return "info";
    default:
      return "info";
  }
}

// Show browser notification
function showNotification(title, body) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "🌤️" });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body, icon: "🌤️" });
      }
    });
  }
}

// Request notification permission on app load
document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});