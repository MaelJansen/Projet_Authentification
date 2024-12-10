const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Pour hacher les mots de passe

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is2FAEnabled: { type: Boolean, default: false }, // Indique si 2FA est activé
  jwtTokens: [{ token: String }] // Liste des JWT valides
});

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
