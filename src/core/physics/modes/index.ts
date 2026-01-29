/**
 * Physics Modes - Barrel export
 *
 * Exports all physics mode implementations for the unified physics engine.
 */

export type { IPhysicsMode } from './IPhysicsMode';
export type {
  LightRay,
  TraceResult,
  SensorState,
  SceneGeometry,
  LightSource,
  Position2D,
  Position3D,
  Direction,
  ComponentProcessResult,
} from './IPhysicsMode';

export { ScalarMode } from './ScalarMode';
export { JonesLinearMode } from './JonesLinearMode';
export { JonesFullMode } from './JonesFullMode';
export { CoherencyMode } from './CoherencyMode';
