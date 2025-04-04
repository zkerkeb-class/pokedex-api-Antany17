
import mongoose from 'mongoose';

const pokemonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    french: String,
    english: String,
    japanese: String,
    chinese: String
  },
  types: [{
    type: String,
    enum: [
      "Fire", "Water", "Grass", "Electric", "Ice", "Fighting",
      "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock",
      "Ghost", "Dragon", "Dark", "Steel", "Fairy"
    ]
  }],
  image: {
    type: String
  },
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
    speed: Number
  },
  evolutions: [{
    type: Number,
    ref: 'Pokemon'
  }]
}, {
  timestamps: true
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

export default Pokemon;
