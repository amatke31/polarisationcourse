/**
 * 2D Game Core Module
 * Exports types, levels, and physics for the 2D puzzle game
 *
 * Phase 1 Update: Added advanced levels with Jones Calculus physics
 * Phase 2 Update: Added Master Class Campaign mechanics
 */

export * from './types'
export * from './levels'
export * from './physics'
export * from './advancedLevels'
export * from './mechanics'
export * from './masterClassLevels'

// Physics adapter bridging game to unified physics engine
export * from './physics/GameAdapter'
