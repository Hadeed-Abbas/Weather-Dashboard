const weatherAPI = "571b8fdb137965065125619aeade0bc4";
const geminiApiKey = 'AIzaSyA-zE7NCyshdC-D-vVn3XEAII2hqSX-N7s';
let currentPage = 1;
const itemsPerPage = 5;
let weatherData = [];


document.getElementById('searchBtn').addEventListener('click', searchCityWeather);

async function searchCityWeather() {
  const city = document.getElementById('city').value;
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherAPI}&units=metric`);
  const data = await response.json();

  if (data.cod !== '200') {
    alert('City not found or API error.');
    return;
  }

  weatherData = data.list.map(item => ({
    date: new Date(item.dt_txt).toLocaleDateString(),
    temperature: item.main.temp,
    weather: item.weather[0].main
  }));

  currentPage = 1;
  displayWeatherTable();
}

function displayWeatherTable() {
  const tempFilterValue = document.getElementById('tempFilter').value;
  const weatherFilterValue = document.getElementById('weatherFilter').value;

  let filteredData = [...weatherData];

  if (weatherFilterValue === 'rain') {
    filteredData = filteredData.filter(item => item.weather === 'Rain');
  }

  if (tempFilterValue === 'asc') {
    filteredData.sort((a, b) => a.temperature - b.temperature);
  } else if (tempFilterValue === 'desc') {
    filteredData.sort((a, b) => b.temperature - a.temperature);
  } else if (tempFilterValue === 'highest') {
    filteredData = [filteredData.reduce((prev, current) => (prev.temperature > current.temperature ? prev : current))];
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const tableBody = document.querySelector('#weatherForecastTable tbody');
  tableBody.innerHTML = '';

  paginatedData.forEach(item => {
    const row = `<tr>
      <td>${item.date}</td>
      <td>${item.temperature} °C</td>
      <td>${item.weather}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });

  updatePagination(filteredData.length);
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

document.getElementById('prevBtn').addEventListener('click', () => {
  currentPage--;
  displayWeatherTable();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  currentPage++;
  displayWeatherTable();
});


document.querySelector('.chatBtn').addEventListener('click', async () => {
  const input = document.querySelector('.chatInput').value;

  if (input.toLowerCase().includes("weather")) {
    const cityMatch = input.match(/in\s+(\w+)/); 
    const city = cityMatch ? cityMatch[1] : null;

    if (city) {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPI}&units=metric`);
      const weatherData = await response.json();

      if (weatherData && weatherData.main) {
        document.querySelector('.chatAnswer').textContent = `The weather in ${city} is ${weatherData.weather[0].description} at ${weatherData.main.temp}°C.`;
      } else {
        document.querySelector('.chatAnswer').textContent = "Could not fetch weather data.";
      }
    } else {
      document.querySelector('.chatAnswer').textContent = "Please specify a city.";
    }
  } else {
    document.querySelector('.chatAnswer').textContent = "I am currently able to answer weather-related queries only.";
  }
});