import { useEffect, useRef } from 'react'
import { createGame, destroyGame } from '@game/Game'
import './GameCanvas.css'

function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    createGame(containerRef.current)

    return () => {
      destroyGame()
    }
  }, [])

  return (
    <div className="game-shell">
      <div ref={containerRef} className="game-canvas" aria-label="Portfolio battle game" />
      <footer className="nintendo-copyright">
        Pokémon and Pokémon character names are trademarks of Nintendo / Creatures Inc. / GAME FREAK
        inc. This is a fan-made portfolio project and is not affiliated with or endorsed by Nintendo.
      </footer>
    </div>
  )
}

export default GameCanvas
