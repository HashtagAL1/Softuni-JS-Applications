$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        this.post('#/register', (context) => {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPass = context.params.repeatPass;

            let userPattern = /^[a-zA-Z]{3,}$/;
            let passPattern = /^[a-zA-Z\d]{6,}$/;
            if (!userPattern.test(username)) {
                notify.showError('Username must be at least 3 characters long, containig only english alphabet letters.');
                return;
            }
            if (!passPattern.test(password)) {
                notify.showError('Password must be at least 6 characters long, containing english alphabet letters and digits.');
                return;
            }
            if (password !== repeatPass) {
                notify.showError('Passwords do not match.');
                return;
            }

            auth.register(username, password, repeatPass)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('User Registration successful.');
                    context.redirect('#/catalog');
                }).catch((err) => {notify.handleError(err)});
        });

        this.post('#/login', (context) => {
            let username = context.params.username;
            let password = context.params.password;

            auth.login(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('Login successful');
                    context.redirect('#/catalog');
            }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/catalog', (context) => {
            postService.getAllPosts()
                .then((posts) => {
                    posts.forEach((post, index) => {
                        post.rank = index + 1;
                        post.date = calcTime(post._kmd.ect);
                        post.isAuthor = post._acl.creator === sessionStorage.getItem('userId');
                    });
                    context.posts = posts;
                    context.isAuth = auth.isAuth();
                    context.username = sessionStorage.getItem('username');
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        postList: './templates/catalog/postList.hbs',
                        post: './templates/catalog/post.hbs'

                    }).then(function () {
                        this.partial('./templates/catalog/catalogPage.hbs');
                    });
            }).catch((err) => {notify.handleError(err)})
        });

        this.get('#/myPosts', (context) => {
            let username = sessionStorage.getItem('username');
            postService.getMyPosts(username)
                .then((myPosts) => {
                    myPosts.forEach((post, index) => {
                        post.rank = index + 1;
                        post.date = calcTime(post._kmd.ect);
                        post.isAuthor = sessionStorage.getItem('username') === post._acl.creator;
                    });
                    context.myPosts = myPosts;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        myPost: './templates/catalog/myPost.hbs',
                        myPostList: './templates/catalog/myPostList.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/myPostsPage.hbs');
                    });
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/create/post', (context) => {
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                nav: './templates/common/nav.hbs',
                createPostForm: './templates/forms/createPostForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPost.hbs');
            });
        });

        this.post('#/create/post', (context) => {
            let url = context.params.url;
            let title = context.params.title;
            let imageUrl = context.params.image;
            let description = context.params.comment;
            let author = sessionStorage.getItem('username');

            postService.createPost(author, title, description, url, imageUrl)
                .then((res) => {
                    notify.showInfo(`Post ${title} successfully created!`);
                    context.redirect('#/catalog');
                });
        });

        this.post('#/create/comment', (context) => {
            let postId = context.params.postId;
            let content = context.params.content;
            let author = sessionStorage.getItem('username');

            commentService.createComment(postId, author, content)
                .then(() => {
                    notify.showInfo('Comment added successfully');
                    context.redirect(`#/catalog`);
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/edit/post/:postId', (context) => {
            let postId = context.params.postId;
            postService.getPost(postId)
                .then((post) => {
                context.postId = post._id;
                context.post = post;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        editPostForm: './templates/forms/editPostForm.hbs'
                    }).then(function () {
                        this.partial('./templates/edit/editPost.hbs');
                    });
                }).catch((err) => {notify.handleError(err)})
        });

        this.post('#/edit/post/:postId', (context) => {
            let postId = context.params.postId;
            let author = sessionStorage.getItem('username');
            let url = context.params.url;
            let imageUrl = context.params.image;
            let description = context.params.description;
            let title = context.params.title;

            postService.editPost(postId, author, title, description, url, imageUrl)
                .then((res) => {
                    notify.showInfo('Post successfully edited.');
                    context.redirect('#/catalog');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/delete/post/:postId', (context) => {
            let postId = context.params.postId;
            postService.deletePost(postId).then(() => {
                notify.showInfo('Post successfully deleted');
                context.redirect('#/catalog');
            }).catch((err) => {notify.handleError(err)})
        });

        this.get('#/delete/comment/:commentId', (context) => {
            let commentId = context.params.commentId;
            let postId = context.params.postId;
            commentService.deleteComment(commentId).then(() => {
                notify.showInfo('Comment deleted successfully.');
                context.redirect(`#/catalog`);
            }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/details/post/:postId', (context) => {
            let postId = context.params.postId;

            postService.getPost(postId)
                .then((post) => {

                    commentService.getAllComments(post._id).then((comments) => {
                        comments.forEach((comment, index) => {
                            comment.date = calcTime(comment._kmd.ect);
                            comment.isAuthor = sessionStorage.getItem('userId') === comment._acl.creator;
                        });
                        context.comments = comments;
                        post.date = calcTime(post._kmd.ect);
                        post.isAuthor = sessionStorage.getItem('userId') === post._acl.creator;
                        context.post = post;
                        context.postId = postId;
                        context.loadPartials({
                            header: './templates/common/header.hbs',
                            footer: './templates/common/footer.hbs',
                            nav: './templates/common/nav.hbs',
                            createCommentForm: './templates/forms/createCommentForm.hbs',
                            comment: './templates/details/comment.hbs'
                        }).then(function () {
                            this.partial('./templates/details/detailsPage.hbs');
                        });
                    });




                })
        });

        function calcTime(dateIsoFormat) {
            let diff = new Date - (new Date(dateIsoFormat));
            diff = Math.floor(diff / 60000);
            if (diff < 1) return 'less than a minute';
            if (diff < 60) return diff + ' minute' + pluralize(diff);
            diff = Math.floor(diff / 60);
            if (diff < 24) return diff + ' hour' + pluralize(diff);
            diff = Math.floor(diff / 24);
            if (diff < 30) return diff + ' day' + pluralize(diff);
            diff = Math.floor(diff / 30);
            if (diff < 12) return diff + ' month' + pluralize(diff);
            diff = Math.floor(diff / 12);
            return diff + ' year' + pluralize(diff);
            function pluralize(value) {
                if (value !== 1) return 's';
                else return '';
            }
        }

        function getWelcomePage(context) {
            if (!auth.isAuth()) {
                context.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/header.hbs',
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs'
                }).then(function () {
                    this.partial('./templates/welcome-anonymous.hbs');
                });
            }
            else {
                context.redirect('#/catalog');
            }
        }
    });

    app.run();
});