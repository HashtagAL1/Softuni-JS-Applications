let commentService = (() => {
    function getAllComments(postId) {
        let endpoint = `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }

    function createComment(postId, author, content) {
        let data = {postId, author, content};
        return requester.post('appdata', 'comments', 'kinvey', data);
    }

    function deleteComment(commentId) {
        let endpoint = `comments/${commentId}`;
        return requester.remove('appdata', endpoint, 'kinvey');
    }

    return {
        getAllComments,
        deleteComment,
        createComment
    }
})();