const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const db = require('../db');

const router = express.Router();

router.get('/login/federated/google', passport.authenticate('google'));

module.exports = router;