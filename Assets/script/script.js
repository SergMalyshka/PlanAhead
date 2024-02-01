var getWeatherEl = document.querySelector("#getWeather");
var desiredCityEl = document.querySelector('#cityName');
var desiredStateEl = document.querySelector("#stateName")
var currentWeatherEl = document.querySelector("#current-weather-header");
var currentWeatherContainer = document.querySelector("#current-weather")
var currentIconEl = document.querySelector("#currentIcon")
var currentTempEl = document.querySelector("#currentTemp")
var currentWindEl = document.querySelector("#currentWind")
var currentHumidityEl = document.querySelector("#currentHumidity")
var accordionOneEl = document.querySelector("#accordion1")
var accordionTwoEl = document.querySelector("#accordion2")
var accordionThreeEl = document.querySelector("#accordion3")
var accordionFourEl = document.querySelector("#accordion4")
var accordionFiveEl = document.querySelector("#accordion5")
var accordionTextOneEl = document.querySelector("#accordionTextOne")
var accordionTextTwoEl = document.querySelector("#accordionTextTwo")
var accordionTextThreeEl = document.querySelector("#accordionTextThree")
var accordionTextFourEl = document.querySelector("#accordionTextFour")
var accordionTextFiveEl = document.querySelector("#accordionTextFive")
var historyEl = document.querySelector("#history-dropdown")
var accordionEl = document.querySelector("#accordionContainer")
var desiredCity;
var desiredState;
var searchHistory = [];

var apiKey = "1325bc4f5031686d59bdabda6b2bdf15"
var currentCity;

//render search history on page load
renderHistory();

//populates history dropdown
function renderHistory() {
    //start fresh to avoid repeat items
    historyEl.innerHTML = "";
    searchHistory = JSON.parse(localStorage.getItem("history"))

    //if history is null, add a list item notifying the user that they need to perform a search to add mroe items there
    if (searchHistory === null) {
        var historyTooltip = document.createElement("li")
        historyTooltip.textContent = "Search cities to add them to this list"
        historyTooltip.classList.add("dropdown-item");
        historyEl.appendChild(historyTooltip);
    } else {
        //otherwise, for each item in the history, create a new item
        for (var i = 0; i < searchHistory.length; i++) {
            var searchListItem = document.createElement("li");
            searchListItem.textContent = searchHistory[i];
            searchListItem.classList.add("dropdown-item")

            //and add an event listner to it to render weather data for that city
            searchListItem.addEventListener("click", function(event) {
                desiredCity = event.target.textContent;
                //geoCode (entry point for the workflow and all fetches)
                geoCode(event.target.textContent)
            })

            //add li to the history drop down
            historyEl.appendChild(searchListItem)
        }
    }
}

//converting user input into a object with lat and lon attributes used in get weather function
function geoCode(city) {

    //dynamic building of the request url
    var apiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=' + apiKey;
    var encodedUrl = encodeURI(apiUrl);

    //fetch request
    fetch(encodedUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                //trying to match the 5 possible response cities with a state specified by the user
                currentCity = checkContaining(data)
                //move on to getting weather for that location
                getWeather(currentCity);
            });
        }
    });
}

//geoCode returns 5 cities, trying to match each of these with a desired state if provided
function checkContaining(data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].state === desiredState) {
            return data[i];
        }
    }
    //if no state is provided, or if no matches are found, the default (largest) city is selected
    return data[0]
}

//get weather for the city returned by geocoder
function getWeather(city) {

    //dynamic building of the fetch URL
    var lat = city.lat;
    var lon = city.lon;
    var fetchUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial";

    fetch(fetchUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                //display the data 
                displayWeatherInfo(data);
            });
        }
    });
}

//populate the man current weather in location
function displayWeatherInfo(data) {
    //new dayjs object to use todays date, and later in populating accordions
    var timeNow = dayjs();

    //render todays weather
    //display the current weather element
    currentWeatherContainer.setAttribute("style", "display:inline");
    currentWeatherEl.textContent = "Current Weather in " + desiredCity + " on " + timeNow.format('dddd, MMMM D, YYYY');

    //grab the icon representing the weather condition and add it to the display, as well as temp, wind and humidity
    var iconUlr = "http://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png";
    currentIconEl.setAttribute("src", iconUlr);
    currentTempEl.textContent = "Temperature: " + data.list[0].main.temp + "°F";
    currentWindEl.textContent = "Wind: " + data.list[0].wind.speed + " MPH";
    currentHumidityEl.textContent = "Humidity is " + data.list[0].main.humidity + "%";

    //create 5 accordion headers based of todays day
    accordionOneEl.textContent = timeNow.add(1, "day").format('dddd, MMMM D, YYYY');
    accordionTwoEl.textContent = timeNow.add(2, "day").format('dddd, MMMM D, YYYY');
    accordionThreeEl.textContent = timeNow.add(3, "day").format('dddd, MMMM D, YYYY');
    accordionFourEl.textContent = timeNow.add(4, "day").format('dddd, MMMM D, YYYY');
    accordionFiveEl.textContent = timeNow.add(5, "day").format('dddd, MMMM D, YYYY');

    accordionEl.setAttribute("style", "display:inline")
    
    //popiulate accordion data with the provided info
    populateAccordion(accordionTextOneEl, data.list[8]);
    populateAccordion(accordionTextTwoEl, data.list[16])
    populateAccordion(accordionTextThreeEl, data.list[24]);
    populateAccordion(accordionTextFourEl, data.list[32])
    populateAccordion(accordionTextFiveEl, data.list[39]);

}

//function to populate each accordion
function populateAccordion(accordion, weatherData) {
    //inner html at blank to successfully render new searches
    accordion.innerHTML = "";

    //grab the image representing condtions, add it to the element
    var img = document.createElement("img");
    var iconUlr = "http://openweathermap.org/img/w/" + weatherData.weather[0].icon + ".png";
    img.setAttribute('src', iconUlr);
    accordion.appendChild(img);

    //create an unordered list and list items for temp, wind and humidity
    var unorderedList = document.createElement("ul");
    var tempElement = document.createElement("li");
    var windElement = document.createElement('li');
    var humidityElement = document.createElement('li');

    //dynamically populat them with info provided
    tempElement.textContent = "Temperature: " + weatherData.main.temp + "°F";
    windElement.textContent = "Wind: " + weatherData.wind.speed + " MPH";
    humidityElement.textContent = "Humidity is " + weatherData.main.humidity + "%";


    //append them to the ul
    unorderedList.appendChild(tempElement);
    unorderedList.appendChild(windElement);
    unorderedList.appendChild(humidityElement);

    //append ul to the accordion
    accordion.appendChild(unorderedList);
}

//adding event listener to the main get weather button
getWeatherEl.addEventListener("click", function (event) {
    //do not refresh the page
    event.preventDefault();
    
    //grab the city and state names if provided
    desiredCity = desiredCityEl.value.trim();
    desiredState = desiredStateEl.value.trim();

    //geoCode for that city (entry point for the workflow and all fetches)
    geoCode(desiredCity);

    //grabbing history from local storage
    searchHistory = JSON.parse(localStorage.getItem("history"))

    //if null, new array, add most research city to array, and save to local storage
    if (searchHistory === null) {
        searchHistory = [];
        searchHistory.push(desiredCity)
        localStorage.setItem("history", JSON.stringify(searchHistory))
    } else {
        //otherwise
        //if local storage does NOT contain the most recent search
        if (!searchHistory.includes(desiredCity)){
                //add it
                searchHistory.push(desiredCity);
                localStorage.setItem("history", JSON.stringify(searchHistory))
                //render history drop down again to present the most recent data
                renderHistory();
        }
    }
})
