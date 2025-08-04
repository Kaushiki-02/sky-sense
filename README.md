# 🌤️ SkySense - Weather Forecast App

A beautiful, responsive weather application that provides real-time weather data and 5-day forecasts for any city worldwide.

## Features

- **Real-time Weather Data**: Current temperature, humidity, wind speed, pressure, and visibility
- **Air Quality Index**: Real-time air quality data with color-coded indicators
- **Weather Alerts**: Severe weather warnings and notifications *(requires paid OpenWeather API subscription)*
- **5-Day Forecast**: Extended weather predictions with daily breakdowns
- **Location Services**: Get weather for your current location with one click
- **Search History**: Quick access to recently searched cities
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Push Notifications**: Get alerts for severe weather and poor air quality
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Weather Themes**: Dynamic background colors based on weather conditions
- **Weather Animations**: Smooth, weather-based animations and transitions

## Getting Started

### Prerequisites
- A modern web browser
- OpenWeather API key (free at [openweathermap.org](https://openweathermap.org/))
- **Note**: Weather alerts require a paid OpenWeather OneCall API subscription. The free API key works for all other features.

### Installation

1. **Clone or download** this repository
2. **Get your API key**:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/)
   - Copy your API key
3. **Configure the API key**:
   - Open `apikey.js`
   - Replace the placeholder with your actual API key:
   ```javascript
   const OPEN_WEATHER_API_KEY = "your_api_key_here";
   ```
4. **Run the application**:
   - Open `index.html` in your browser, or
   - Use a local server: `python -m http.server 8000`

## Usage

- **Search for a city**: Type any city name and press Enter or click the search button
- **Use current location**: Click "Current Location" to get weather for your area
- **Toggle theme**: Click the moon/sun icon in the header
- **Toggle notifications**: Click the bell icon to enable/disable weather alerts
- **View air quality**: Check the air quality indicator in the weather details
- **View weather alerts**: Scroll down to see any active weather warnings
- **View forecast**: Scroll down to see the 5-day weather forecast
- **Access history**: Click on any city in the recent searches section
- **Enjoy animations**: Watch weather-themed animations that respond to current conditions

## Technologies Used

- **HTML5** - Structure and semantics
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Functionality and API integration
- **OpenWeather API** - Weather data
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Screenshots

The app features a clean, modern interface with:
- Gradient backgrounds that change based on weather conditions
- Intuitive search functionality
- Detailed weather information display
- Responsive design for all devices

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Kaushiki** - [GitHub Profile](https://github.com/Kaushiki-02)

---

**Star this repository if you found it helpful!**
