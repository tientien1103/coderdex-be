const fs = require("fs");
const express = require("express");
const router = express.Router();
const allowedTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
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
];
router.get("/", (req, res, next) => {
  const allowedFilter = ["name", "types", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    console.log(req.query);
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery); // ["types", "name"]

    filterKeys.forEach((key) => {
      if (!filterQuery[key] && filterQuery[key] !== 0) delete filterQuery[key];
      if (key === "types" && !allowedTypes.includes(filterQuery[key])) {
        const exception = new Error("Invalid type.");
        exception.statusCode = 400;
        throw exception;
      }
    });

    let offset = limit * (page - 1);

    let db = fs.readFileSync("pokemon.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    let result = [];
    ///  'tuan'.includes('tau') => true
    ///  ['tuan','tien'].includes('tuan') => true
    // ["types", "name"]

    if (filterKeys.length === 1) {
      if (filterKeys[0] === "types") {
        result = pokemons.filter((poke) =>
          poke.types.includes(filterQuery.types.trim().toLowerCase())
        );
      } else {
        result = pokemons.filter((poke) =>
          poke.name.includes(filterQuery.name.trim().toLowerCase())
        );
      }
    } else if (filterKeys.length === 2) {
      result = pokemons.filter(
        (poke) =>
          poke.types.includes(filterQuery.types.trim().toLowerCase()) &&
          poke.name.includes(filterQuery.name.trim().toLowerCase())
      );
    } else {
      result = pokemons;
    }
    // if (filterKeys.length) {
    //   filterKeys.forEach((key) => {
    //     if (key === "name") {
    //       result = result.length
    //         ? result.filter((poke) =>
    //             poke.name
    //               .toLowerCase()
    //               .includes(filterQuery[key].trim().toLowerCase())
    //           )
    //         : pokemons.filter((poke) =>
    //             poke.name
    //               .toLowerCase()
    //               .includes(filterQuery[key].trim().toLowerCase())
    //           );
    //     }
    //     if (key === "types") {
    //       result = result.length
    //         ? result.filter((poke) =>
    //             poke.types.includes(filterQuery[key].trim().toLowerCase())
    //           )
    //         : pokemons.filter((poke) =>
    //             poke.types.includes(filterQuery[key].trim().toLowerCase())
    //           );
    //     }
    //   });
    // } else {
    //   result = pokemons;
    // }

    result = result.slice(offset, offset + limit);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:pokemonId", (req, res, next) => {
  try {
    const pokemonId = Number(req.params.pokemonId);
    // console.log(pokemonId);

    let db = fs.readFileSync("pokemon.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    // Handle error
    // if (pokemonId > pokemons.length || pokemonId < 1) {
    //   const exception = new Error(`pokemon not found`);
    //   exception.statusCode = 404;
    //   throw exception;
    // }
    let result = [];
    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );
    if (targetIndex === 0) {
      result.push(pokemons[pokemons.length - 1]);
      result.push(pokemons[0]);
      result.push(pokemons[1]);
    } else if (targetIndex === pokemons.length - 1) {
      result.push(pokemons[pokemons.length - 2]);
      result.push(pokemons[pokemons.length - 1]);
      result.push(pokemons[0]);
    } else {
      result.push(pokemons[targetIndex - 1]);
      result.push(pokemons[targetIndex]);
      result.push(pokemons[targetIndex + 1]);
    }

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const { name, id, types, imageUrl, pages } = req.body;
    // if (!name || !types || !imageUrl || !id) {
    //   const exception = new Error("Missing required data");
    //   exception.statusCode = 400;
    //   throw exception;
    // }

    let db = fs.readFileSync("pokemon.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;

    const newPokemon = {
      name,
      types,
      imageUrl,
      pages: parseInt(pages) || 1,
      id,
    };
    // console.log(types);
    if (newPokemon.types.length > 2) {
      const exception = new Error("Pokémon can only have one or two types.");
      exception.statusCode = 400;
      throw exception;
    }
    const filterTypeValue = Object.values(newPokemon.types);
    filterTypeValue.forEach((value) => {
      if (!allowedTypes.includes(value)) {
        const exception = new Error("Pokémon's type is invalid.");
        exception.statusCode = 400;
        throw exception;
      }
    });
    let existedName = [];
    pokemons.forEach((pokemon) => {
      existedName.push(pokemon.name);
    });
    let existedId = [];
    pokemons.forEach((pokemon) => {
      existedId.push(pokemon.id);
    });
    existedName.forEach((name) => {
      if (newPokemon.name === name) {
        const exception = new Error("The Pokémon already exists.");
        exception.statusCode = 400;
        throw exception;
      }
    });
    existedId.forEach((id) => {
      if (newPokemon.id === id) {
        const exception = new Error("The Pokémon already exists.");
        exception.statusCode = 400;
        throw exception;
      }
    });

    pokemons.push(newPokemon);
    db.pokemons = pokemons;
    db = JSON.stringify(db);
    fs.writeFileSync("pokemon.json", db);
    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
