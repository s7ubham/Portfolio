import type { GameState, StarterId } from '@game-types/game'

const defaultState: GameState = {
  playerName: '',
  starterId: 'charmander',
}

let state: GameState = { ...defaultState }

export const GameRegistry = {
  get(): GameState {
    return state
  },

  set(partial: Partial<GameState>): void {
    state = { ...state, ...partial }
  },

  reset(): void {
    state = { ...defaultState }
  },

  getStarterId(): StarterId {
    return state.starterId
  },

  getPlayerName(): string {
    return state.playerName
  },
}
