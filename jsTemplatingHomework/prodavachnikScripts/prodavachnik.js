const APPKEY = 'kid_HyYycH0qM';
const APPSECRET = 'a7d532cac5874fc89b2962cfe455cdcd';
const URL = 'https://baas.kinvey.com';
const AUTH_HEADERS = {'Authorization': `Basic ${btoa(APPKEY + ':' + APPSECRET)}`};

//Init functions
function startApp() {
    loadHeader();
    loadHome();
};

function attachEvents() {
    $('#linkLogin').click(loadLoginForm);
    $('#linkLogout').click(logoutUser);
    $('#linkRegister').click(loadRegisterForm);
    $('#linkHome').click(loadHome);
    $('#linkCreateAd').click(loadCreateAdForm);
    $('#linkListAds').click(loadAds);


    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#buttonCreateAd').click(createAd);
    $('#buttonEditAd').click(editAd);



}


//Load functions
async function loadHeader() {

    let header = await $.get('prodavachnikTemplates/header.hbs');
    let template = Handlebars.compile(header);
    let context = {
        authtoken: sessionStorage.getItem('authToken'),
        username: sessionStorage.getItem('username')
    };
    let html = template(context);
    $('#menu').empty();
    $('#menu').append(html);
    attachEvents();
}

async function loadLoginForm() {
    let view = await $.get('prodavachnikTemplates/viewLoginRegister.hbs');
    let template = Handlebars.compile(view);
    let context = {
        title: 'Please Login',
        id_class: 'viewLogin',
        id_form: 'formLogin',
        id_button: 'buttonLoginUser',
        value: 'Login'
    };
    let html = template(context);
    $('main').empty();
    $('main').append(html);
    attachEvents();
}

async function loadRegisterForm() {
    let view = await $.get('prodavachnikTemplates/viewLoginRegister.hbs');
    let template = Handlebars.compile(view);
    let context = {
        title: 'Please Register',
        id_class: 'viewRegister',
        id_form: 'formRegister',
        id_button: 'buttonRegisterUser',
        value: 'Register'
    };
    let html = template(context);
    $('main').empty();
    $('main').append(html);
    attachEvents();
}

async function loadCreateAdForm() {
    let view = await $.get('prodavachnikTemplates/createAdForm.hbs');
    let template = Handlebars.compile(view);
    let context = {
        id_form: 'formCreateAd',
        id_button: 'buttonCreateAd',
        title: 'Create new Advertisement',
        value: 'Create'
    };

    let html = template(context);
    $('main').empty();
    $('main').append(html);
    attachEvents();
}

function loadAds() {
    $.ajax({
        method: 'GET',
        url: `${URL}/appdata/${APPKEY}/ads`,
        headers: {'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`}
    }).then(function (res) {
        displayAds(res);
    }).catch(handleError);


}

async function loadHome() {
    let view = await $.get('prodavachnikTemplates/viewHome.hbs');
    let template = Handlebars.compile(view);
    let context = {
        title: 'Welcome',
        body: 'Welcome to our advertisement site.'
    };
    let html = template(context);
    $('main').empty();
    $('main').append(html);
    attachEvents();
}


//Operation functions
async function displayAds(res) {
    let view = await $.get('prodavachnikTemplates/viewAds.hbs');
    let template = Handlebars.compile(view);
    let context = {
        ads: res
    };
    let html = template(context);
    let main = $('main');
    main.empty();
    main.append(html);
    main.find('.deleteAnchor').each((index, element) => {
        if (res[index].publisher !== sessionStorage.getItem('username')) {
            $(element).remove();
        }
        else {
            $(element).click(function () {
                $.ajax({
                    method: 'DELETE',
                    url: `${URL}/appdata/${APPKEY}/ads/${res[index]._id}`,
                    headers: {'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`}
                }).then(loadAds).catch(handleError);
            });
        }
    });
    main.find('.editAnchor').each((index, element) => {
        if (res[index].publisher !== sessionStorage.getItem('username')) {
            $(element).remove();
        }
        else {
            $(element).click(async function () {
                let view = await $.get('prodavachnikTemplates/viewEditAd.hbs');
                let template = Handlebars.compile(view);
                let context = {
                    title: 'Edit existing advertisement',
                    id_form: 'formEditAd',
                    ad: res[index],
                    id_button: 'buttonEditAd'
                };
                let html = template(context);
                main.empty();
                main.append(html);
                attachEvents();
            });
        }
    });
    main.find('.readMoreAnchor').each((index, element) => {
        $(element).click(async function () {
            let view = await $.get('prodavachnikTemplates/viewSingleAd.hbs');
            let template = Handlebars.compile(view);
            let context = {
                image: res[index].image,
                title: res[index].title,
                publisher: res[index].publisher,
                datePublished: res[index].datePublished,
                description: res[index].description
            };
            let html = template(context);
            main.empty();
            main.append(html);
        });
    });
    attachEvents();
}

function editAd() {
    let title = $('#formEditAd input[name=title]').val();
    let description = $('#formEditAd textarea[name=description]').val();
    let datePublished = $('#formEditAd input[name=datePublished]').val();
    let price = $('#formEditAd input[name=price]').val();
    let image = $('#formEditAd input[name=image]').val();
    let publisher = $('#formEditAd input[name=publisher]').val();
    let id = $('#formEditAd input[name=id]').val();

    $.ajax({
        method: 'PUT',
        url: `${URL}/appdata/${APPKEY}/ads/${id}`,
        headers: {'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`},
        data: {title, description, datePublished, image, price, publisher}
    }).then(loadAds).catch(handleError);
}

function createAd() {
    let title = $('#formCreateAd input[name=title]').val();
    let description = $('#formCreateAd textarea[name=description]').val();
    let price = $('#formCreateAd input[name=price]').val();
    let image = $('#formCreateAd input[name=image]').val();
    let datePublished = $('#formCreateAd input[name=datePublished]').val();
    let publisher = sessionStorage.getItem('username');

    $.ajax({
        method: 'POST',
        url: `${URL}/appdata/${APPKEY}/ads`,
        headers: {'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`},
        data: {title, publisher, description, price, image, datePublished}
    }).then(loadAds).catch(handleError);
}

function loginUser() {
    let username = $('#formLogin input[name=username]').val();
    let password = $('#formLogin input[name=passwd]').val();

    $.ajax({
        method: 'POST',
        url: `${URL}/user/${APPKEY}/login`,
        headers: AUTH_HEADERS,
        data: {username, password}
    }).then(signIn).catch(handleError);
}

function registerUser() {
    let username = $('#formRegister input[name=username]').val();
    let password = $('#formRegister input[name=passwd]').val();

    $.ajax({
        method: 'POST',
        url: `${URL}/user/${APPKEY}/`,
        data: {username, password},
        headers: AUTH_HEADERS
    }).then(signIn).catch(handleError);
}

function signIn(res) {
    sessionStorage.setItem('username', res.username);
    sessionStorage.setItem('authToken', res._kmd.authtoken);
    sessionStorage.setItem('userId', res._id);
    loadHeader();
    loadHome();
}

function logoutUser() {
    sessionStorage.clear();
    loadHeader();
    loadHome();
}

function handleError(err) {
    console.log(err);
}


