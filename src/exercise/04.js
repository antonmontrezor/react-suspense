// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

const PokemonResourceCacheContext = React.createContext()

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

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function usePokemonResourceCache() {
  return React.useContext(PokemonResourceCacheContext)
}

function PokemonCacheProvider({children, cacheTime}) {
  const pokemonResourceCache = React.useRef({})
  const expirations = React.useRef({})

  React.useEffect(() => {
    const interval = setInterval(() => {
      for (const [name, time] of Object.entries(expirations.current)) {
        if (time < Date.now()) {
          delete pokemonResourceCache.current[name]
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getPokemonResource = React.useCallback((name) => {
    const lowerCaseName = name.toLowerCase()
    let resource = pokemonResourceCache.current[lowerCaseName]
    if (!resource) {
      resource = createPokemonResource(lowerCaseName)
      pokemonResourceCache.current[lowerCaseName] = resource

      expirations.current[name] = Date.now() + cacheTime

      // my approach is to setTimeout, so every time we get a resource stored in pokemonResourceCache.current on name change, we then remove it 5 seconds later
      // and it's not dependant on component lifecycles which might make it less reliable. It's less performant as we would create multiple set timeouts instead of running an interval as a side effect
      // setTimeout(() => {
      //   delete pokemonResourceCache.current[lowerCaseName]
      // }, cacheTime)
    }
  
    return resource
    // no need to use pokemonResourceCache as a dependancy, we could though since it's the same object because of userRef. If we destructure it to get current, we would anyway be using current
    // like we do use it now since it's the same property/object within pokemonResourceCache
  }, [cacheTime])

  return <PokemonResourceCacheContext.Provider value={getPokemonResource}>{children}</PokemonResourceCacheContext.Provider>
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)
  const getPokemonResource = usePokemonResourceCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [getPokemonResource, pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
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

function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheTime={5000}>
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider
