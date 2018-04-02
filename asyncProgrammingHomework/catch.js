function fisherGame() {
    const URL = `https://baas.kinvey.com/appdata/kid_SyJZX0v9f/biggestCatches`;
    const USERNAME = 'nasko';
    const PASSWORD = 'nasko';
    const BASE64 = btoa(`${USERNAME}:${PASSWORD}`);
    const AUTH = {'Authorization': `Basic ${BASE64}`};

    $('.load').click(loadCatches);
    $('.add').click(addCatch);

    function loadCatches() {
        $.ajax({
            method: 'GET',
            url: URL,
            headers: AUTH
        }).then(listAllCatches).catch(handleError);

        function listAllCatches(res) {
            let catches = $('#catches');
            catches.empty();

            for (let c of res) {
                let innerDiv = $(`<div class="catch" data-id="${c._id}"></div>`);
                innerDiv.append($(`<label>Angler</label>`));
                innerDiv.append($(`<input type="text" class="angler" value="${c.angler}">`));
                innerDiv.append($(`<label>Weight</label>`));
                innerDiv.append($(`<input type="number" class="weight" value="${c.weight}">`));
                innerDiv.append($(`<label>Species</label>`));
                innerDiv.append($(`<input type="text" class="species" value="${c.species}">`));
                innerDiv.append($(`<label>Location</label>`));
                innerDiv.append($(`<input type="text" class="location" value="${c.location}">`));
                innerDiv.append($(`<label>Bait</label>`));
                innerDiv.append($(`<input type="text" class="bait" value="${c.bait}">`));
                innerDiv.append($(`<label>Capture Time</label>`));
                innerDiv.append($(`<input type="number" class="captureTime" value="${c.captureTime}">`));

                let updateBtn = $('<button class="update">Update</button>');
                let deleteBtn = $('<button class="delete">Delete</button>');

                updateBtn.click(updateCatch);
                deleteBtn.click(deleteCatch);
                innerDiv.append(updateBtn).append(deleteBtn);

                function updateCatch() {

                    let obj = JSON.stringify({
                        'angler': catches.find('.angler').val(),
                        'weight': Number(catches.find('.weight').val()),
                        'species': catches.find('.species').val(),
                        'location': catches.find('.location').val(),
                        'bait': catches.find('.bait').val(),
                        'captureTime': Number(catches.find('.captureTime').val())
                    });

                    $.ajax({
                        method: 'PUT',
                        url: `${URL}/${c._id}`,
                        headers: {'Authorization': `Basic ${BASE64}`, 'COntent-Type': 'application/json'},
                        data: obj
                    }).then(loadCatches).catch(handleError);

                }

                function deleteCatch() {
                    $.ajax({
                        method: 'DELETE',
                        url: `${URL}/${c._id}`,
                        headers: {'Authorization': `Basic ${BASE64}`, 'Content-Type': 'application/json'}
                    }).then(loadCatches).catch(handleError);
                }
                catches.append(innerDiv);
            }
        }
    }

    function addCatch() {

        let addForm = $('#addForm');

        let obj = JSON.stringify({
            'angler': addForm.find('.angler').val(),
            'weight': Number(addForm.find('.weight').val()),
            'captureTime': Number(addForm.find('.captureTime').val()),
            'species': addForm.find('.species').val(),
            'location': addForm.find('.location').val(),
            'bait': addForm.find('.bait').val()
        });

        let inputFields = addForm.find('input').toArray();
        for (let field of inputFields) {
            $(field).val('');
        }

        $.ajax({
            method: 'POST',
            url: URL,
            headers: {'Authorization': `Basic ${BASE64}`, 'Content-Type': 'application/json'},
            data: obj
        }).then(loadCatches).catch(handleError);
    }

    function handleError(err) {
        console.log(err);
    }
}