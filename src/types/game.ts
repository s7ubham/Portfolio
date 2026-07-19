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

/** Logical FireRed size ×2 for sharp text/sprites on large screens */
export const GAME_SCALE = 2
export const GAME_WIDTH = 240 * GAME_SCALE
export const GAME_HEIGHT = 160 * GAME_SCALE

/** Scale a FireRed-native coordinate to current resolution */
export function s(n: number): number {
  return n * GAME_SCALE
}
