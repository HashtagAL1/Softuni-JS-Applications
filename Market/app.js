$(() => {
    const app = Sammy('#app', function () {
        this.use('Handlebars', 'hbs');

        this.get('market.html', getWelcomePage);
        this.get('#/home', getWelcomePage);

        this.get('#/register', (context) => {
            context.isAuth = auth.isAuth();
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                registerForm: './templates/register/registerForm.hbs'
            }).then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
        });

        this.post('#/register', (context) => {
            let username = context.params.username;
            let password = context.params.password;
            let name = context.params.name;
            let cart = '{}';

            auth.register(username, password, name, cart)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('Registration successful');
                    context.redirect('#/home');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/login', (context) => {
            context.isAuth = auth.isAuth();
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
        });

        this.post('#/login', (context) => {
            let username = context.params.username;
            let password = context.params.password;
            auth.login(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('Login successful');
                    context.redirect('#/home');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/logout', (context) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    notify.showInfo('Logout successful');
                    context.redirect('#/home');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/products', (context) => {
            productService.getAllProducts()
                .then((products) => {
                    context.isAuth = auth.isAuth();
                    context.username = sessionStorage.getItem('username');
                    context.name = sessionStorage.getItem('name');
                    context.products = products;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        product: './templates/products/product.hbs'
                    }).then(function () {
                        this.partial('./templates/products/productPage.hbs');
                    });
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/myCart', (context) => {
            let userId = sessionStorage.getItem('userId');
            userService.getUser(userId)
                .then((user) => {
                    if (user.cart !== '{}' && (user.cart !== null && user.cart !== undefined)) {
                        context.isEmpty = false;
                        for (let productId of Object.keys(user.cart)) {
                            user.cart[productId].totalPrice = Number(user.cart[productId].quantity) * Number(user.cart[productId].product.price);
                            user.cart[productId].totalPrice.toFixed(2);
                            user.cart[productId].id = productId;
                            context.myProducts = user.cart;
                        }

                    }
                    else {
                        context.isEmpty = true;
                    }

                    context.name = sessionStorage.getItem('name');
                    context.username = sessionStorage.getItem('username');
                    context.userId = sessionStorage.getItem('userId');
                    context.isAuth = auth.isAuth();
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        myProduct: './templates/cart/myProduct.hbs'
                    }).then(function () {
                        this.partial('./templates/cart/myCart.hbs');
                    });
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/purchase/:productId', (context) => {
            let userId = sessionStorage.getItem('userId');
            let productId = context.params.productId;
            userService.getUser(userId)
                .then((user) => {
                    if (user.cart === '{}' || user.cart === null || user.cart === undefined) {
                        user.cart = {};
                        productService.getSingleProduct(productId)
                            .then((product) => {
                                user.cart[productId] = {'quantity': '1', 'product': product};
                                userService.updateUser(userId, productId)
                                    .then(() => {
                                        notify.showInfo('Product purchased');
                                        context.redirect('#/products')
                                    }).catch((err) => {notify.handleError(err)});
                            }).catch((err) => {notify.handleError(err)});
                    }
                    if (user.cart.hasOwnProperty(productId)) {
                        let quantity = Number(user.cart[productId].quantity) + 1;
                        user.cart[productId].quantity = quantity.toString();
                        userService.updateUser(userId, user)
                            .then(() => {
                                context.redirect('#/products');
                            }).catch((err) => {notify.handleError(err)});
                    }
                    else {
                        productService.getSingleProduct(productId)
                            .then((product) => {
                                user.cart[productId] = {'quantity': '1', 'product': product};
                                userService.updateUser(userId, user)
                                    .then(() => {
                                        context.redirect('#/products');
                                    }).catch((err) => {notify.handleError(err)});
                            }).catch((err) => {notify.handleError(err)});
                    }
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/discard/:productId', (context) => {
            let productId = context.params.productId;
            let userId = sessionStorage.getItem('userId');
            userService.getUser(userId)
                .then((user) => {
                    delete user.cart[productId];
                    userService.updateUser(userId, user)
                        .then(() => {
                            notify.showInfo('Product discarded!');
                            context.redirect('#/myCart');
                        }).catch((err) => {notify.handleError(err)});
                }).catch((err) => {notify.handleError(err)});
        });


        function getWelcomePage(context) {
            if (!auth.isAuth()) {
                context.isAuth = auth.isAuth();
                context.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs'
                }).then(function () {
                    this.partial('./templates/welcomeAnonymous.hbs');
                });
            }
            else {
                context.isAuth = auth.isAuth();
                context.username = sessionStorage.getItem('username');
                context.name = sessionStorage.getItem('name');
                context.userId = sessionStorage.getItem('userId');
                context.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs'
                }).then(function () {
                    this.partial('./templates/welcomeLogged.hbs');
                })
            }
        }
    });

    app.run();
});