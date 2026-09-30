// =============================================
// 1. SETTINGS
// =============================================
const apiKey = "662a9080ea546850dc2d99b4df476ffd";


// =============================================
// 2. GRAB THE HTML ELEMENTS WE NEED
// =============================================
const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");


// =============================================
// 3. WHEN THE USER SUBMITS THE FORM...
// =============================================
form.addEventListener("submit", e => {
    e.preventDefault(); // stop the page from reloading

    let inputVal = input.value.trim();
    if (inputVal === "") return;

    // Ensuring only a single request per city
    //1
    const listItems = list.querySelectorAll(".ajax-section .city");
    const listItemsArray = Array.from(listItems);
    if (listItemsArray.length > 0) {
        //2
        const filteredArray = listItemsArray.filter(el => {
            let content = "";
            //athens,gr
            if (inputVal.includes(",")) {
                //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
                if (inputVal.split(",")[1].length > 2) {
                    inputVal = inputVal.split(",")[0];
                    content = el.querySelector(".city-name span").textContent.toLowerCase();
                } else {
                    content = el.querySelector(".city-name").dataset.name.toLowerCase();
                }
            } else {
                //athens
                content = el.querySelector(".city-name span").textContent.toLowerCase();
            }
            return content == inputVal.toLowerCase();
        });

        //3
        if (filteredArray.length > 0) {
            msg.textContent = `You already know the weather for ${
                filteredArray[0].querySelector(".city-name span").textContent
            } ...otherwise be more specific by providing the country code as well`;
            form.reset();
            input.focus();
            return;
        }
    }

    getWeather(inputVal);
});


// =============================================
// 4. FUNCTIONS
// =============================================

// Ask the OpenWeather API for the weather in a city
function getWeather(city) {
    // Backticks (`) are needed so ${...} gets replaced with the real values
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // The API answers with cod 200 when the city was found
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            showCity(data);
            resetForm();
        })
        .catch(() => {
            msg.textContent = "Please search for a valid city";
        });
}

// Build a city card from the API data and add it to the page
function showCity(data) {
    const { main, name, sys, weather } = data;
    const icon = `https://openweathermap.org/img/wn/${weather[0]["icon"]}@2x.png`;

    const li = document.createElement("li");
    li.classList.add("city");
    li.innerHTML = `
        <h2 class="city-name" data-name="${name},${sys.country}">
            <span>${name}</span>
            <sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
            <img class="city-icon" src="${icon}" alt="${weather[0]["main"]}">
            <figcaption>${weather[0]["description"]}</figcaption>
        </figure>
    `;

    list.appendChild(li);
}

// Clear the message and the input so the user can search again
function resetForm() {
    msg.textContent = "";
    form.reset();
    input.focus();
}
