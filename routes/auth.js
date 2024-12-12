const express = require("express");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
const db = require("../db");

const router = express.Router();

// Configure la stratégie Google OAuth avec Passport
passport.use(new GoogleStrategy({
  clientID: process.env["GOOGLE_CLIENT_ID"],
  clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
  callbackURL: "/oauth2/redirect/google",  
  scope: ["profile"],  
}, function verify(issuer, profile, cb) {
  db.get("SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?", [
    issuer,
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }

    if (!row) {
      db.run("INSERT INTO users (name) VALUES (?)", [
        profile.displayName
      ], function(err) {
        if (err) { return cb(err); }
        
        const id = this.lastID;
        db.run("INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)", [
          id,
          issuer,
          profile.id
        ], function(err) {
          if (err) { return cb(err); }

          const user = {
            id: id,
            name: profile.displayName
          };
          return cb(null, user);  
        });
      });
    } else {
      db.get("SELECT * FROM users WHERE id = ?", [row.user_id], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row); 
      });
    }
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, name: user.name }); 
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user); 
  });
});


// Route de connexion (affiche la page HTML de connexion)
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login_form.html"));
});

// Route de redirection vers Google pour l'authentification
router.get("/login/federated/google", passport.authenticate("google"));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


// Route de déconnexion
router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});




module.exports = router;
