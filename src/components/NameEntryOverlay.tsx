import { useCallback, useEffect, useState } from 'react'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { getGameInstance } from '@game/Game'
import './NameEntryOverlay.css'

const MAX_NAME_LENGTH = 10
const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

function NameEntryOverlay() {
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const show = () => {
      setVisible(true)
      setName('')
      setError('')
    }

    EventBus.on(GAME_EVENTS.SHOW_NAME_ENTRY, show)
    return () => {
      EventBus.off(GAME_EVENTS.SHOW_NAME_ENTRY, show)
    }
  }, [])

  const unlockAudio = useCallback(() => {
    const game = getGameInstance()
    if (!game) return
    if (game.sound.locked) {
      game.sound.unlock()
    }
  }, [])

  const appendChar = useCallback((char: string) => {
    unlockAudio()
    setName((current) => {
      if (current.length >= MAX_NAME_LENGTH) return current
      setError('')
      return current + char
    })
  }, [unlockAudio])

  const backspace = useCallback(() => {
    unlockAudio()
    setName((current) => current.slice(0, -1))
    setError('')
  }, [unlockAudio])

  const confirm = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name!')
      return
    }

    unlockAudio()
    setVisible(false)
    EventBus.emit(GAME_EVENTS.NAME_CONFIRMED, { playerName: trimmed })
  }, [name, unlockAudio])

  if (!visible) return null

  return (
    <div className="name-entry-overlay" role="dialog" aria-modal="true" aria-label="Enter your name">
      <div className="name-entry-window">
        <div className="name-entry-header">What&apos;s your name?</div>

        <div className="name-entry-display" aria-live="polite">
          {name || <span className="name-entry-placeholder">TAP KEYS BELOW</span>}
          <span className="name-entry-caret">|</span>
        </div>

        {error && <p className="name-entry-error">{error}</p>}

        <div className="name-entry-keyboard">
          {KEYS.map((row, rowIndex) => (
            <div key={rowIndex} className="name-entry-row">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="name-entry-key"
                  onClick={() => appendChar(key)}
                  aria-label={`Letter ${key}`}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}

          <div className="name-entry-row name-entry-row--actions">
            <button type="button" className="name-entry-key name-entry-key--wide" onClick={backspace}>
              DEL
            </button>
            <button type="button" className="name-entry-key name-entry-key--wide" onClick={() => appendChar(' ')}>
              SPACE
            </button>
            <button type="button" className="name-entry-key name-entry-key--ok" onClick={confirm}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NameEntryOverlay
