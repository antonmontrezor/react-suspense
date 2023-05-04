// Render as you fetch
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from 'utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    setPokemonResource(() => {
      if (!pokemonName) return null
      return createPokemonResource(pokemonName)
    })
  }, [pokemonName])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  // return (
  //   <div className="pokemon-info-app">
  //     <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
  //     <hr />
  //     <div className="pokemon-info">
  //       {pokemonResource ? (
  //         // resetKeys is used by the Boundary to clear out the error when a user manually changes pokemonResource 
  //         <PokemonErrorBoundary onReset={() => setPokemonName('')} resetKeys={[pokemonResource]}>
  //           <React.Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
  //             <PokemonInfo pokemonResource={pokemonResource} />
  //           </React.Suspense>
  //         </PokemonErrorBoundary>
  //       ) : (
  //         'Submit a pokemon'
  //       )}
  //     </div>
  //   </div>
  // )

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        {pokemonResource ? (
          // resetKeys is used by the Boundary to clear out the error when a user manually changes pokemonResource 
          <PokemonErrorBoundary onReset={() => setPokemonName('')} resetKeys={[pokemonResource]}>
            <React.Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default App
