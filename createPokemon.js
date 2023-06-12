const fs = require("fs");
const csv = require("csvtojson");

const createPokemon = async () => {
  let newData = await csv().fromFile("pokemon.csv");
  let data = JSON.parse(fs.readFileSync("pokemon.json"));
  newData = new Set(newData);
  newData = Array.from(newData);
  newData = newData.slice(0, 721);

  data.pokemons = newData.map((e, i) => {
    let types = [e.Type1.toLowerCase()];
    if ("Type2" in e) {
      types.push(e.Type2.toLowerCase());
    }
    // console.log(types);
    let pokemon = {
      id: i + 1,
      name: e.Name,
      types,
      imageUrl: `http://localhost:8000/images/${i + 1}.png`,
    };

    return pokemon;
  });

  fs.writeFileSync("pokemon.json", JSON.stringify(data));
  // console.log(data);
};
createPokemon();
