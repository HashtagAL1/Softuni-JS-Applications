$(() => {
    let details;
    let data;
    async function loadFiles() {
        let contacts = await $.get('templates/contacts.hbs');
        let contactsTemplate = Handlebars.compile(contacts);

        details = await $.get('templates/details.hbs');
        data = await $.get('data.json');
        let obj = {
            contacts: data
        };

        let table = contactsTemplate(obj);
        $('#list').append(table);
        attachEvents();
    }

    loadFiles();

    function attachEvents() {
        $('.contact').click(function () {
            loadDetails($(this).attr('data-id'));
            $('.contact').removeClass('active');
            $(this).addClass('active');
        });
    }

    function loadDetails(id) {
        let detailsTemplate = Handlebars.compile(details);
        let html = detailsTemplate(data[id]);
        $('#details').empty();
        $('#details').append(html);
    }

});