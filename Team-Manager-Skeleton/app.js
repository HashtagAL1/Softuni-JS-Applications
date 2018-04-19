$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbs');

        this.get('#/index.html', (context) => {
            context.loggedIn = auth.isAuth();
            context.username = sessionStorage.getItem('username');

            if (sessionStorage.getItem('teamId') !== null && sessionStorage.getItem('teamId').length > 10) {
                context.hasTeam = true;
                context.teamId = sessionStorage.getItem('teamId');
            }

            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/home/home.hbs');
            });

        });

        this.get('#/catalog', (context) => {
            teamsService.loadTeams().then((teams) => {
                context.teams = teams;
                context.username = sessionStorage.getItem('username');
                context.loggedIn = auth.isAuth();
                context.hasNoTeam = teamsService.hasNoTeam(teams);
                context.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    team: './templates/catalog/team.hbs'
                }).then(function () {
                    this.partial('./templates/catalog/teamCatalog.hbs');
                });
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/catalog/:teamId', (context) => {
            let teamId = context.params.teamId.slice(1);
            teamsService.getTeamInfo(teamId).then(function (team) {
                context.comment = team.comment;
                context.name = team.name;

                if (sessionStorage.getItem('userId') === team._acl.creator) {
                    context.isAuthor = true;
                }
                if (sessionStorage.getItem('teamId') === team._id) {
                    context.isOnTeam = true;
                }
                if (sessionStorage.getItem('teamId') === null || sessionStorage.getItem('teamId').length <= 10) {
                    context.hasNoTeam = true;
                }

                teamsService.getAllUsers().then(function (users) {
                    context.members = users.filter(a => a.teamId === teamId);
                    context.loggedIn = auth.isAuth();
                    context.username = sessionStorage.getItem('username');
                    context.teamId = teamId;
                    context.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        team: './templates/catalog/team.hbs',
                        teamMember: './templates/catalog/teamMember.hbs',
                        teamControls: './templates/catalog/teamControls.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/details.hbs');
                    });
                }).catch((err) => {auth.handleError(err)});
            }).catch((err) => {auth.handleError(err)});

        });

        this.get('#/create', (context) => {
            context.username = sessionStorage.getItem('username');
            context.loggedIn = auth.isAuth();
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createForm: './templates/create/createForm.hbs'
            }).then(function () {
                this.partial('./templates/create/createPage.hbs');
            });
        });

        this.post('#/create', (context) => {
            let name = context.params.name;
            let comment = context.params.comment;
            teamsService.createTeam(name, comment).then(function (res) {
                let teamId = res._id;
                teamsService.joinTeam(teamId).then(function (output) {
                    sessionStorage.setItem('teamId', teamId);
                    auth.showInfo(`The team ${name} was successfully created!`);
                    context.redirect('#/catalog');
                }).catch((err) => {auth.handleError(err)});
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/edit/:teamId', (context) => {

            let teamId = context.params.teamId.slice(1);
            teamsService.getTeamInfo(teamId).then(function (team) {
                context.username = sessionStorage.getItem('username');
                context.loggedIn = auth.isAuth();
                context.teamId = teamId;
                context.name = team.name;
                context.comment = team.comment;
                context.loadPartials({
                    header: './templates/common/header.hbs',
                    footer: './templates/common/footer.hbs',
                    editForm: './templates/edit/editForm.hbs'
                }).then(function () {
                    this.partial('./templates/edit/editPage.hbs');
                });
            }).catch((err) => {auth.handleError(err)});


        });

        this.post('#/edit/:teamId', (context) => {
            let teamId = context.params.teamId.slice(1);
            let name  = context.params.name;
            let comment = context.params.comment;

            teamsService.edit(teamId, name, comment).then(function (res) {
                auth.showInfo('The team was updated successfully!')
                context.redirect(`#/catalog/:${teamId}`);
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/register', (context) => {
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
            let repeatPassword = context.params.repeatPassword;

            if (password !== repeatPassword) {
                auth.showError('Passwords do not match.');
                return;
            }

            auth.register(username, password, repeatPassword).then((userData) => {
                auth.saveSession(userData);
                auth.showInfo('Registration successful!')
                context.redirect('#/home');
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/login', (context) => {
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                loginForm: './templates/login/loginForm.hbs'
            }).then(function () {
                this.partial('./templates/login/loginPage.hbs');
            })
        });

        this.post('#/login', (context) => {
            let username = context.params.username;
            let password = context.params.password;

            auth.login(username, password).then((userData) => {
                auth.saveSession(userData);
                auth.showInfo('Login successful!')
                context.redirect('#/home');
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/logout', (context) => {
            auth.logout().then(() => {
                sessionStorage.clear();
                auth.showInfo('Logout successful!')
                context.redirect('#/home');
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/join/:teamId', (context) => {
            let teamId = context.params.teamId.slice(1);
            teamsService.joinTeam(teamId).then(function (res) {
                sessionStorage.setItem('teamId', teamId);
                auth.showInfo('You have joined the team successfully!');
                context.redirect(`#/catalog/:${teamId}`);
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/leave', (context) => {
            teamsService.leaveTeam().then(function (res) {
                sessionStorage.setItem('teamId', null);
                auth.showInfo('You have left this team!');
                context.redirect('#/catalog');
            }).catch((err) => {auth.handleError(err)});
        });

        this.get('#/about', (context) => {
            context.loggedIn = auth.isAuth();
            context.username = sessionStorage.getItem('username');
            context.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/about/about.hbs');
            })
        });

        this.get('#/home', (context) => {
            context.redirect('#/index.html');
        });
    });

    app.run();
});