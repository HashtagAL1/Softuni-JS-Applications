function attachEvents() {
    $('#btnLoad').click(getPhones);
    $('#btnCreate').click(addPhone);

    function getPhones() {
        $.ajax({
            method: 'GET',
            url: `https://phonebook-nakov.firebaseio.com/phonebook.json`
        }).then(listPhones).catch(handleError);

        function listPhones(res) {
            $('#phonebook').empty();
            for (let r of Object.keys(res)) {
                let li = $(`<li>${res[r].person}: ${res[r].phone} </li>`)
                    .append($(`<button>[Delete]</button>`)
                        .click(function () {
                    $.ajax({
                        method: 'DELETE',
                        url: `https://phonebook-nakov.firebaseio.com/phonebook/${r}.json`
                    }).then(() => li.remove()).catch(handleError)
                }));
                $('#phonebook').append(li);
            }
        }
    }

    function addPhone() {
        let person = $('#person');
        let phone = $('#phone');
        let obj = JSON.stringify({person: person.val(), phone: phone.val()});
        person.val('');
        phone.val('');

        $.ajax({
            method: 'POST',
            url: `https://phonebook-nakov.firebaseio.com/phonebook.json`,
            data: obj
        }).then(getPhones).catch(handleError);
    }

    function handleError(err) {
        console.log(err);
    }

}