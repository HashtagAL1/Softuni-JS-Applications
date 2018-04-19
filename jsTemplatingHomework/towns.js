function attachEvents() {
    $('#btnLoadTowns').click(handleTowns);

    function handleTowns() {
        let towns = $('#towns').val().split(', ').filter(a => a !== '');
        for(let i = 0; i < towns.length; i++) {
            towns[i] = {name: towns[i]};
        }

        let source = $('#towns-template').html();
        let template = Handlebars.compile(source);
        let context = {
            towns: towns
        };
        let html = template(context);
        $('#root').empty();
        $('#root').append(html);
    }
}