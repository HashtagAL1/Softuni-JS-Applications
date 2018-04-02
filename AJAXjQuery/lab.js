function loadTitle() {
    $('#text').load('text.html');
}

function loadRepos() {
    $('#repos').empty();
    $.ajax({
        method: 'GET',
        url: 'https://api.github.com/users/' + $('#username').val() + '/repos',
        success: handleSuccess,
        error: handleError
    });

    function handleSuccess(res) {
        for (let repo of res) {
            let li = $('<li>').append(`<a href="${repo.html_url}">${repo.full_name}</a>`);
            $('#repos').append(li);
        }
    }

    function handleError(err) {
        console.log(err);
    }
}