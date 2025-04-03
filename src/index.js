import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import saveJson from "./utils/saveJson.js";

dotenv.config();

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
app.get("/api/pokemons", (req, res) => {
  res.status(200).send({
    pokemons: pokemonsList,
  });
});

app.get("/api/pokemons/:id", (req, res) => {
  console.log(req.params.id);
  console.log(typeof req.params.id);
  const pokemon = pokemonsList.find(
    (pokemon) => pokemon.id === parseInt(req.params.id)
  );

  if (!pokemon) {
    res.status(404).send({
      type: "error",
      message: "Pokemon not found",
    });
  }

  res.status(200).send({
    type: "success",
    pokemon,
  });
});

app.post("/api/pokemons", (req, res) => {
  // Faire validation du body
  console.log(req.body);
  pokemonsList.push(req.body);
  console.log(pokemonsList);

  saveJson(pokemonsList, path.join(__dirname, "./data/pokemons.json"));
  res.status(200).send({
    type: "success",
    pokemons: pokemonsList,
    message: "Pokemon created",
  });
});

app.delete("/api/pokemons/:id", (req, res) => {
  console.log(req.params.id);
  const pokemon = pokemonsList.find(
    (pokemon) => pokemon.id === parseInt(req.params.id)
  );


  if (!pokemon) {
    return res.status(404).send({
      type: "error",
      message: "Pokemon not found",
    });
  }

  const newPokemonsList = pokemonsList.filter(
    (pokemon) => pokemon.id !== parseInt(req.params.id)
  );

  saveJson(newPokemonsList, path.join(__dirname, "./data/pokemons.json"));
  res.status(200).send({
    type: "success",
    message: "Pokemon deleted",
  });
});

app.put("/api/pokemons/:id", (req, res) => {
  const pokemon = pokemonsList.find(
    (pokemon) => pokemon.id === parseInt(req.params.id)
  );
  if (!pokemon) {
    return res.status(404).send({
      type: "error",
      message: "Pokemon not found",
    });
  }
  const indexOfPokemon = pokemonsList.indexOf(pokemon);

  pokemonsList.splice(indexOfPokemon, 1, req.body);
  saveJson(pokemonsList, path.join(__dirname, "./data/pokemons.json"));

  res.status(200).send({
    type: "success",
    message: "Pokemon updated",
  });
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
