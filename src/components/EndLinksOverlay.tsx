import { useEffect, useState } from 'react'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { profile } from '@data/profile'
import './EndLinksOverlay.css'

function EndLinksOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = () => setVisible(true)
    EventBus.on(GAME_EVENTS.SHOW_END_LINKS, show)
    return () => {
      EventBus.off(GAME_EVENTS.SHOW_END_LINKS, show)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="end-links-overlay" role="dialog" aria-modal="true" aria-label="Connect with Subham">
      <div className="end-links-window">
        <div className="end-links-header">THE END</div>
        <p className="end-links-title">Thanks for visiting!</p>
        <p className="end-links-subtitle">Continue the adventure on my profiles:</p>

        <div className="end-links-buttons">
          <a
            className="end-link end-link--linkedin"
            href={profile.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="end-link end-link--github"
            href={profile.github.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="end-link end-link--leetcode"
            href={profile.leetcode.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            LeetCode
          </a>
        </div>
      </div>
    </div>
  )
}

export default EndLinksOverlay
