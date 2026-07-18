import { useCallback, useEffect, useRef, useState } from 'react'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { profile } from '@data/profile'
import { ATTACK_LABELS, type AttackType } from '@game-types/game'
import {
  IFRAME_MAX_WAIT_MS,
  IFRAME_PROBE_MS,
  isIframeEmbedBlocked,
  isKnownBlockedEmbed,
} from '@/utils/iframeEmbed'
import './ProfilePanel.css'

type PanelMode = 'loading' | 'iframe' | 'fallback'

function getProfileUrl(attackType: AttackType): string {
  switch (attackType) {
    case 'dsa':
      return profile.leetcode.url
    case 'projects':
      return profile.github.url
    case 'experience':
      return profile.linkedin.url
  }
}

function ProfileFallback({ attackType, url }: { attackType: AttackType; url: string }) {
  return (
    <div className="profile-fallback">
      {attackType === 'dsa' && (
        <>
          <div className="profile-badge profile-badge--leetcode">LC</div>
          <h3>LeetCode Profile</h3>
          <p className="stat-big">{profile.leetcode.solved} problems solved</p>
          <div className="stat-grid">
            <div className="stat-card stat-card--easy">
              <span className="stat-label">Easy</span>
              <span className="stat-value">{profile.leetcode.easy}</span>
            </div>
            <div className="stat-card stat-card--medium">
              <span className="stat-label">Medium</span>
              <span className="stat-value">{profile.leetcode.medium}</span>
            </div>
            <div className="stat-card stat-card--hard">
              <span className="stat-label">Hard</span>
              <span className="stat-value">{profile.leetcode.hard}</span>
            </div>
          </div>
          <p className="profile-note">@{profile.leetcode.username}</p>
        </>
      )}
      {attackType === 'projects' && (
        <>
          <div className="profile-badge profile-badge--github">GH</div>
          <h3>GitHub Projects</h3>
          <p className="stat-big">{profile.github.repos} public repositories</p>
          <p className="profile-note">{profile.github.bio || profile.github.username}</p>
          <ul className="profile-highlights">
            {profile.github.highlights.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
        </>
      )}
      {attackType === 'experience' && (
        <>
          <div className="profile-badge profile-badge--linkedin">in</div>
          <h3>LinkedIn Experience</h3>
          <p className="stat-big">{profile.linkedin.headline}</p>
          <p className="profile-note">{profile.linkedin.company}</p>
          <p className="profile-detail">{profile.linkedin.location}</p>
        </>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="profile-link">
        Open full profile ↗
      </a>
    </div>
  )
}

function ProfilePanel() {
  const [visible, setVisible] = useState(false)
  const [attackType, setAttackType] = useState<AttackType | null>(null)
  const [mode, setMode] = useState<PanelMode>('loading')
  const [statusMessage, setStatusMessage] = useState('Connecting...')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const probeTimeoutRef = useRef<number>()
  const hardTimeoutRef = useRef<number>()

  const clearTimers = useCallback(() => {
    if (probeTimeoutRef.current) window.clearTimeout(probeTimeoutRef.current)
    if (hardTimeoutRef.current) window.clearTimeout(hardTimeoutRef.current)
    probeTimeoutRef.current = undefined
    hardTimeoutRef.current = undefined
  }, [])

  const showFallback = useCallback((reason: string) => {
    clearTimers()
    setMode('fallback')
    setStatusMessage(reason)
  }, [clearTimers])

  const closePanel = useCallback(() => {
    clearTimers()
    setVisible(false)
    setAttackType((current) => {
      if (current) {
        EventBus.emit(GAME_EVENTS.PANEL_CLOSED, { attackType: current })
      }
      return null
    })
    setMode('loading')
    setStatusMessage('Connecting...')
  }, [clearTimers])

  const probeIframe = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) {
      showFallback('Could not load embedded profile.')
      return
    }

    if (isIframeEmbedBlocked(iframe)) {
      showFallback('This site blocks embedded views. Showing profile summary.')
    }
  }, [showFallback])

  const handleIframeLoad = useCallback(() => {
    probeTimeoutRef.current = window.setTimeout(probeIframe, IFRAME_PROBE_MS)
  }, [probeIframe])

  useEffect(() => {
    const showPanel = (payload: { attackType: AttackType }) => {
      clearTimers()
      const url = getProfileUrl(payload.attackType)
      setAttackType(payload.attackType)
      setVisible(true)

      if (isKnownBlockedEmbed(url)) {
        setMode('fallback')
        setStatusMessage('Embedded view unavailable for this site.')
        return
      }

      setMode('loading')
      setStatusMessage('Loading profile...')

      hardTimeoutRef.current = window.setTimeout(() => {
        showFallback('Loading timed out. Showing profile summary.')
      }, IFRAME_MAX_WAIT_MS)
    }

    EventBus.on(GAME_EVENTS.SHOW_PROFILE_PANEL, showPanel)
    return () => {
      EventBus.off(GAME_EVENTS.SHOW_PROFILE_PANEL, showPanel)
      clearTimers()
    }
  }, [clearTimers, showFallback])

  if (!visible || !attackType) return null

  const url = getProfileUrl(attackType)

  return (
    <div
      className="profile-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${ATTACK_LABELS[attackType]} profile panel`}
    >
      <div className="profile-window">
        <div className="profile-window-header">
          <span>{ATTACK_LABELS[attackType]} — Subham&apos;s Profile</span>
        </div>

        <div className="profile-window-body">
          {mode === 'fallback' ? (
            <ProfileFallback attackType={attackType} url={url} />
          ) : (
            <>
              {(mode === 'loading' || mode === 'iframe') && (
                <div className={`profile-loading ${mode === 'iframe' ? 'profile-loading--overlay' : ''}`}>
                  <div className="profile-loading-spinner" />
                  <p>{statusMessage}</p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={url}
                title={`${ATTACK_LABELS[attackType]} profile`}
                className={`profile-iframe ${mode === 'loading' ? 'profile-iframe--hidden' : ''}`}
                onLoad={() => {
                  setMode('iframe')
                  handleIframeLoad()
                }}
                onError={() => showFallback('Could not load embedded profile.')}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </>
          )}
        </div>

        <button type="button" className="profile-continue" onClick={closePanel} aria-label="Continue battle">
          Continue
        </button>
      </div>
    </div>
  )
}

export default ProfilePanel
