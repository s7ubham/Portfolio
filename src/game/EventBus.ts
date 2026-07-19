import { Events } from 'phaser'
import type { AttackType } from '@game-types/game'

export const GAME_EVENTS = {
  SHOW_WELCOME: 'show-welcome',
  WELCOME_CONTINUE: 'welcome-continue',
  SHOW_PROFILE_PANEL: 'show-profile-panel',
  PANEL_CLOSED: 'panel-closed',
  SHOW_NAME_ENTRY: 'show-name-entry',
  NAME_CONFIRMED: 'name-confirmed',
  SHOW_END_LINKS: 'show-end-links',
} as const

export interface ShowProfilePanelEvent {
  attackType: AttackType
}

export interface PanelClosedEvent {
  attackType: AttackType
}

export interface NameConfirmedEvent {
  playerName: string
}

export const EventBus = new Events.EventEmitter()
