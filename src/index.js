import express from "express";
import cors from "cors";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

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





//correction GET par ID
/*app.get("/api/pokemons/:id", (req,res) => {
  //console.log(req.params.id)
  //console.log(typeof req.params.id)

  const pokemon = pokemonsList.find(
    (pokemon) => pokemon.id === parseInt(req.params.id)
  )

  if (!pokemon){
    res.status(404).send({
      type:'error',
      message: 'Pokemon not fond'
    })
  }

  //console.log(pokemon)
  res.status(200).send({
    type: 'sucess',
    pokemon
  })
})

//correction pour l'ajout d'un pokémon
app.post("/api/pokemons", (req,res) => {
  console.log(req.body)
  pokemonsList.push(req.body)
  fs.writeFileSync(
    path.join(__dirname, "./data/pokemons.json"),
    JSON.stringify(pokemonsList, null,2)
  )

  res.status(200).send({
    type:'sucess',
    pokemons: pokemonsList,
    message: "Pokemon created"
  })
})


  //correction pour la suppression d'un pokémon
  app.delete("/api/pokemons", (req,res) => {
    const pokemon = pokemonsList.find(
      (pokemon) => pokemon.id === parseInt(req.params.id)
    )
    
    if (!pokemon){
      //Utiliser return pour arrêter le programme
      return res.status(404).send({
        type:'error',
        message: 'Pokemon not fond'
      })
    }

    res.status(200).send({
      type:'sucess',
      pokemons: pokemonsList,
      message: "Pokemon deleted"
    })

  })*/

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
  const pokemonsFilePath = path.join(__dirname, "./data/pokemons.json");

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
  fs.writeFile(pokemonsFilePath, JSON.stringify(pokemonsList, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      return res.status(500).send({ error: "Erreur interne du serveur" });
    }
      res.status(200).send({ message: "Pokémon supprimé avec succès", deletedPokemon });
  });
  res.status(201).json({ message: "Pokémon ajouté avec succès", pokemon: newPokemon });
});

app.put("/api/pokemons/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, base, image } = req.body;
  const pokemonsFilePath = path.join(__dirname, "./data/pokemons.json");

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

  fs.writeFile(pokemonsFilePath, JSON.stringify(pokemonsList, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      return res.status(500).send({ error: "Erreur interne du serveur" });
    }
      res.status(200).send({ message: "Pokémon supprimé avec succès", deletedPokemon });
  });

  res.status(200).json({
      message: "Pokémon mis à jour avec succès",
      pokemon: pokemonsList[pokemonIndex]
  });
});


app.delete("/api/pokemons/:id", (req, res) => {
  const id = parseInt(req.params.id); // Convertit l'ID en nombre
  const index = pokemonsList.findIndex(p => p.id === id);
  const pokemonsFilePath = path.join(__dirname, "./data/pokemons.json");

  if (index === -1) {
    return res.status(404).send({ error: "Pokémon non trouvé" });
  }

  const deletedPokemon = pokemonsList.splice(index, 1)[0];


  fs.writeFile(pokemonsFilePath, JSON.stringify(pokemonsList, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      return res.status(500).send({ error: "Erreur interne du serveur" });
    }
      res.status(200).send({ message: "Pokémon supprimé avec succès", deletedPokemon });
    });
  res.status(200).send(deletedPokemon); 
});

app.get("/", (req, res) => {
  res.send("bienvenue sur l'API Pokémon");
});




// ------------ AXIOS -------------------- 
const deletePokemon = async (id) => {
  try {
      const response = await axios.delete(`http://localhost:3000/api/pokemons/${id}`);
      console.log(response.data.message); // Message de confirmation
  } catch (error) {
      console.error("Erreur lors de la suppression :", error.response?.data || error.message);
  }
};


// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

