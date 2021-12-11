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

// gets the search buttons
var searchBtnEL = document.querySelector(".searchBtn");

// gets the city name from the form and sends it to the API fetch
function citySubmitHandler(event){
    event.preventDefault();

    // get the city name
    var cityNameInput = cityInput.value.trim();

    if(cityNameInput){
        // calls getCityData to fetch the info from the API
        getCityData(cityNameInput);
    }

};

// fetches the API info
function getCityData(cityNameInput){
    // clears the containers so there's no duplication
    cityInfoEl.textContent = "";
    cityInput.value = "";

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
                                displayWeather(values);
                            });
                        });
                    }
                })
            });
        }
    });
};

// displays the current weather results
function displayWeather(data){
    // adds the styling to the box so a border isn't showing on a blank page
    cityInfoEl.classList.add("card");
   
    // creates a city object with the needed information
    let city =
    {
        cityName: data[0].name,
        temperature: data[0].main.temp,
        windSpeed: data[0].wind.speed,
        humidity: data[0].main.humidity,
        uvIndex: data[1].current.uvi,
        cloudInfo: data[0].weather[0].description,
        weatherIcon: data[0].weather[0].icon
    };

    // if new city, puts city in array and saves current array to localStorage
    if(!cityInfoSaved.includes(city.cityName)){
        cityInfoSaved.push(city.cityName);
        localStorage.setItem("cities", JSON.stringify(cityInfoSaved));
            
        // creates a button for the search history. User can click on the button to make a new weather call
        searchHistoryBtns(city.cityName);
    }

    // grabs the current date: sends the data, filler number, 1 to indicate it's the current weather
    var currDate = getTheDate(data, 0, 1);
    currDateStr = currDate.toString();

    /* to display current weather in main container
        create an h3 for the city name/date
    */
    var nameH3 = document.createElement("h3");
    nameH3.textContent = city.cityName + ": (" + currDateStr + ")";
    cityInfoEl.appendChild(nameH3); 

    // creates the weather icon
    var weatherIconURL = "http://openweathermap.org/img/wn/" + city.weatherIcon + ".png";
    var currIconImgEl = document.createElement("img");
    currIconImgEl.className = "icon";
    currIconImgEl.setAttribute("src", weatherIconURL); 
    currIconImgEl.setAttribute("alt", city.cloudInfo);
    cityInfoEl.appendChild(currIconImgEl);
    
    // creates the unordered list for the information
    var infoUL = document.createElement("ul");
    cityInfoEl.appendChild(infoUL);

    // creates the weather info list and adds their information
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

    // creates the 5-day forecast container
    var fiveDayH3 = document.querySelector(".belowForecast");
    fiveDayH3.innerHTML = "<h3>5-Day Forecast:<h3><div class='fiveDayContainer row justify-space-between'>";
    // gets the five day container to create forecast in later
    var fiveDayContainer = document.querySelector(".fiveDayContainer");

    // to display the five-day forecast
    for(var i = 1; i < 6; i++){
        //creates the div for a day
        var div = document.createElement("div");
        div.className = "card";
        div.classList.add("fiveDay");

        // grabs the date 
        var dailyDate = getTheDate(data, i, 0);
        dailyDateStr = dailyDate.toString();
        

        // grabs the icon and gives it it's attributes
        var dailyIcon = data[1].daily[i].weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + dailyIcon + ".png";
        var iconImgEl = document.createElement("img");
        iconImgEl.className = "icon";
        iconImgEl.setAttribute("src", iconURL); 
        iconImgEl.setAttribute("alt", data[1].daily[i].weather[0].description);

        // creates and sets the date + adds the weather icon after
        var dailyDate = document.createElement("h3");
        dailyDate.textContent = dailyDateStr; 
        div.appendChild(dailyDate);
        div.appendChild(iconImgEl);

        // creates the unordered list to add the weather info
        var dailyUL = document.createElement("ul");
        var dailyLiTemp = document.createElement("li");
        var dailyLiWind = document.createElement("li");
        var dailyLiHumid = document.createElement("li");

        dailyLiTemp.textContent = "Temp: " + data[1].daily[i].temp.day + "℉";
        dailyLiWind.textContent = "Wind: " + data[1].daily[i].wind_speed + " MPH";
        dailyLiHumid.textContent = "Humidity: " + data[1].daily[i].humidity + "%";

        // places it all on the screen
        dailyUL.appendChild(dailyLiTemp);
        dailyUL.appendChild(dailyLiWind);
        dailyUL.appendChild(dailyLiHumid);
        div.appendChild(dailyUL);

        // displays the div
        fiveDayContainer.appendChild(div);
    }
};

// gets the date based on the data received
function getTheDate(data, i, currOrDaily){

    if(currOrDaily === 1){
        // it is the current weather date
        var infoTime = data[0].dt;
    }
    else{ //it is the daily weather date
        var infoTime = data[1].daily[i].dt;
    }

    // converts the date received for readability
    var theDate = new Date(infoTime * 1000);
    const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    var theMonth = months[theDate.getMonth()];
    var theDay = theDate.getDate();
    var theYear = theDate.getFullYear();

    var theFullDate = theMonth + "/" + theDay + "/" + theYear;

    return theFullDate;
};

function searchHistoryBtns(cityName){
    searchBtn = document.createElement("button");
    searchBtn.setAttribute("data-city", cityName);
    searchBtn.setAttribute("onclick", "getCityData('" + cityName + "')");
    searchBtn.className = "cityBtn";
    searchBtn.textContent = cityName;

    cityBtnContainer.appendChild(searchBtn);

}

window.addEventListener('load', (event) => {
    for(var i = 0; i < cityInfoSaved.length; i++){
        searchHistoryBtns(cityInfoSaved[i]);
    }
});

// for the form
citySubmit.addEventListener("submit", citySubmitHandler);


//TODO: get buttons to work