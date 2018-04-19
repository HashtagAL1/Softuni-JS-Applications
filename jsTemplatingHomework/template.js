$(() => {
    renderCatTemplate();
    attachCatButtonEvent();

    function renderCatTemplate() {
        let source = $('#cat-template').html();
        let template = Handlebars.compile(source);
        let context = {
            cats: window.cats
        };

        let html = template(context);
        $('#allCats').empty();
        $('#allCats').append(html);

    }

    function attachCatButtonEvent() {
        $('.btn-primary').each((index, element) => {
            $(element).click(function () {
                let but = $(element);
                if (but.text() === 'Show status code') {
                    but.text('Hide status code');
                    let id = window.cats[index].id;
                    $('#' + id).css('display', 'block');
                    return;
                }
                else {
                    but.text('Show status code');
                    let id = window.cats[index].id;
                    $('#' + id).css('display', 'none');
                }
            });
        });

    }

});
