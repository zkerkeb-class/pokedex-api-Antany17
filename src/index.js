import express from "express";
import cors from "cors";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Lire le fichier JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pokemonsList = JSON.parse(fs.readFileSync(path.join(__dirname, './data/pokemons.json'), 'utf8'));

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
app.get("/api/pokemons", (req, res) => {
  res.status(200).send({
    types: [
      "fire",
      "water",
      "grass",
      "electric",
      "ice",
      "fighting",
      "poison",
      "ground",
      "flying",
      "psychic",
      "bug",
      "rock",
      "ghost",
      "dragon",
      "dark",
      "steel",
      "fairy",
    ],
    pokemons: pokemonsList,
  });
});


app.get("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id); // Convertir l'ID en nombre
  const pokemon = pokemonsList.find(p => p.id === id); // Recherche par ID

  if (!pokemon) {
    return res.status(404).send({ error: "Pokémon non trouvé" });
  }

  res.status(200).send(pokemon);
});

app.post("/api/pokemons", (req, res) => {
  const { name, type, base, image } = req.body;

  // Vérification des données
  if (!name || !type || !base || !image) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Générer un nouvel ID basé sur le plus grand ID existant
  const newId = pokemonsList.length > 0 ? Math.max(...pokemonsList.map(p => p.id)) + 1 : 1;

  // Créer le nouveau Pokémon
  const newPokemon = {
      id: newId,
      name,
      type,
      base,
      image
  };

  // Ajouter à la liste
  pokemonsList.push(newPokemon);

  res.status(201).json({ message: "Pokémon ajouté avec succès", pokemon: newPokemon });
});

app.put("/api/pokemons/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, base, image } = req.body;

  // Convertir id en nombre
  const pokemonId = parseInt(id);

  // Chercher le Pokémon par ID
  const pokemonIndex = pokemonsList.findIndex(p => p.id === pokemonId);

  if (pokemonIndex === -1) {
      return res.status(404).json({ message: "Pokémon non trouvé" });
  }

  // Mise à jour des champs fournis
  if (name) pokemonsList[pokemonIndex].name = name;
  if (type) pokemonsList[pokemonIndex].type = type;
  if (base) pokemonsList[pokemonIndex].base = base;
  if (image) pokemonsList[pokemonIndex].image = image;

  res.status(200).json({
      message: "Pokémon mis à jour avec succès",
      pokemon: pokemonsList[pokemonIndex]
  });
});


app.delete("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id); // Convertit l'ID en nombre
  const index = pokemonsList.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "Pokémon non trouvé" });
  }

  const deletedPokemon = pokemonsList.splice(index, 1)[0];
  //fs.writeFileSync("./pokemons.json", JSON.stringify(pokemonsList, null, 2));

  res.status(200).send(deletedPokemon);
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
