import { useState, useEffect } from 'react'

function App() {
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        const data = await response.json()
        
        // Fetch details for all Pokemon to get sprites
        const detailedPokemon = await Promise.all(
          data.results.map(poke => fetch(poke.url).then(res => res.json()))
        )
        
        setPokemon(detailedPokemon)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [])

  const fetchPokemonDetails = async (poke) => {
    setSelectedPokemon(poke)
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Pokemon...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    )
  }

  const filteredPokemon = pokemon.filter(poke =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedPokemon) {
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
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
              <div className="col-md-8">
                <h2 className="text-capitalize">
                  #{String(selectedPokemon.id).padStart(3, '0')} {selectedPokemon.name}
                </h2>
                <p><strong>Height:</strong> {selectedPokemon.height}</p>
                <p><strong>Weight:</strong> {selectedPokemon.weight}</p>
                <p><strong>Types:</strong> {selectedPokemon.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Abilities:</strong> {selectedPokemon.abilities.map(a => a.ability.name).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
                onClick={() => setSearchTerm('')}
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
                  style={{ height: '200px', objectFit: 'contain', padding: '10px' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title text-capitalize">
                  #{String(poke.id).padStart(3, '0')} {poke.name}
                </h5>
                <button 
                  onClick={() => fetchPokemonDetails(poke)}
                  className="btn btn-med btn-primary"
                  disabled={detailsLoading}
                >
                  {detailsLoading ? 'Loading...' : 'View Details'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
