let auth = (() => {
    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('name', userInfo.name);
    }

    // user/login
    function login(username, password) {
        let userData = {
            username,
            password
        };

        return requester.post('user', 'login', 'basic', userData);
    }

    // user/register
    function register(username, password, name, cart) {
        let userData = {
            username,
            password,
            name,
            cart
        };

        return requester.post('user', '', 'basic', userData);
    }

    // user/logout
    function logout() {
        let logoutData = {
            authtoken: sessionStorage.getItem('authtoken')
        };

        return requester.post('user', '_logout', 'kinvey', logoutData);
    }

    function isAuth() {
        return sessionStorage.getItem('authtoken') !== null;
    }



    return {
        login,
        register,
        logout,
        saveSession,
        isAuth
    }
})();