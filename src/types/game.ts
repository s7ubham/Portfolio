export type StarterId = 'charmander' | 'squirtle' | 'bulbasaur'

export type AttackType = 'dsa' | 'projects' | 'experience'

export interface GameState {
  playerName: string
  starterId: StarterId
}

export interface ProfilePanelPayload {
  attackType: AttackType
}

export const STARTER_NAMES: Record<StarterId, string> = {
  charmander: 'Charmander',
  squirtle: 'Squirtle',
  bulbasaur: 'Bulbasaur',
}

export const ATTACK_LABELS: Record<AttackType, string> = {
  dsa: 'DSA',
  projects: 'Projects',
  experience: 'Experience',
}

export const GAME_WIDTH = 240
export const GAME_HEIGHT = 160
