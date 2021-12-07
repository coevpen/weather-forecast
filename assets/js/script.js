// gets the five day container to create forecast in later
var fiveDayCont = document.querySelector(".fiveDayContainer");

// gest the main section for the current forecast
var cityInfo = document.querySelector(".cityInfo");

// gets the section to create buttons dynamically
var cityBtnContainer = document.querySelector("#cityButtons");

// gets the form submission
var citySubmit = document.querySelector("#city-search");
var cityInput = document.querySelector("#city");

// API key for the weather API
var APIkey = "ac2d64855d7c13923498bf1911bc7aa8";

// gets the city name from the form and sends it to the API fetch
function citySubmitHandler(event){
    event.preventDefault();

    // get the city name
    var cityNameInput = cityInput.value.trim();

    if(cityNameInput){
        getCityData(cityNameInput);
        cityInput.value = "";
        
    }
    else{
        alert("Please enter a city name");
    }

};

// fetches the API info
function getCityData(cityNameInput){
    // formats the weather api url for current weather
    var currentDayURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityNameInput + "&appid=" + APIkey;
    // formats the weather api url for 5day forecast
    var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityNameInput + "&appid=" + APIkey;

    Promise.all([
            fetch(currentDayURL).then(response => response.json()),
            fetch(fiveDayURL).then(response => response.json())
            ])
            .then((response) => {
                console.log(response);
                displayWeather(response, cityNameInput);
            })
            .catch((error) =>{
                alert("Unable to connect to OpenWeather");
            });
   //TODO needs an 'if response.ok' else alert' somehow
};

// displays the current weather results
function displayWeather(data, cityNameInput){

};

// loads the city info from localStorage upon city button clicked
function getSavedCities(){

};


// for the form
citySubmit.addEventListener("submit", citySubmitHandler);

