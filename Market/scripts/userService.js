let userService = (() => {
    function getUser(userId) {
        return requester.get('user', userId, 'kinvey');
    }
    
    function updateUser(userId, user) {
        return requester.update('user', userId, 'kinvey', user);
    }

    return {
        getUser,
        updateUser
    }
})();