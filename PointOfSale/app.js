$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('index.html', getWelcomePage);

        this.post('#/register', (context) => {
            let username = context.params.username;
            let password = context.params.password;
            let repeatPass = context.params.repeatPass;

            if (username === '' || password === '') {
                notify.showError('Username and Password fields cannot be empty');
                return;
            }
            if (username.length < 5) {
                let article = 5;
                console.log(article);
                notify.showError('Username must be at least 5 characters long.');
                return;
            }
            if (password !== repeatPass) {
                notify.showError('Passwords do not match');
                return;
            }

            auth.register(username, password, repeatPass)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('User registration successful');
                    receiptService.createEmptyReceipt()
                        .then(() => {
                            context.redirect('#/editor');
                        }).catch((err) => {notify.handleError(err)});
                }).catch((err) => {notify.handleError(err)});
        });

        this.post('#/login', (context) => {
            let username = context.params.username;
            let password = context.params.password;
            if (username === '' || password === '') {
                notify.showError('Username and password fields cannot be empty');
                return;
            }

            auth.login(username, password)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('Login successful');
                    context.redirect('#/editor');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/logout', (context) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    notify.showInfo('Logout successful');
                    context.redirect('index.html');
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/editor', (context) => {
            let userId = sessionStorage.getItem('userId');
            receiptService.getActiveReceipt(userId)
                .then((receipt) => {
                    let receiptId = receipt[0]._id;
                    entryService.getEntriesByReceipt(receiptId)
                        .then((entries) => {
                            context.username = sessionStorage.getItem('username');
                            receipt[0].total = 0;
                            receipt[0].productCount = 0;
                            entries.forEach((entry, index) => {
                                entry.total = Number(entry.price) * Number(entry.qty);
                                receipt[0].total += Number(entry.total);
                                receipt[0].productCount += Number(entry.qty);
                            });
                            receiptService.updateReceipt(receiptId, receipt[0])
                                .then(() => {
                                    context.entries = entries;
                                    context.receipt = receipt[0];
                                    context.loadPartials({
                                        header: './templates/common/header.hbs',
                                        nav: './templates/common/nav.hbs',
                                        footer: './templates/common/footer.hbs',
                                        createEntryForm: './templates/forms/createEntryForm.hbs',
                                        createReceiptForm: './templates/forms/createReceiptForm.hbs',
                                        entry: './templates/editor/entry.hbs'
                                    }).then(function () {
                                        this.partial('./templates/editor/editorPage.hbs');
                                    })
                                }).catch((err) => {notify.handleError(err)});

                        }).catch((err) => {notify.handleError(err)});
                }).catch((err) => {notify.handleError(err)});
        });

        this.post('#/create/entry', (context) => {
            let type = context.params.type;
            let qty = Number(context.params.qty);
            let price = Number(context.params.price);
            if (type === '') {
                notify.showError('Type field cannot be empty');
                return;
            }
            if (isNaN(qty) || qty === 0) {
                notify.showError('Quantity field must be a number and cannot be empty or zero.');
                return;
            }
            if(isNaN(price) || price === 0) {
                notify.showError('Price field must be a number and cannot be empty or zero.');
                return;
            }
            let userId = sessionStorage.getItem('userId');
            receiptService.getActiveReceipt(userId)
                .then((receipt) => {
                    let receiptId = receipt[0]._id;
                    entryService.addEntry(type, qty, price, receiptId)
                        .then(() => {
                            notify.showInfo('Entry added');
                            context.redirect('#/editor');
                        }).catch((err) => {notify.handleError(err)});
                }).catch((err) => {notify.handleError(err)});
        });

        this.get('#/delete/entry/:entryId', (context) => {
            let entryId = context.params.entryId;
            entryService.deleteEntry(entryId)
                .then(() => {
                    notify.showInfo('Entry removed');
                    context.redirect('#/editor');
                }).catch((err) => {notify.handleError(err)});
        });

        this.post('#/create/receipt', (context) => {
            let receiptId = context.params.receiptId;
            let productCount = context.params.productCount;
            let total = context.params.total;
            let userId = sessionStorage.getItem('userId');

            if (Number(productCount) === 0) {
                notify.showError('There must be at least one entry in the receipt!');
                return;
            }

            receiptService.getActiveReceipt(userId)
                .then((receipt) => {
                    receipt[0].active = 'false';
                    receiptService.updateReceipt(receiptId, receipt[0])
                        .then(() => {
                            notify.showInfo('Receipt checked out!');
                            receiptService.createEmptyReceipt()
                                .then(() => {
                                    context.redirect('#/editor');
                                }).catch((err) => {notify.handleError(err)})
                        }).catch((err) => {notify.handleError(err)})
                }).catch((err) => {notify.handleError(err)})
        });

        this.get('#/myReceipts', (context) => {
            let userId = sessionStorage.getItem('userId');
            let username = sessionStorage.getItem('username');
            receiptService.getMyReceipts(userId)
                .then((receipts) => {
                    receipts.forEach((receipt, index) => {
                        receipt.date = receipt._kmd.ect.slice(0,-5);
                    });
                    context.myReceipts = receipts;
                    context.username = username;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        receipt: './templates/myReceipts/receipt.hbs'
                    }).then(function () {
                        this.partial('./templates/myReceipts/myReceiptsPage.hbs');
                    })
                }).catch((err) => {notify.handleError(err)})
        });

        this.get('#/details/receipt/:receiptId', (context) => {
            let receiptId = context.params.receiptId;
            let username = sessionStorage.getItem('username');
            entryService.getEntriesByReceipt(receiptId)
                .then((entries) => {
                    entries.forEach((entry, index) => {
                        entry.total = (Number(entry.qty) * Number(entry.price)).toFixed(2);
                    });
                    context.username = username;
                    context.receiptEntries = entries;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        nav: './templates/common/nav.hbs',
                        footer: './templates/common/footer.hbs',
                        receiptEntry: './templates/details/receiptEntry.hbs'
                    }).then(function () {
                        this.partial('./templates/details/detailsPage.hbs');
                    })

                }).catch((err) => {notify.handleError(err)})
        });

        function getWelcomePage(context) {
            if (!auth.isAuth()) {
                context.loadPartials({
                    loginForm: './templates/forms/loginForm.hbs',
                    registerForm: './templates/forms/registerForm.hbs'
                }).then(function () {
                    this.partial('./templates/welcome.hbs');
                })
            }
            else {
                context.redirect('#/editor');
            }
        }
    });

    app.run();
});