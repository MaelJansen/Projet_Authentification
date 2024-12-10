const mongoose = require('mongoose');

const connectDB = async () => 
{
  try 
  {
    const conn = await mongoose.connect(process.env.MONGO_URI, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur : ${error.message}`);
    process.exit(1); // Arrête le processus si la connexion échoue
  }
};

module.exports = connectDB;