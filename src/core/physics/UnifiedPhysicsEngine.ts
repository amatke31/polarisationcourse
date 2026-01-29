/**
 * UnifiedPhysicsEngine - Main physics engine with mode switching
 *
 * This engine provides a single entry point for all physics calculations,
 * delegating to mode-specific implementations (Scalar, Jones, Coherency).
 *
 * Architecture:
 * - UnifiedPhysicsEngine: Main orchestrator
 * - Mode implementations: Plug-in physics calculators
 * - Adapters: Convert between game formats and unified format
 */
import { PhysicsMode } from './PhysicsMode';
import type { PhysicsEngineConfig } from './PhysicsEngineConfig';
import { getDefaultConfig } from './PhysicsEngineConfig';
import { UnifiedLightState } from './UnifiedLightState';
import type {
  IPhysicsMode,
  LightSource,
  SceneGeometry,
  TraceResult,
  Position2D,
  Position3D,
} from './modes/IPhysicsMode';

// Mode implementations
import { ScalarMode } from './modes/ScalarMode';
import { JonesLinearMode } from './modes/JonesLinearMode';
import { JonesFullMode } from './modes/JonesFullMode';
import { CoherencyMode } from './modes/CoherencyMode';

/**
 * Main unified physics engine
 */
export class UnifiedPhysicsEngine {
  private config: PhysicsEngineConfig;
  private modeImpl: IPhysicsMode;

  constructor(config: PhysicsEngineConfig) {
    this.config = config;

    // Instantiate the appropriate mode
    switch (config.mode) {
      case PhysicsMode.LEGACY_SCALAR:
        this.modeImpl = new ScalarMode();
        break;
      case PhysicsMode.JONES_LINEAR:
        this.modeImpl = new JonesLinearMode();
        break;
      case PhysicsMode.JONES_FULL:
        this.modeImpl = new JonesFullMode();
        break;
      case PhysicsMode.COHERENCY:
        this.modeImpl = new CoherencyMode();
        break;
      case PhysicsMode.SPECTRAL:
        // Spectral mode uses CoherencyMode internally
        this.modeImpl = new CoherencyMode();
        break;
      default:
        throw new Error(`Unknown physics mode: ${config.mode}`);
    }

    if (config.debug) {
      console.log(`[UnifiedPhysicsEngine] Initialized with mode: ${config.mode}`);
    }
  }

  /**
   * Process light through a single optical component
   *
   * @param light - Input light state
   * @param component - Optical component to process
   * @returns Array of output light states (may be multiple for splitters)
   */
  processLight(
    light: UnifiedLightState,
    component: unknown
  ): UnifiedLightState[] {
    return this.modeImpl.processLight(light, component as any);
  }

  /**
   * Trace light through an entire scene
   *
   * @param sources - Array of light sources
   * @param scene - Scene geometry with components
   * @returns Complete trace result with rays and sensor states
   */
  trace(sources: LightSource[], scene: SceneGeometry): TraceResult {
    const startTime = performance.now();

    const result = this.modeImpl.trace(sources, scene, this.config);

    if (this.config.debug) {
      const duration = performance.now() - startTime;
      console.log(`[UnifiedPhysicsEngine] Trace completed in ${duration.toFixed(2)}ms`);
      console.log(`  - Rays traced: ${result.rayCount}`);
      console.log(`  - Total intensity: ${result.totalIntensity.toFixed(2)}`);
      console.log(`  - Sensors activated: ${result.sensorStates.filter(s => s.activated).length}/${result.sensorStates.length}`);
    }

    return result;
  }

  /**
   * Get light intensity at a specific position
   *
   * @param position - Position to check (2D or 3D)
   * @param scene - Scene geometry
   * @returns Light intensity at position (0-1)
   */
  getIntensityAt(
    position: Position2D | Position3D,
    scene: SceneGeometry
  ): number {
    return this.modeImpl.getIntensityAt(position, scene);
  }

  /**
   * Check if sensor activation requirements are met
   *
   * @param sensorState - Sensor state to check
   * @returns True if sensor is activated
   */
  isSensorActivated(sensorState: unknown): boolean {
    return this.modeImpl.isSensorActivated(sensorState as any);
  }

  /**
   * Validate scene configuration
   *
   * @param scene - Scene geometry to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateScene(scene: SceneGeometry): string[] {
    return this.modeImpl.validateScene(scene);
  }

  /**
   * Reset internal state
   */
  reset(): void {
    this.modeImpl.reset();
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<PhysicsEngineConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration (creates new mode instance if mode changes)
   */
  updateConfig(updates: Partial<PhysicsEngineConfig>): void {
    const newConfig = { ...this.config, ...updates };

    // If mode changed, recreate mode implementation
    if (updates.mode && updates.mode !== this.config.mode) {
      this.config = newConfig;
      // Re-instantiate with new mode
      switch (newConfig.mode) {
        case PhysicsMode.LEGACY_SCALAR:
          this.modeImpl = new ScalarMode();
          break;
        case PhysicsMode.JONES_LINEAR:
          this.modeImpl = new JonesLinearMode();
          break;
        case PhysicsMode.JONES_FULL:
          this.modeImpl = new JonesFullMode();
          break;
        case PhysicsMode.COHERENCY:
        case PhysicsMode.SPECTRAL:
          this.modeImpl = new CoherencyMode();
          break;
      }
    } else {
      this.config = newConfig;
    }
  }

  /**
   * Get current mode
   */
  getMode(): PhysicsMode {
    return this.config.mode;
  }

  /**
   * Check if mode supports a feature
   */
  supportsFeature(feature: 'circular' | 'elliptical' | 'partial' | 'spectral'): boolean {
    switch (feature) {
      case 'circular':
      case 'elliptical':
        return this.config.mode === PhysicsMode.JONES_FULL ||
               this.config.mode === PhysicsMode.COHERENCY ||
               this.config.mode === PhysicsMode.SPECTRAL;
      case 'partial':
        return this.config.mode === PhysicsMode.COHERENCY ||
               this.config.mode === PhysicsMode.SPECTRAL;
      case 'spectral':
        return this.config.mode === PhysicsMode.SPECTRAL;
      default:
        return false;
    }
  }

  /**
   * Get engine info for debugging
   */
  getEngineInfo(): {
    mode: PhysicsMode;
    config: PhysicsEngineConfig;
    features: string[];
  } {
    const features: string[] = [];
    if (this.supportsFeature('circular')) features.push('circular-polarization');
    if (this.supportsFeature('elliptical')) features.push('elliptical-polarization');
    if (this.supportsFeature('partial')) features.push('partial-polarization');
    if (this.supportsFeature('spectral')) features.push('spectral-analysis');
    features.push(this.config.interference === 'continuous' ? 'continuous-interference' : 'binary-interference');
    features.push(this.config.polarizationPrecision === 'continuous' ? 'continuous-polarization' : 'discrete-polarization');

    return {
      mode: this.config.mode,
      config: this.config,
      features,
    };
  }

  /**
   * Create a default engine for the specified mode
   */
  static create(mode: PhysicsMode, overrides: Partial<PhysicsEngineConfig> = {}): UnifiedPhysicsEngine {
    const config = { ...getDefaultConfig(mode), ...overrides, mode };
    return new UnifiedPhysicsEngine(config);
  }

  /**
   * Create legacy scalar mode engine (for backward compatibility)
   */
  static createScalar(): UnifiedPhysicsEngine {
    return UnifiedPhysicsEngine.create(PhysicsMode.LEGACY_SCALAR);
  }

  /**
   * Create Jones linear mode engine
   */
  static createJonesLinear(): UnifiedPhysicsEngine {
    return UnifiedPhysicsEngine.create(PhysicsMode.JONES_LINEAR);
  }

  /**
   * Create Jones full mode engine (with circular/elliptical support)
   */
  static createJonesFull(): UnifiedPhysicsEngine {
    return UnifiedPhysicsEngine.create(PhysicsMode.JONES_FULL);
  }

  /**
   * Create Coherency mode engine (with partial polarization support)
   */
  static createCoherency(): UnifiedPhysicsEngine {
    return UnifiedPhysicsEngine.create(PhysicsMode.COHERENCY);
  }
}

/**
 * Export factory functions for convenience
 */
export function createPhysicsEngine(
  mode: PhysicsMode,
  overrides?: Partial<PhysicsEngineConfig>
): UnifiedPhysicsEngine {
  return UnifiedPhysicsEngine.create(mode, overrides);
}
