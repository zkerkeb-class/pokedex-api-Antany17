import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import saveJson from "./utils/saveJson.js";
import connectDB from "./config/connectdb.js";
import Pokemon from "./models/pokemon.js";

dotenv.config(); //recupérer les variables d'environnement

connectDB();

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
