import { useEffect, useState } from "react";
import {
  fetchAllPokemon,
  fetchPokemonSpeciesByName,
  fetchPokemonDetailsByName,
  fetchEvolutionChainById,
} from "./api";

function App() {
  const [pokemonIndex, setPokemonIndex] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pokemonEvolutionChain, setPokemonEvolutionChain] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      const { results: pokemonList } = await fetchAllPokemon();

      setPokemon(pokemonList);
    };

    fetchPokemon().then(() => {
      /** noop **/
    });
  }, [searchValue]);

  // Filtered Pokemon list
  const filteredPokemonList = pokemon.filter((monster) =>
    monster.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const onSearchValueChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
  };

  const onGetDetails = (name) => async () => {
    try {
      // Fetch Pokémon species details
      const speciesData = await fetchPokemonSpeciesByName(name);

      // Get evolution chain ID from species data and fetch evolution chain
      const evolutionId = speciesData.evolution_chain.url.split("/")[6]; // Extract evolution chain ID from URL
      const evolutionData = await fetchEvolutionChainById(evolutionId);

      // Fetch additional Pokémon details (e.g., base stats, types, etc.)
      const pokemonData = await fetchPokemonDetailsByName(name);

      // Update state with the fetched data
      setPokemonIndex(pokemonData);
      setPokemonEvolutionChain(evolutionData);
    } catch (error) {
      console.error("Error fetching Pokémon details", error);
    }
  };

  // Different Pokemon Evolution stages
  const firstStage = pokemonEvolutionChain?.chain?.species.name;
  const secondStage = pokemonEvolutionChain?.chain?.evolves_to;
  const thirdStage = pokemonEvolutionChain?.chain?.evolves_to[0]?.evolves_to;
  return (
    <div className={"pokedex__container"}>
      <div className={"pokedex__search-input"}>
        <input
          value={searchValue}
          onChange={onSearchValueChange}
          placeholder={"Search Pokemon"}
        />
      </div>
      <div className={"pokedex__content"}>
        {pokemon.length > 0 && (
          <div className={"pokedex__search-results"}>
            {filteredPokemonList.length > 0
              ? filteredPokemonList.map((monster) => {
                  return (
                    <div className={"pokedex__list-item"} key={monster.name}>
                      <div>{monster.name}</div>
                      <button onClick={onGetDetails(monster.name)}>
                        Get Details
                      </button>
                    </div>
                  );
                })
              : "No Results Found"}
          </div>
        )}
        {pokemonIndex && (
          <div className={"pokedex__details"}>
            <h4>{pokemonIndex.name}</h4>
            <div className="pokedex__details-attributes">
              <div className="pokedex__details-types">
                <h4>Types</h4>
                <ul>
                  {pokemonIndex.types.map((type, index) => (
                    <li key={index}>{type.type.name}</li>
                  ))}
                </ul>
              </div>
              <div className="pokedex__details-moves">
                <h4>Moves</h4>
                <ul>
                  {pokemonIndex.moves.slice(0, 4).map((move, index) => (
                    <li key={index}>{move.move.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <h4>Evolutions</h4>
            <div className="pokedex__details-evolutions">
              <em>{firstStage}</em>
              {secondStage?.length > 0 && (
                <>
                  {secondStage.map((evolve) => (
                    <em key={evolve.species.name}>{evolve.species.name}</em>
                  ))}
                </>
              )}
              {thirdStage?.length >
                0 && (
                <>
                  {thirdStage.map((evolve) => (
                    <em key={evolve.species.name}>{evolve.species.name}</em>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
