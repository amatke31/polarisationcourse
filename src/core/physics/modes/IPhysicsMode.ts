/**
 * IPhysicsMode Interface
 * Contract for all physics mode implementations
 *
 * Each physics mode (Scalar, Jones, Coherency) must implement this interface
 * to ensure compatibility with the UnifiedPhysicsEngine.
 */
import type { UnifiedLightState } from '../UnifiedLightState';
import type { OpticalComponent as SharedOpticalComponent } from '@/components/shared/optical/types';

// Re-export OpticalComponent for convenience
export type OpticalComponent = SharedOpticalComponent;

/**
 * Direction enum for light propagation
 */
export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

/**
 * 3D position in the world
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D position for the 2D game
 */
export interface Position2D {
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
}

/**
 * Light ray in the system
 */
export interface LightRay {
  /** Unique identifier for this ray */
  id: string;

  /** Current position (2D or 3D) */
  position: Position2D | Position3D;

  /** Direction of propagation */
  direction: Direction;

  /** Light state (intensity, polarization, etc.) */
  state: UnifiedLightState;

  /** Path history (for rendering beams) */
  path: Array<Position2D | Position3D>;

  /** Number of iterations (for termination) */
  iterations: number;

  /** Parent ray ID (for split beams) */
  parentRayId?: string;
}

/**
 * Trace result from ray tracing
 */
export interface TraceResult {
  /** All light rays traced */
  rays: LightRay[];

  /** Sensor activation states */
  sensorStates: SensorState[];

  /** Total light intensity in system */
  totalIntensity: number;

  /** Number of rays created */
  rayCount: number;

  /** Maximum iterations reached */
  maxIterationsReached: boolean;
}

/**
 * Sensor activation state
 */
export interface SensorState {
  /** Sensor component ID */
  id: string;

  /** Whether sensor is activated (meets requirements) */
  activated: boolean;

  /** Received light intensity (0-100 for continuous, 0-15 for discrete) */
  receivedIntensity: number;

  /** Received polarization angle (null if unpolarized) */
  receivedPolarization: number | null;

  /** Required intensity for activation */
  requiredIntensity: number;

  /** Required polarization for activation (null = any) */
  requiredPolarization: number | null;

  /** Match quality (0-1, how well requirements are met) */
  matchQuality: number;
}

/**
 * Scene geometry for ray intersection
 */
export interface SceneGeometry {
  /** Type of scene (2D or 3D) */
  type: '2d' | '3d';

  /** Scene bounds */
  bounds: {
    min: Position2D | Position3D;
    max: Position2D | Position3D;
  };

  /** All optical components in the scene */
  components: OpticalComponent[];

  /** Get component at position */
  getComponentAt: (position: Position2D | Position3D) => OpticalComponent | null;

  /** Check if position is valid (within bounds) */
  isValidPosition: (position: Position2D | Position3D) => boolean;

  /** Get next position in direction */
  getNextPosition: (position: Position2D | Position3D, direction: Direction) => Position2D | Position3D;
}

/**
 * Light source definition
 */
export interface LightSource {
  /** Source ID */
  id: string;

  /** Position */
  position: Position2D | Position3D;

  /** Direction of emitted light */
  direction: Direction;

  /** Initial light state */
  state: UnifiedLightState;

  /** Emission type (continuous or pulse) */
  type: 'continuous' | 'pulse';
}

/**
 * Physics mode interface
 * All physics modes must implement this interface
 */
export interface IPhysicsMode {
  /** Mode name/identifier */
  readonly name: string;

  /**
   * Process light through a single optical component
   *
   * @param light - Input light state
   * @param component - Optical component to process through
   * @returns Array of output light states (may be multiple for splitters)
   */
  processLight(
    light: UnifiedLightState,
    component: OpticalComponent
  ): UnifiedLightState[];

  /**
   * Trace light through the entire scene
   *
   * @param sources - Array of light sources
   * @param scene - Scene geometry with components
   * @param config - Physics configuration
   * @returns Complete trace result with all rays and sensor states
   */
  trace(
    sources: LightSource[],
    scene: SceneGeometry,
    config?: unknown
  ): TraceResult;

  /**
   * Calculate light intensity at a specific point
   *
   * @param position - Position to check
   * @param scene - Scene geometry
   * @returns Light intensity at position (0-1)
   */
  getIntensityAt(
    position: Position2D | Position3D,
    scene: SceneGeometry
  ): number;

  /**
   * Check if sensor requirements are met
   *
   * @param sensorState - Sensor activation state to check
   * @returns True if sensor is activated
   */
  isSensorActivated(sensorState: SensorState): boolean;

  /**
   * Validate scene configuration
   *
   * @param scene - Scene geometry to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateScene(scene: SceneGeometry): string[];

  /**
   * Reset any internal state
   */
  reset(): void;
}

/**
 * Result from processing a single component
 */
export interface ComponentProcessResult {
  /** Output light states */
  outputStates: UnifiedLightState[];

  /** Did the component absorb all light? */
  absorbed: boolean;

  /** Did the component reflect light? */
  reflected: boolean;

  /** Did the component split light? */
  split: boolean;

  /** Additional output direction (for splitters/mirrors) */
  additionalDirection?: Direction;
}
