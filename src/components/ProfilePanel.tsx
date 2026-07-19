import { useCallback, useEffect, useRef, useState } from 'react'
import { EventBus, GAME_EVENTS } from '@game/EventBus'
import { getGameInstance } from '@game/Game'
import { profile } from '@data/profile'
import { ATTACK_LABELS, type AttackType } from '@game-types/game'
import './ProfilePanel.css'

function setPhaserInputEnabled(enabled: boolean): void {
  const game = getGameInstance()
  if (!game) return
  game.input.enabled = enabled
  game.canvas.style.pointerEvents = enabled ? 'auto' : 'none'
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])

  return value
}

function LeetCodeMock({ active }: { active: boolean }) {
  const solved = useCountUp(profile.leetcode.solved, active)
  const easy = useCountUp(profile.leetcode.easy, active, 1000)
  const medium = useCountUp(profile.leetcode.medium, active, 1100)
  const hard = useCountUp(profile.leetcode.hard, active, 1200)

  return (
    <div className="site-mock site-mock--leetcode">
      <header className="lc-topbar">
        <span className="lc-logo">LeetCode</span>
        <nav>
          <span>Explore</span>
          <span>Problems</span>
          <span className="active">Profile</span>
        </nav>
      </header>
      <div className="lc-body">
        <aside className="lc-profile-card">
          <div className="lc-avatar">S</div>
          <h2>{profile.leetcode.username}</h2>
          <p className="lc-rank">{profile.leetcode.ranking}</p>
          <div className="lc-ring">
            <strong>{solved}</strong>
            <span>Solved</span>
          </div>
        </aside>
        <section className="lc-main">
          <h3>Solved Problems</h3>
          <div className="lc-bars">
            <div className="lc-bar">
              <span>Easy</span>
              <div className="track">
                <div className="fill fill--easy" style={{ width: `${(easy / Math.max(profile.leetcode.solved, 1)) * 100}%` }} />
              </div>
              <em>{easy}</em>
            </div>
            <div className="lc-bar">
              <span>Medium</span>
              <div className="track">
                <div className="fill fill--medium" style={{ width: `${(medium / Math.max(profile.leetcode.solved, 1)) * 100}%` }} />
              </div>
              <em>{medium}</em>
            </div>
            <div className="lc-bar">
              <span>Hard</span>
              <div className="track">
                <div className="fill fill--hard" style={{ width: `${(hard / Math.max(profile.leetcode.solved, 1)) * 100}%` }} />
              </div>
              <em>{hard}</em>
            </div>
          </div>
          <div className="lc-meta">
            <div>
              <label>Acceptance</label>
              <p>{profile.leetcode.acceptance}</p>
            </div>
            <div>
              <label>Streak</label>
              <p>{profile.leetcode.streak} days</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function GitHubMock({ active }: { active: boolean }) {
  const repos = useCountUp(profile.github.repos, active)

  return (
    <div className="site-mock site-mock--github">
      <header className="gh-topbar">
        <span className="gh-logo">◉</span>
        <input readOnly value="Search or jump to..." />
        <nav>
          <span>Pull requests</span>
          <span>Issues</span>
          <span className="active">Profile</span>
        </nav>
      </header>
      <div className="gh-body">
        <aside className="gh-sidebar">
          <div className="gh-avatar">S</div>
          <h2>{profile.github.name}</h2>
          <p className="gh-user">@{profile.github.username}</p>
          <p className="gh-bio">{profile.github.bio}</p>
          <div className="gh-counts">
            <span>
              <strong>{repos}</strong> repositories
            </span>
            <span>
              <strong>{profile.github.followers}</strong> followers
            </span>
          </div>
        </aside>
        <section className="gh-main">
          <h3>Popular repositories</h3>
          <div className="gh-repos">
            {profile.github.highlights.map((repo, index) => (
              <article
                key={repo.name}
                className="gh-repo"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <h4>{repo.name}</h4>
                <p>{repo.desc}</p>
                <span className="gh-lang">{repo.lang}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function LinkedInMock({ active }: { active: boolean }) {
  useCountUp(1, active, 400)

  return (
    <div className="site-mock site-mock--linkedin">
      <header className="li-topbar">
        <span className="li-logo">in</span>
        <input readOnly value="Search" />
        <nav>
          <span>Home</span>
          <span>My Network</span>
          <span className="active">Me</span>
        </nav>
      </header>
      <div className="li-cover" />
      <div className="li-body">
        <div className="li-card">
          <div className="li-avatar">S</div>
          <h2>{profile.linkedin.name}</h2>
          <p className="li-headline">{profile.linkedin.headline}</p>
          <p className="li-meta">
            {profile.linkedin.company} · {profile.linkedin.location}
          </p>
        </div>
        <section className="li-section">
          <h3>About</h3>
          <p>{profile.linkedin.about}</p>
        </section>
        <section className="li-section">
          <h3>Experience</h3>
          {profile.linkedin.experience.map((job) => (
            <div key={job.role + job.company} className="li-job">
              <strong>{job.role}</strong>
              <span>{job.company}</span>
              <em>{job.period}</em>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

function HighlightPanel({ attackType, active }: { attackType: AttackType; active: boolean }) {
  const solved = useCountUp(profile.leetcode.solved, active && attackType === 'dsa')
  const repos = useCountUp(profile.github.repos, active && attackType === 'projects')

  return (
    <aside className={`highlight-panel highlight-panel--${attackType} ${active ? 'is-active' : ''}`}>
      <p className="highlight-kicker">Now viewing</p>
      <h3>
        {attackType === 'dsa' && 'DSA Stats'}
        {attackType === 'projects' && 'Projects'}
        {attackType === 'experience' && 'Experience'}
      </h3>

      {attackType === 'dsa' && (
        <ul className="highlight-list">
          <li>
            <span>Problems solved</span>
            <strong className="pulse">{solved}</strong>
          </li>
          <li>
            <span>Easy / Med / Hard</span>
            <strong>
              {profile.leetcode.easy} / {profile.leetcode.medium} / {profile.leetcode.hard}
            </strong>
          </li>
          <li>
            <span>Ranking</span>
            <strong>{profile.leetcode.ranking}</strong>
          </li>
          <li>
            <span>Acceptance</span>
            <strong>{profile.leetcode.acceptance}</strong>
          </li>
        </ul>
      )}

      {attackType === 'projects' && (
        <ul className="highlight-list">
          <li>
            <span>Public repos</span>
            <strong className="pulse">{repos}</strong>
          </li>
          {profile.github.highlights.slice(0, 3).map((repo) => (
            <li key={repo.name} className="highlight-chip">
              <span>{repo.lang}</span>
              <strong>{repo.name}</strong>
            </li>
          ))}
        </ul>
      )}

      {attackType === 'experience' && (
        <ul className="highlight-list">
          <li>
            <span>Role</span>
            <strong className="pulse">{profile.linkedin.headline}</strong>
          </li>
          <li>
            <span>Focus</span>
            <strong>{profile.linkedin.company}</strong>
          </li>
          <li>
            <span>Location</span>
            <strong>{profile.linkedin.location}</strong>
          </li>
        </ul>
      )}

      <a
        className="highlight-open"
        href={
          attackType === 'dsa'
            ? profile.leetcode.url
            : attackType === 'projects'
              ? profile.github.url
              : profile.linkedin.url
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        Open real profile ↗
      </a>
    </aside>
  )
}

function ProfilePanel() {
  const [visible, setVisible] = useState(false)
  const [attackType, setAttackType] = useState<AttackType | null>(null)
  const attackTypeRef = useRef<AttackType | null>(null)
  const closingRef = useRef(false)
  const continueRef = useRef<HTMLButtonElement>(null)

  const closePanel = useCallback(() => {
    if (closingRef.current) return

    const type = attackTypeRef.current
    if (!type) return

    closingRef.current = true
    setVisible(false)
    setAttackType(null)
    attackTypeRef.current = null

    // Notify Phaser after React hides the overlay; re-enable input after the click settles
    window.setTimeout(() => {
      EventBus.emit(GAME_EVENTS.PANEL_CLOSED, { attackType: type })
    }, 0)
    window.setTimeout(() => {
      setPhaserInputEnabled(true)
    }, 250)
  }, [])

  useEffect(() => {
    const showPanel = (payload: { attackType: AttackType }) => {
      closingRef.current = false
      attackTypeRef.current = payload.attackType
      setAttackType(payload.attackType)
      setVisible(true)
      setPhaserInputEnabled(false)
    }

    EventBus.on(GAME_EVENTS.SHOW_PROFILE_PANEL, showPanel)
    return () => {
      EventBus.off(GAME_EVENTS.SHOW_PROFILE_PANEL, showPanel)
    }
  }, [])

  // Capture-phase listener so Continue wins over Phaser's window input
  useEffect(() => {
    if (!visible) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-continue-battle="true"]')) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        closePanel()
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    const focusTimer = window.setTimeout(() => continueRef.current?.focus(), 50)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.clearTimeout(focusTimer)
    }
  }, [visible, closePanel])

  if (!visible || !attackType) return null

  return (
    <div
      className="profile-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${ATTACK_LABELS[attackType]} profile panel`}
    >
      <div className="profile-window profile-window--split">
        <div className="profile-window-header">
          <span>
            {ATTACK_LABELS[attackType]} —{' '}
            {attackType === 'dsa' ? 'LeetCode' : attackType === 'projects' ? 'GitHub' : 'LinkedIn'}
          </span>
        </div>

        <div className="profile-split-body">
          <div className="profile-main-pane">
            {attackType === 'dsa' && <LeetCodeMock active={visible} />}
            {attackType === 'projects' && <GitHubMock active={visible} />}
            {attackType === 'experience' && <LinkedInMock active={visible} />}
          </div>
          <HighlightPanel attackType={attackType} active={visible} />
        </div>

        <button
          ref={continueRef}
          type="button"
          className="profile-continue"
          data-continue-battle="true"
          aria-label="Continue battle"
        >
          Continue battle
        </button>
      </div>
    </div>
  )
}

export default ProfilePanel
