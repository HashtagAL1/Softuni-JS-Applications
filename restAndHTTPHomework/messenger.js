function generateMessenger() {
    $('#refresh').click(refresh);
    $('#submit').click(sendMsg);

    function refresh() {
        $.ajax({
            method: 'GET',
            url: `https://messenger-8b468.firebaseio.com/messenger.json`
        }).then(handleRefresh).catch(handleError);

        function handleRefresh(res) {
            let arr = Object.keys(res);
            arr.sort((a, b) => res[a].timestamp - res[b].timestamp);
            let text = '';
            for (let obj of arr) {
                text += `${res[obj].author}: ${res[obj].content}\n`;
            }
            $('#messages').text(text);
        }
    }

    function sendMsg() {
        let name = $('#author');
        let msg = $('#content');
        let toPost = JSON.stringify({author: name.val(), content: msg.val(), timestamp: Date.now()});
        name.val('');
        msg.val('');
        $.ajax({
            method: 'POST',
            data: toPost,
            url: `https://messenger-8b468.firebaseio.com/messenger.json`
        }).then(refresh).catch(handleError)
    }

    function handleError(err) {
        console.log(err);
    }
}