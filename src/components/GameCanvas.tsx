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
    </div>
  )
}

export default GameCanvas
