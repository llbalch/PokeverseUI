import { createContext, useContext, useMemo, useState } from 'react'

const SquadContext = createContext(null)

export function SquadProvider({ children }) {
  const [squad, setSquad] = useState([])

  const addToSquad = (pokemon) => {
    setSquad((prev) => {
      if (prev.find((member) => member.id === pokemon.id)) return prev
      if (prev.length >= 6) return prev
      return [...prev, pokemon]
    })
  }

  const removeFromSquad = (pokemonId) => {
    setSquad((prev) => prev.filter((member) => member.id !== pokemonId))
  }

  const value = useMemo(() => ({
    squad,
    addToSquad,
    removeFromSquad,
    isInSquad: (pokemonId) => squad.some((member) => member.id === pokemonId),
    remainingSlots: Math.max(0, 6 - squad.length),
  }), [squad])

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  )
}

export function useSquad() {
  const context = useContext(SquadContext)
  if (!context) {
    throw new Error('useSquad must be used within a SquadProvider')
  }
  return context
}
