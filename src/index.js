import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import saveJson from "./utils/saveJson.js";
import connectDB from "./config/connectdb.js";
import Pokemon from "./models/pokemon.js";
import jwt from 'jsonwebtoken';

dotenv.config(); //recupérer les variables d'environnement

connectDB();

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'password123', // "password123"
    role: 'admin',
    favorites: [] // Tableau pour stocker les IDs des Pokémon favoris

  },
  {
    id: 2,
    username: 'admin2',
    password: 'password123', // "password123"
    role: 'admin',
    favorites: [] // Tableau pour stocker les IDs des Pokémon favoris

  }
];

// Lire le fichier JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokemonsList = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./data/pokemons.json"), "utf8")
);

const app = express();
const PORT = 3000;

// Middleware pour CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour servir des fichiers statiques
// 'app.use' est utilisé pour ajouter un middleware à notre application Express
// '/assets' est le chemin virtuel où les fichiers seront accessibles
// 'express.static' est un middleware qui sert des fichiers statiques
// 'path.join(__dirname, '../assets')' construit le chemin absolu vers le dossier 'assets'
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Route GET de base
app.get("/api/pokemons", async (req, res) => {
  const pokemons = await Pokemon.find({});
  console.log("🚀 ~ app.get ~pokemons:", pokemons);
  res.status(200).send({
    pokemons: pokemons,
  });
});

const handleNoPokemon = (res, errorCode = 1) => {
  let message = "Pokemon not found";

  switch (errorCode) {
    case 1:
      message = "Pokemon not found";
      break;
    case 2:
      message = "Digimon not found";
      break;
  }

  return res.status(404).send({
    type: "error",
    message,
  });
};

app.get("/api/pokemons/:id", async (req, res) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id);
    if (!pokemon) {
     return handleNoPokemon(res, 1);
    }

    return res.status(200).send({
      pokemon,
    });
  } catch (error) {
   return handleNoPokemon(res, 2);
  }
});

app.post("/api/pokemons", async (req, res) => {
  try {
    const pokemon = await Pokemon.create(req.body);
    return res.status(201).send({
      pokemon,
    });
  } catch (error) {
    return res.status(400).send({
      type: "error",
      message: error.message,
    });
  }
});

app.delete("/api/pokemons/:id", async (req, res) => {
  try {
      const pokemon = await Pokemon.findByIdAndDelete(req.params.id);
      if (!pokemon) {
        return handleNoPokemon(res, 1);
      }
      return res.status(200).send({
        type: "success",
        message: "Pokemon deleted",
      });
  } catch (error) {
    return handleNoPokemon(res, 1);
  }
});

app.put("/api/pokemons/:id", async (req, res) => {
  try {
    // verifie la structure grace a la validation mongoose
    const { error } = await Pokemon.validate(req.body);
    console.log("🚀 ~ app.put ~ error:", error)

  
    
    const pokemon = await Pokemon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true  // Active la validation Mongoose lors de la mise à jour
    });
    if (!pokemon) {
      return handleNoPokemon(res, 1);
    }
    return res.status(200).send({
      pokemon,
    });
  } catch (error) {
    console.log("🚀 ~ app.put ~ error:", error)
    return res.status(400).send({
      type: "error",
      message: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});


// Route d'inscription
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérification si l'utilisateur existe déjà
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
  }

  // Hashage du mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Création d'un nouvel utilisateur
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role: 'user'
  };

  users.push(newUser);

  res.status(201).json({ message: 'Utilisateur créé avec succès' });
});

// Route de connexion
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Recherche de l'utilisateur
  const user = users.find(user => user.username === username);

  if (!user || password !== user.password) {
      return res.status(400).json({ message: 'Identifiants invalides' });
  }


  // Création du payload JWT
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };

  // Génération du token
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
});


const auth = (req, res, next) => {
  // Récupération du token depuis l'en-tête
  const token = req.headers['authorization']?.split(' ')[1];
  // Vérification de la présence du token
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout des informations utilisateur à l'objet requête
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Route protégée - accessible uniquement avec un token valide
app.get('/api/profile', auth, (req, res) => {
  res.json({
    message: 'Profil récupéré avec succès',
    user: req.user
  });
});

// Route protégée avec vérification de rôle
app.get('/api/admin', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé: droits d\'administrateur requis' });
  }

  res.json({
    message: 'Zone administrative',
    user: req.user
  });
});


// Route pour ajouter un Pokémon aux favoris
app.post('/api/favorites', auth, (req, res) => {
  const { pokemonId } = req.body;
  const userId = req.user.id;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  if (!user.favorites.includes(pokemonId)) {
    user.favorites.push(pokemonId);
  }

  res.json({ message: 'Pokémon ajouté aux favoris', favorites: user.favorites });
});

// Route pour supprimer un Pokémon des favoris
app.delete('/api/favorites/:pokemonId', auth, (req, res) => {
  const { pokemonId } = req.params;
  const userId = req.user.id;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  user.favorites = user.favorites.filter(id => id !== parseInt(pokemonId));
  res.json({ message: 'Pokémon retiré des favoris', favorites: user.favorites });
});

// Route pour obtenir les Pokémon favoris
app.get('/api/favorites', auth, (req, res) => {
  const userId = req.user.id;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  res.json({ favorites: user.favorites });
}); 

// Route de déconnexion
app.post('/api/logout', auth, (req, res) => {
  // Cette route est plus pour la cohérence de l'API
  // La déconnexion se fait côté client en supprimant le token
  res.json({ message: 'Déconnexion réussie' });
});