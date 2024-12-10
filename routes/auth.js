const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Clé secrète pour signer les JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Route : Inscription
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé.' });

    // Créez un nouvel utilisateur
    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
});

// Route : Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Trouvez l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable.' });

    // Vérifiez le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    // Générer un JWT
    const token = jwt.sign(
      { userId: user._id, is2FAEnabled: user.is2FAEnabled },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Ajoutez le token à la liste des tokens valides de l'utilisateur
    user.jwtTokens.push({ token });
    await user.save();

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
});

// Route : Déconnexion
router.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ 'jwtTokens.token': token });
    if (!user) return res.status(400).json({ message: 'Token invalide.' });

    // Supprimez le token de la liste des tokens valides
    user.jwtTokens = user.jwtTokens.filter(t => t.token !== token);
    await user.save();

    res.status(200).json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
});

module.exports = router;
