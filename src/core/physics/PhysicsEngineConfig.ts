/**
 * PhysicsEngineConfig Interface
 * Configuration options for the unified physics engine
 */
import { PhysicsMode } from './PhysicsMode';

export interface PhysicsEngineConfig {
  /** Physics computation mode */
  mode: PhysicsMode;

  /** Intensity representation: discrete (0-15) or continuous (0-100) */
  intensityScale: 'discrete' | 'continuous';

  /** Polarization precision: discrete (4 angles) or continuous (0-180) */
  polarizationPrecision: 'discrete' | 'continuous';

  /** Interference model: binary (constructive/destructive) or continuous */
  interference: 'binary' | 'continuous';

  /** Enable spectral calculations (wavelength-dependent) */
  spectral: boolean;

  /** Enable partial polarization support (coherency matrix mode) */
  partialPolarization: boolean;

  /** Maximum ray tracing iterations (prevents infinite loops) */
  maxIterations: number;

  /** Minimum intensity threshold (rays below this are terminated) */
  energyThreshold: number;

  /** Enable debug output */
  debug: boolean;
}

/**
 * Default configuration for each physics mode
 */
export function getDefaultConfig(mode: PhysicsMode): PhysicsEngineConfig {
  const baseConfig: Omit<PhysicsEngineConfig, 'mode'> = {
    intensityScale: 'continuous',
    polarizationPrecision: 'continuous',
    interference: 'continuous',
    spectral: false,
    partialPolarization: false,
    maxIterations: 100,
    energyThreshold: 0.01,
    debug: false,
  };

  switch (mode) {
    case PhysicsMode.LEGACY_SCALAR:
      return {
        mode,
        intensityScale: 'discrete',
        polarizationPrecision: 'discrete',
        interference: 'binary',
        spectral: false,
        partialPolarization: false,
        maxIterations: 50,
        energyThreshold: 1, // Intensity below 1 (out of 15) is terminated
        debug: false,
      };

    case PhysicsMode.JONES_LINEAR:
      return {
        mode,
        intensityScale: 'continuous',
        polarizationPrecision: 'continuous',
        interference: 'continuous',
        spectral: false,
        partialPolarization: false,
        maxIterations: 100,
        energyThreshold: 0.01,
        debug: false,
      };

    case PhysicsMode.JONES_FULL:
      return {
        mode,
        intensityScale: 'continuous',
        polarizationPrecision: 'continuous',
        interference: 'continuous',
        spectral: false,
        partialPolarization: false,
        maxIterations: 100,
        energyThreshold: 0.01,
        debug: false,
      };

    case PhysicsMode.COHERENCY:
      return {
        mode,
        intensityScale: 'continuous',
        polarizationPrecision: 'continuous',
        interference: 'continuous',
        spectral: false,
        partialPolarization: true,
        maxIterations: 100,
        energyThreshold: 0.01,
        debug: false,
      };

    case PhysicsMode.SPECTRAL:
      return {
        mode,
        intensityScale: 'continuous',
        polarizationPrecision: 'continuous',
        interference: 'continuous',
        spectral: true,
        partialPolarization: true,
        maxIterations: 100,
        energyThreshold: 0.01,
        debug: false,
      };

    default:
      return { mode, ...baseConfig };
  }
}

/**
 * Create a custom configuration by overriding defaults
 */
export function createConfig(
  mode: PhysicsMode,
  overrides: Partial<PhysicsEngineConfig> = {}
): PhysicsEngineConfig {
  return {
    ...getDefaultConfig(mode),
    ...overrides,
    mode, // Ensure mode is always set correctly
  };
}
