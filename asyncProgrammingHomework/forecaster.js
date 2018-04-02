function forecast() {
    $('#submit').click(requestWeather);

    function requestWeather() {
        $('#forecast').css('display', 'none');

        $.ajax({
            method: 'GET',
            url: `https://judgetests.firebaseio.com/locations.json`
        }).then(getWeather).catch(handleError);

        function getWeather(res) {
            let location = $('#location');
            let obj = res.filter(a => a.name === location.val())[0];
            $.ajax({
                method: 'GET',
                url: `https://judgetests.firebaseio.com/forecast/today/${obj.code}.json`
            }).then(getCurrentWeather).catch(handleError);

            $.ajax({
                method: 'GET',
                url: `https://judgetests.firebaseio.com/forecast/upcoming/${obj.code}.json`
            }).then(getUpcomingWeather).catch(handleError);

            function getCurrentWeather(response) {
                $('#forecast').css('display', 'block');
                let current = $('#current');
                current.empty();
                current.append($(`<div class="label">Current conditions</div>`));
                let icon = $(`<span class="condition symbol">${getWeatherIcon(response.forecast.condition)}</span>`);

                let weather = $(`<span class="condition"></span>`);
                let loc = $(`<span class="forecast-data">${response.name}</span>`);
                let degrees = $(`<span class="forecast-data">${response.forecast.low}&#176;/${response.forecast.high}&#176;</span>`);
                let condition = $(`<span class="forecast-data">${response.forecast.condition}</span>`);
                weather.append(loc).append(degrees).append(condition);

                current.append(icon).append(weather);

            }

            function getUpcomingWeather(response) {
                let upcoming = $('#upcoming');
                upcoming.empty();
                upcoming.append($('<div class="label">Three-day forecast</div>'));

                for (let day of response.forecast) {
                    let weather = $(`<span class="upcoming"></span>`);
                    let symbol = $(`<span class="symbol">${getWeatherIcon(day.condition)}</span>`);
                    let degrees = $(`<span class="forecast-data">${day.low}&#176;/${day.high}&#176;</span>`);
                    let condition = $(`<span class="forecast-data">${day.condition}</span>`);
                    weather.append(symbol).append(degrees).append(condition);
                    upcoming.append(weather);
                }

            }

            function getWeatherIcon(condition) {
                switch (condition) {
                    case 'Sunny':
                        return '&#x2600;';
                    case 'Partly sunny':
                        return '&#x26C5;';
                    case 'Rain':
                        return '&#x2614;';
                    case 'Overcast':
                        return '&#x2601;';
                }
            }

        }
    }

    function handleError(err) {
        $('#forecast').text('Error');
        $('#forecast').css('display', 'block');
    }
}