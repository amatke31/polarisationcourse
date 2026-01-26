/**
 * Game2D Physics Module
 *
 * Bridges the 2D puzzle game with the unified physics engine.
 * Provides physics-accurate calculations for all optical interactions.
 */

export {
  GamePhysicsAdapter,
  createGameAdapter,
  computeFidelity,
  computeSignalStrength,
  createEmitterState,
  createSensorTarget,
  createPolarizerMatrix,
  createWaveplateMatrix,
  createRotatorMatrix,
  applyComponentEffect,
  getSignalStrengthDisplay,
} from './GameAdapter'

export type {
  SensorEvaluation,
  VictoryResult,
  GamePhysicsConfig,
} from './GameAdapter'
