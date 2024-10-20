const API_KEY = "571b8fdb137965065125619aeade0bc4";

const cityInput = document.querySelector("#city");
const getWeatherBtn = document.querySelector("#searchBtn");
const cityNameDisplay = document.querySelector("#cityName");
const temperatureDisplay = document.querySelector("#temperature");
const humidityDisplay = document.querySelector("#humidity");
const windSpeedDisplay = document.querySelector("#windSpeed");
const weatherDescriptionDisplay = document.querySelector("#weatherDescription");
const weatherIcon = document.querySelector("#weatherIcon");
const forecastContainer = document.querySelector("#forecastContent");

getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
    get5DayForecast(city);
  } else {
    alert("Please enter a city name.");
  }
});

async function getWeatherData(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    handleError(error.message);
  }
}

async function get5DayForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayForecastData(data);
  } catch (error) {
    handleError(error.message);
  }
}

function displayWeatherData(data) {
  cityNameDisplay.textContent = data.name;
  temperatureDisplay.textContent = `${data.main.temp.toFixed(1)} °C`;
  humidityDisplay.textContent = `${data.main.humidity}%`;
  windSpeedDisplay.textContent = `${data.wind.speed.toFixed(1)} m/s`;
  weatherDescriptionDisplay.textContent = data.weather[0].description;

  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.src = iconUrl;
  weatherIcon.style.display = "block";
  weatherIcon.style.width = "100px";  
  weatherIcon.style.height = "100px"; 
  weatherIcon.style.objectFit = "contain";
  weatherIcon.style.margin = "0 auto";

  setWeatherBackground(data.weather[0].main);
}

function setWeatherBackground(weatherCondition) {
  const weatherWidget = document.querySelector('.weatherWidget');
  switch (weatherCondition.toLowerCase()) {
    case 'rain':
      weatherWidget.style.backgroundImage = "url('images/rainy.jpg')";
      break;
    case 'clear':
      weatherWidget.style.backgroundImage = "url('images/sunny.jpg')";
      break;
    case 'clouds':
      weatherWidget.style.backgroundImage = "url('images/cloudy.jpg')";
      break;
    case 'snow':
      weatherWidget.style.backgroundImage = "url('images/snowy.jpg')";
      break;
    case 'drizzle':
      weatherWidget.style.backgroundImage = "url('images/drizzle.jpg')";
      break;
  }
  weatherWidget.style.backgroundSize = "cover";
  weatherWidget.style.backgroundPosition = "center";
}

function displayForecastData(data) {
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter(entry => entry.dt_txt.includes("12:00:00"));

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const temp = `${day.main.temp.toFixed(1)} °C`;
    const description = day.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecastCard");
    forecastCard.innerHTML = `
      <h4>${date}</h4>
      <img src="${iconUrl}" alt="${description}">
      <p><strong>${temp}</strong></p>
      <p>${description}</p>
    `;
    forecastContainer.appendChild(forecastCard);
  });

  createOrUpdateCharts(data);
}

function handleError(message) {
  alert(message);
}

let barChart, doughnutChart, lineChart;

function createOrUpdateCharts(data) {
  const dailyData = data.list.filter(entry => entry.dt_txt.includes("12:00:00"));
  const temperatures = dailyData.map(entry => entry.main.temp);
  const dates = dailyData.map(entry => new Date(entry.dt_txt).toLocaleDateString());

  const barChartCtx = document.getElementById('barChart').getContext('2d');
  if (barChart) {
    barChart.data.labels = dates;
    barChart.data.datasets[0].data = temperatures;
    barChart.update();
  } else {
    barChart = new Chart(barChartCtx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  const avgHumidity = (dailyData.reduce((sum, entry) => sum + entry.main.humidity, 0) / dailyData.length).toFixed(1);
  const avgWindSpeed = (dailyData.reduce((sum, entry) => sum + entry.wind.speed, 0) / dailyData.length).toFixed(1);
  
  const doughnutChartCtx = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutChart) {
    doughnutChart.data.datasets[0].data = [avgHumidity, avgWindSpeed];
    doughnutChart.update();
  } else {
    doughnutChart = new Chart(doughnutChartCtx, {
      type: 'doughnut',
      data: {
        labels: ['Humidity (%)', 'Wind Speed (m/s)'],
        datasets: [{
          data: [avgHumidity, avgWindSpeed],
          backgroundColor: ['#FF6384', '#36A2EB'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  const lineChartCtx = document.getElementById('lineChart').getContext('2d');
  if (lineChart) {
    lineChart.data.labels = dates;
    lineChart.data.datasets[0].data = temperatures;
    lineChart.update();
  } else {
    lineChart = new Chart(lineChartCtx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: 'rgba(153, 102, 255, 1)',
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
