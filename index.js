const passport = require('passport');
const db = require('./db');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const fs = require("node:fs");
const registeredUsers = require("./db/users.json");
const { authenticator } = require("otplib");
const qrcode = require("qrcode");

const filePathUser = path.join(__dirname, "db", "users.json");

const app = express();

const authRoutes = require("./routes/auth");

var session = require('express-session');
var passport = require('passport');


app.use("/auth", authRoutes);

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  const user = registeredUsers.users.find(u => u.id === id);
  done(null, user);
});

var SQLiteStore = require('connect-sqlite3')(session);

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(passport.authenticate('session'));

/*
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "Message secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
    store: new FileStore({ path: "./sessions" }),
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
*/


const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
};


app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, "public", "login_form.html"));
  } else {
    return res.sendFile(path.join(__dirname, "public", "blog.html"));
  }
});

app.post("/login", (req, res) => {
  const mail = req.body.mail;
  const password = req.body.password;
  registeredUsers.users.forEach((user) => {
    console.log(mail, password);
    console.log(user.email, user.password);
  });
  if (
    registeredUsers.users.find(
      (user) => user.email === mail && user.password === password
    )
  ) {
    req.session.loggedIn = true;
    req.session.user = mail;
    req.session.save((err) => {
      if (err) {
        return res.status(500).send("Erreur serveur");
      }
      res.redirect("/blog");
    });
  } else {
    res.status(401).send("Identifiants incorrects");
  }
});

app.get('/logout', (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "logout.html"));
});

app.get('/logoutThisEquipment', (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

app.post('/logoutAllEquipments', async (req, res) => {
  //partie 1 : invalider les jwt. 
  if (req.user) {
    registeredUsers.users = registeredUsers.users.map(u =>
      u.email === req.user.email ? { ...u, sessionVersion: u.sessionVersion + 1 } : u
    );

    fs.writeFileSync(filePathUser, JSON.stringify(registeredUsers, null, 2));
  }

  //partie 2 : suppression de la session
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

app.get("/blog", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.post("/blog", isAuthenticated, (req, res) => {
  if (!req.session.twoFactorAuthenticated) {
    res.redirect("/activate2AF");
  } else {
    res.send("Enregistrement des modifications...");
  }
});

app.get("/private", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "private.html"));
});

app.get("/activate2AF", isAuthenticated, (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "activate2AF.html"));
});

app.post("/activate2AF", isAuthenticated, (req, res) => {
  const token = req.body.token;
  const username = req.session.user;
  const guessableFileName = Buffer.from(username)
    .toString("base64")
    .substring(0, 6);
  const directoryName = path.join(__dirname, "db", "otpkeys");
  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
  }
  const authenticatorSecret = fs.readFileSync(
    path.join(directoryName, guessableFileName),
    "utf-8"
  );
  console.log(authenticatorSecret, token);
  const isValid = authenticator.check(token, authenticatorSecret);
  if (isValid) {
    req.session.twoFactorAuthenticated = true;
    console.log("2AF activé");
    res.redirect("/blog");
  }
});

app.get("/qrcode", isAuthenticated, (req, res) => {
  const username = req.session.user;
  const service = "ProjetDevAuth";
  const secret = authenticator.generateSecret();
  const guessableFileName = Buffer.from(username)
    .toString("base64")
    .substring(0, 6);
  const directoryName = path.join(__dirname, "db", "otpkeys");
  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
  }
  fs.writeFileSync(path.join(directoryName, guessableFileName), secret);
  const keyURI = authenticator.keyuri(username, service, secret);
  qrcode.toDataURL(keyURI, (err, data_url) => {
    if (err) {
      return res.status(500).send("Erreur serveur");
    }
    const user = registeredUsers.users.find((user) => user.email === username);
    user.active2AF = true;
    fs.writeFileSync(filePathUser, JSON.stringify(registeredUsers, null, 2));
    //res.send(`<img src="${data_url}" />`);
    res.json({ qrCodeData: data_url });
  });
});

app.listen(3000, () => {
  console.log("👌 Server is running on port 3000");
});
