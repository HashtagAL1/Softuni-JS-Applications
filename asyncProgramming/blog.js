function generatePosts() {
    const URL = `https://baas.kinvey.com/appdata/kid_SkRn8erqM`;
    const USERNAME = 'pesho';
    const PASSWORD = 'p';
    const BASE64 = btoa(`${USERNAME}:${PASSWORD}`);
    const AUTH = {'Authorization': `Basic ${BASE64}`};
    $('#btnLoadPosts').click(loadPosts);
    $('#btnViewPost').click(viewPost);

    function loadPosts() {
        $.ajax({
            method: 'GET',
            headers: AUTH,
            url: URL + `/posts`
        }).then(listPosts).catch(handleError);

        function listPosts(res) {
            for (let post of res) {
                $('#posts').append($(`<option value="${post._id}">${post.title}</option>`));
            }
        }
    }

    function viewPost() {
        let postId = $('#posts').find('option:selected').val();
        $.ajax({
            method: 'GET',
            headers: AUTH,
            url: `${URL}/posts/${postId}`
        }).then(getPost).catch(handleError);

        $.ajax({
            method: 'GET',
            headers: AUTH,
            url: `${URL}/comments/?query={"post_id":"${postId}"}`
        }).then(getComments).catch(handleError)

        function getPost(res) {
            $('#post-title').text(res.title);
            $('#post-body').text(res.body);
        }

        function getComments(res) {
            for (let comment of res) {
                $('#post-comments').append($(`<li>${comment.text}</li>`));
            }
        }

    }

    function handleError(err) {
        console.log(err);
    }
}