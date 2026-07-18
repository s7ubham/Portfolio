import type { AttackType } from '@game-types/game'

const SEGMENT_DAMAGE = 100 / 3

export class BattleSystem {
  private playerHP = 100
  private readonly usedAttacks = new Set<AttackType>()

  getHP(): number {
    return this.playerHP
  }

  isAttackUsed(type: AttackType): boolean {
    return this.usedAttacks.has(type)
  }

  getAvailableAttacks(): AttackType[] {
    const all: AttackType[] = ['dsa', 'projects', 'experience']
    return all.filter((attack) => !this.usedAttacks.has(attack))
  }

  applyAttack(type: AttackType): number {
    if (this.usedAttacks.has(type)) {
      return this.playerHP
    }

    this.usedAttacks.add(type)

    if (type === 'experience') {
      this.playerHP = 0
    } else {
      this.playerHP = Math.max(0, this.playerHP - SEGMENT_DAMAGE)
    }

    return this.playerHP
  }

  isDefeated(): boolean {
    return this.playerHP <= 0
  }

  reset(): void {
    this.playerHP = 100
    this.usedAttacks.clear()
  }
}
