const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 

dotenv.config(); 

const app = express();

// Middlewares
app.use(express.json()); 
app.use(cors()); 

// Connexion à la base de données
connectDB();

// Routes
app.get('/', (req, res) => 
{
  res.send('Bienvenue sur l\'API du blog !');
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));


const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use(express.static('public'));