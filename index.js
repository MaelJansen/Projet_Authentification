const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');

const app = express();

app.use(session({
    secret: 'secret key',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new FileStore({
        path: './sessions'
    })
}));

app.use(bodyParser.urlencoded({ extended: false }))

//espace déconnecté
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/accueil');
    }
    res.sendFile(path.join(__dirname, 'espace-deconnecte.html'));
});

//form de connexion
app.get('/connexion', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/accueil');
    }
    res.sendFile(path.join(__dirname, 'form-connexion.html'));
});

//traitement du form
app.post('/connexion', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username == "admin" && password == "admin") {
        req.session.loggedIn = true;
        res.redirect('/accueil');
    } else {
        // TODO Faire une belle div d'erreur à la place.
        res.status(401).send('Identifiants incorrects');
    }
});

//espace connecté
app.get('/accueil', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'espace-connecte.html'));
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});