import { useEffect, useState } from 'react'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { getGameInstance } from '@game/Game'
import './WelcomeOverlay.css'

function WelcomeOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = () => setVisible(true)
    EventBus.on(GAME_EVENTS.SHOW_WELCOME, show)
    return () => {
      EventBus.off(GAME_EVENTS.SHOW_WELCOME, show)
    }
  }, [])

  const startAdventure = () => {
    const game = getGameInstance()
    if (game?.sound.locked) {
      game.sound.unlock()
    }
    setVisible(false)
    EventBus.emit(GAME_EVENTS.WELCOME_CONTINUE)
  }

  if (!visible) return null

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="welcome-window">
        <p className="welcome-eyebrow">Trainer Card</p>
        <h1 className="welcome-title">Welcome!</h1>
        <p className="welcome-brand">Subham&apos;s Portfolio</p>
        <p className="welcome-copy">
          Challenge Subham&apos;s Pikachu and uncover his DSA skills, projects, and experience — FireRed style.
        </p>

        <div className="welcome-stars" aria-hidden="true">
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <button type="button" className="welcome-start" onClick={startAdventure}>
          Press Start
        </button>

        <p className="welcome-hint">Tap or click to begin your adventure</p>
      </div>
    </div>
  )
}

export default WelcomeOverlay
