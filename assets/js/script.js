// gest the main section for the current forecast
var cityInfoEl = document.querySelector("#cityInfo");

// gets the section to create buttons dynamically
var cityBtnContainer = document.querySelector("#cityButtons");

// gets the form submission
var citySubmit = document.querySelector("#city-search");
var cityInput = document.querySelector("#city");

// API key for the weather API
var APIkey = "ac2d64855d7c13923498bf1911bc7aa8";

// gets in the high scores or starts a new array if none
var cityInfoSaved = JSON.parse(localStorage.getItem("cities")) ?? [];

// gets the city name from the form and sends it to the API fetch
function citySubmitHandler(event){
    event.preventDefault();

    // get the city name
    var cityNameInput = cityInput.value.trim();

    if(cityNameInput){
        cityInfoEl.textContent = "";
        getCityData(cityNameInput);
        cityInput.value = "";
        
    }

};

// fetches the API info
function getCityData(cityNameInput){
    // formats the weather api url for current weather
    var currentDayURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityNameInput + "&units=imperial" + "&appid=" + APIkey;
   
    // fetches th current weather
    fetch(currentDayURL).then(function(response){
        //if successful
        if(response.ok){
            response.json().then(function(response){
                // sets the latitude and longitude for the second fetch request to get daily weather
                let lon = response.coord.lon;
                let lat = response.coord.lat;

                // formats the weather api url for 5day forecast
                var fiveDayURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly&units=imperial&appid=" + APIkey;
                
                // fetches the daily weather and places it together in the promise
                fetch(fiveDayURL).then(function(nextResponse){
                    if(nextResponse.ok){
                        nextResponse.json().then(function(nextResponse){
                            Promise.all([response, nextResponse]).then(function(values){
                                // calls the setWeather function
                                displayWeather(values, cityNameInput);
                            });
                        });
                    }
                })
            });
        }
    });
};

// displays the current weather results
function displayWeather(data, cityNameInput){
    // adds the styling to the box so a border isn't showing on a blank page
    cityInfoEl.classList.add("card");

    // puts city in array and saves current array to localStorage
    cityInfoSaved.push(data);
    localStorage.setItem("cities", JSON.stringify(data));

    // creates a city object with the needed information
    let city =
    {
        cityName: data[0].name,
        temperature: data[0].main.temp,
        windSpeed: data[0].wind.speed,
        humidity: data[0].main.humidity,
        uvIndex: data[1].current.uvi,
        cloudInfo: data[0].weather[0].description
    };

    console.log(data);

    // to display current weather in main container
    var nameH3 = document.createElement("h3");
    nameH3.textContent = city.cityName;
    cityInfoEl.appendChild(nameH3); 
    
    var infoUL = document.createElement("ul");
    cityInfoEl.appendChild(infoUL);

    var infoLiTemp = document.createElement("li");
    var infoLiWind = document.createElement("li");
    var infoLiHumid = document.createElement("li");
    var infoLiUv = document.createElement("li");

    infoLiTemp.innerHTML = "Temp: " + city.temperature + "℉";
    infoLiWind.textContent = "Wind: " + city.windSpeed + " MPH";
    infoLiHumid.textContent = "Humidity: " + city.humidity + "%";
    infoLiUv.innerHTML = "UV Index: " + "<span id='colorCode'> " + city.uvIndex + " </span>";

    infoUL.appendChild(infoLiTemp);
    infoUL.appendChild(infoLiWind );
    infoUL.appendChild(infoLiHumid);
    infoUL.appendChild(infoLiUv);

    // UV index color coding: favorable/moderate/severe
    var severity = parseInt(city.uvIndex);
    var colorCode = document.querySelector("#colorCode");
    if(severity < 2){
        colorCode.setAttribute("style", "background-color: rgba(145, 238, 150, 0.781);");
    }
    else if(severity > 2  && severity < 6){
        colorCode.setAttribute("style", "background-color: rgba(255, 251, 36, 0.781);");
    }
    else{
        colorCode.setAttribute("style", "background-color: rgba(255, 82, 82, 0.863);");
    }

    var fiveDayH3 = document.querySelector(".belowForecast");
    fiveDayH3.innerHTML = "<h3>5-Day Forecast:<h3><div class='fiveDayContainer row justify-space-between'>";
    // gets the five day container to create forecast in later
    var fiveDayContainer = document.querySelector(".fiveDayContainer");

    // to display the five-day forecast
    for(var i = 0; i < 5; i++){
        var div = document.createElement("div");
        div.className = "card";
        div.classList.add("fiveDay");

        var dailyDate = document.createElement("h3");
        dailyDate.textContent = "Placeholder Date"; 
        div.appendChild(dailyDate);

        var dailyUL = document.createElement("ul");
        var dailyLiTemp = document.createElement("li");
        var dailyLiWind = document.createElement("li");
        var dailyLiHumid = document.createElement("li");

        dailyLiTemp.textContent = "Temp: " + data[1].daily[i].temp.day + "℉";
        dailyLiWind.textContent = "Wind: " + data[1].daily[i].wind_speed + " MPH";
        dailyLiHumid.textContent = "Humidity: " + data[1].daily[i].humidity + "%";

        dailyUL.appendChild(dailyLiTemp);
        dailyUL.appendChild(dailyLiWind);
        dailyUL.appendChild(dailyLiHumid);


        div.appendChild(dailyUL);



        // displays the div
        fiveDayContainer.appendChild(div);
    }
};


// for the form
citySubmit.addEventListener("submit", citySubmitHandler);


//TODO: Add the icons and dates
//TODO: Add the buttons