const URL = 'https://phonebook-24fd8.firebaseio.com/phonebook';

$('#btnLoad').click(loadData);
$('#btnCreate').click(postData);

function loadData() {
    $('#phonebook').empty();
    $.ajax({
        method: 'GET',
        url: URL + '.json'
    }).then(handleSuccess).catch(handleError);

    function handleSuccess(res) {
        for (let key in res) {
            let li = $(`<li>${res[key].name}: ${res[key].phone}</li>`);
            let anchor = $(`<a href="#"> [Delete]</a>`).click(function () {
                $.ajax({
                    method: 'DELETE',
                    url: URL + `/${key}.json`
                }).then(loadData).catch(handleError);
            });
            li.append(anchor);
            $('#phonebook').append(li);
        }
    }
}

function postData() {
    let name = $('#person').val();
    let phone = $('#phone').val();
    let postObj = JSON.stringify({name, phone});

    $.ajax({
        method: 'POST',
        url: URL + '.json',
        data: postObj,
        success: loadData,
        error: handleError
    });
    $('#person').val('');
    $('#phone').val('');
}

function handleError(err) {
    console.log(err);
}