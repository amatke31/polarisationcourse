/**
 * Shared Physics Core - Barrel Export
 *
 * This module provides a unified physics library for polarized light simulation.
 * Used by both the 2D puzzle game and the Optical Design Studio.
 *
 * NEW UNIFIED PHYSICS ENGINE:
 *   import { UnifiedPhysicsEngine, PhysicsMode } from '@/core/physics'
 *   const engine = UnifiedPhysicsEngine.create(PhysicsMode.JONES_FULL)
 *   const result = engine.trace(sources, sceneGeometry)
 *
 * LEGACY JONES CALCULUS:
 *   import { JonesVector, applyJonesMatrix, polarizerMatrix } from '@/core/physics'
 *   import { splitByBirefringence, checkSensorMatch } from '@/core/physics'
 *   import { SpectralJonesSolver, solveRGB } from '@/core/physics'
 */

// ========== NEW UNIFIED PHYSICS ENGINE ==========

// Core physics engine
export { UnifiedPhysicsEngine, createPhysicsEngine } from './UnifiedPhysicsEngine';

// Physics mode enum and configuration
export {
  PhysicsMode,
  getPhysicsModeDisplayName,
  getPhysicsModeDescription,
  isModeAvailable,
} from './PhysicsMode';
export type {
  PhysicsEngineConfig,
} from './PhysicsEngineConfig';
export {
  getDefaultConfig,
  createConfig,
} from './PhysicsEngineConfig';

// Unified light state
export {
  UnifiedLightState,
} from './UnifiedLightState';
export type {
  DiscretePolarizationAngle,
} from './UnifiedLightState';

// Mode implementations
export type {
  LightRay as UnifiedLightRay,
  TraceResult as UnifiedTraceResult,
  SensorState as UnifiedSensorState,
  SceneGeometry,
  LightSource as UnifiedLightSource,
  Position2D,
  Position3D,
  Direction as UnifiedDirection,
} from './modes';
export type {
  IPhysicsMode,
} from './modes';
export {
  ScalarMode,
  JonesLinearMode,
  JonesFullMode,
  CoherencyMode,
} from './modes';

// Adapters for game integration
export {
  WorldAdapter,
  Game2DAdapter,
  type BeamSegment,
} from './adapters';

// ========== LEGACY JONES CALCULUS (for backward compatibility) ==========

// Export everything from the Jones calculus module
export * from './jones';

// Export spectral Jones solver for chromatic polarization
export * from './SpectralJonesSolver';

// Re-export commonly used types for convenience
export type {
  Complex,
  JonesVector,
  JonesMatrix,
  OpticalElementType,
  GameComponentType,
  PolarizationInfo,
  CrystalAxis,
  SplitBeamResult,
} from './jones';

// Re-export spectral types
export type {
  SpectralJonesParams,
  RGBColor,
  SpectralAnalysis,
} from './SpectralJonesSolver';
