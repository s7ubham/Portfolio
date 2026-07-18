import { Events } from 'phaser'
import type { AttackType } from '@game-types/game'

export const GAME_EVENTS = {
  SHOW_PROFILE_PANEL: 'show-profile-panel',
  PANEL_CLOSED: 'panel-closed',
  PAUSE_BATTLE: 'pause-battle',
  RESUME_BATTLE: 'resume-battle',
} as const

export interface ShowProfilePanelEvent {
  attackType: AttackType
}

export interface PanelClosedEvent {
  attackType: AttackType
}

export const EventBus = new Events.EventEmitter()
