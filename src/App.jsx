import { useState, useEffect } from "react";
import { useSquad } from "./context/SquadContext.jsx";

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const { squad, addToSquad, removeFromSquad, isInSquad, remainingSlots } =
    useSquad();

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=151"
        );
        const data = await response.json();

        // Fetch details for all Pokemon to get sprites
        const detailedPokemon = await Promise.all(
          data.results.map((poke) => fetch(poke.url).then((res) => res.json()))
        );

        setPokemon(detailedPokemon);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  const fetchPokemonDetails = async (poke) => {
    setSelectedPokemon(poke);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Pokemon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  const filteredPokemon = pokemon.filter((poke) =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPokemon) {
    const inSquad = isInSquad(selectedPokemon.id);
    return (
      <div className="container mt-5">
        <button
          className="btn btn-secondary mb-4"
          onClick={() => setSelectedPokemon(null)}
        >
          ← Back to List
        </button>
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 text-center">
                <img
                  src={selectedPokemon.sprites.front_default}
                  alt={selectedPokemon.name}
                  className="img-fluid"
                  style={{ width: "200px", height: "200px" }}
                />
              </div>
              <div className="col-md-8 text-center">
                <h2 className="text-capitalize">
                  #{String(selectedPokemon.id).padStart(3, "0")}{" "}
                  {selectedPokemon.name}
                </h2>
              </div>
              <p>
                <strong>Height:</strong> {selectedPokemon.height} ft
              </p>
              <p>
                <strong>Weight:</strong> {selectedPokemon.weight} lbs
              </p>
              <p>
                <strong>Types:</strong>{" "}
                {selectedPokemon.types.map((t) => t.type.name).join(", ")}
              </p>
              <p>
                <strong>Abilities:</strong>{" "}
                {selectedPokemon.abilities
                  .map((a) => a.ability.name)
                  .join(", ")}
              </p>
              <div className="d-flex gap-1 justify-content-center">
                <button
                  className={`btn ${
                    inSquad ? "btn-outline-danger" : "btn-outline-success"
                  }`}
                  onClick={() =>
                    inSquad
                      ? removeFromSquad(selectedPokemon.id)
                      : addToSquad(selectedPokemon)
                  }
                  disabled={!inSquad && remainingSlots === 0}
                >
                  {inSquad
                    ? "Remove from Squad"
                    : remainingSlots === 0
                    ? "Squad Full"
                    : "Add to Squad"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12 text-center mb-4">
          <h1 className="display-4 text-primary">Pokeverse</h1>
          <p className="lead">Original 151 Pokemon</p>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="mb-1">Squad ({squad.length}/6)</h5>
                <small className="text-muted">
                  {remainingSlots
                    ? `${remainingSlots} slot${
                        remainingSlots === 1 ? "" : "s"
                      } left`
                    : "Squad is full"}
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {squad.length === 0 ? (
                  <span className="text-muted">No Pokemon selected yet</span>
                ) : (
                  squad.map((member) => (
                    <div
                      key={member.id}
                      className="d-flex align-items-center border rounded-pill px-3 py-1 gap-2"
                    >
                      {member.sprites?.front_default && (
                        <img
                          src={member.sprites.front_default}
                          alt={member.name}
                          width="40"
                          height="40"
                        />
                      )}
                      <span className="text-capitalize">
                        #{String(member.id).padStart(3, "0")} {member.name}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromSquad(member.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
              <button
                className={squad.length < 2 ? "btn btn-warning disabled" : "btn btn-success"}
                onClick={() => squad.length >= 2 && startBattle(squad)}
              >
               {squad.length >= 2 ? "Start Battle" : "Select at least 2 Pokemon"}
              </button>
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-3 mx-auto">
          <div className="input-group">
            <span className="input-group-text">🔎</span>
            <input
              type="text"
              className="form-control"
              placeholder="Search Pokemon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-danger"
                type="button"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>
          <small className="text-muted d-block mt-2">
            Showing {filteredPokemon.length} of {pokemon.length} Pokemon
          </small>
        </div>
      </div>
      <div className="row g-3">
        {filteredPokemon.map((poke) => (
          <div key={poke.name} className="col-md-4 col-lg-3">
            <div className="card h-100">
              {poke.sprites?.front_default && (
                <img
                  src={poke.sprites.front_default}
                  alt={poke.name}
                  className="card-img-top"
                  style={{
                    height: "200px",
                    objectFit: "contain",
                    padding: "10px",
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title text-capitalize">
                  #{String(poke.id).padStart(3, "0")} {poke.name}
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`btn btn-sm ${
                      isInSquad(poke.id)
                        ? "btn-outline-danger"
                        : "btn-outline-success"
                    }`}
                    onClick={() =>
                      isInSquad(poke.id)
                        ? removeFromSquad(poke.id)
                        : addToSquad(poke)
                    }
                    disabled={!isInSquad(poke.id) && remainingSlots === 0}
                  >
                    {isInSquad(poke.id)
                      ? "Remove"
                      : remainingSlots === 0
                      ? "Squad Full"
                      : "Add to Squad"}
                  </button>
                  <button
                    onClick={() => fetchPokemonDetails(poke)}
                    className="btn btn-sm btn-primary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
