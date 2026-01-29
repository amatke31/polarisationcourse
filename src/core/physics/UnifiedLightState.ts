/**
 * UnifiedLightState Class
 * Universal light state wrapper that can convert between different representations:
 * - LightPacket (legacy scalar)
 * - JonesVector (Jones calculus)
 * - StokesVector (Stokes parameters)
 * - CoherencyMatrix (partial polarization)
 *
 * Internally uses CoherencyMatrix for maximum flexibility.
 */
import { CoherencyMatrix } from './unified/CoherencyMatrix';
import { Complex } from '../math/Complex';
import type { LightPacket } from '../types';

/**
 * Discrete polarization angles used in legacy scalar mode
 */
export type DiscretePolarizationAngle = 0 | 45 | 90 | 135;

/**
 * Jones vector representation
 */
export interface JonesVector {
  Ex: number;
  Ey: number;
  phaseX: number;
  phaseY: number;
}

/**
 * Universal light state representation
 */
export class UnifiedLightState {
  private coherency: CoherencyMatrix;

  constructor(coherency: CoherencyMatrix) {
    this.coherency = coherency;
  }

  /**
   * Get intensity (0-1 continuous)
   */
  get intensity(): number {
    return this.coherency.intensity;
  }

  /**
   * Get degree of polarization (0-1, where 0 = unpolarized, 1 = fully polarized)
   */
  get degreeOfPolarization(): number {
    return this.coherency.degreeOfPolarization;
  }

  /**
   * Get orientation angle in degrees (0-180)
   */
  get orientationAngle(): number {
    return (this.coherency.orientationAngle * 180) / Math.PI;
  }

  /**
   * Get ellipticity angle in degrees (-45 to 45)
   */
  get ellipticityAngle(): number {
    return (this.coherency.ellipticityAngle * 180) / Math.PI;
  }

  /**
   * Get the underlying coherency matrix
   */
  getCoherencyMatrix(): CoherencyMatrix {
    return this.coherency;
  }

  /**
   * Check if light is linearly polarized
   */
  isLinearlyPolarized(): boolean {
    return this.coherency.isLinear();
  }

  /**
   * Check if light is circularly polarized
   */
  isCircularlyPolarized(): boolean {
    return this.coherency.isCircular();
  }

  /**
   * Check if light is unpolarized
   */
  isUnpolarized(): boolean {
    return this.coherency.isUnpolarized();
  }

  /**
   * Convert to legacy scalar LightPacket format
   * Returns: { intensity: 0-15, polarization: 0|45|90|135, phase: 1|-1 }
   */
  toLightPacket(): LightPacket {
    const discreteIntensity = Math.round(this.intensity * 15);
    const angle = this.orientationAngle;

    // Snap to nearest discrete angle
    let discreteAngle: DiscretePolarizationAngle;
    if (angle < 22.5 || angle >= 157.5) {
      discreteAngle = 0;
    } else if (angle < 67.5) {
      discreteAngle = 45;
    } else if (angle < 112.5) {
      discreteAngle = 90;
    } else {
      discreteAngle = 135;
    }

    // Phase is binary in legacy mode (1 for 0°, -1 for 90°)
    const phase = discreteAngle === 0 || discreteAngle === 45 ? 1 : -1;

    const clampedIntensity = Math.max(0, Math.min(15, discreteIntensity));

    return {
      direction: 'east', // Direction is context-dependent, set by caller
      intensity: clampedIntensity as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
      polarization: discreteAngle,
      phase: phase as 1 | -1,
    };
  }

  /**
   * Convert to Jones vector format
   */
  toJonesVector(): JonesVector {
    const stokes = this.coherency.toStokes();
    const s0 = stokes[0];
    const dop = this.coherency.degreeOfPolarization;

    if (dop < 0.01) {
      // Unpolarized light - return equal components
      return {
        Ex: Math.sqrt(s0 / 2),
        Ey: Math.sqrt(s0 / 2),
        phaseX: 0,
        phaseY: 0,
      };
    }

    // Polarized light - extract from Stokes parameters
    const angle = this.coherency.orientationAngle;
    const ellipticity = this.coherency.ellipticityAngle;

    const sqrtI = Math.sqrt(s0 * dop);
    const cosO = Math.cos(angle);
    const sinO = Math.sin(angle);
    const cosE = Math.cos(ellipticity);
    const sinE = Math.sin(ellipticity);

    // Reconstruct Jones vector from orientation and ellipticity
    const exReal = sqrtI * cosO * cosE;
    const exImag = sqrtI * sinO * sinE;
    const eyReal = sqrtI * sinO * cosE;
    const eyImag = -sqrtI * cosO * sinE;

    return {
      Ex: exReal,
      Ey: eyReal,
      phaseX: exImag,
      phaseY: eyImag,
    };
  }

  /**
   * Convert to Stokes vector [S0, S1, S2, S3]
   */
  toStokes(): [number, number, number, number] {
    return this.coherency.toStokes();
  }

  /**
   * Create from legacy LightPacket
   */
  static fromLightPacket(packet: LightPacket): UnifiedLightState {
    // Convert discrete intensity (0-15) to continuous (0-1)
    const intensity = packet.intensity / 15;

    // Convert discrete polarization to angle
    const angleRad = (packet.polarization * Math.PI) / 180;

    return new UnifiedLightState(
      CoherencyMatrix.createLinear(intensity, angleRad)
    );
  }

  /**
   * Create from Jones vector
   */
  static fromJonesVector(jones: JonesVector): UnifiedLightState {
    const ex = new Complex(jones.Ex, jones.phaseX);
    const ey = new Complex(jones.Ey, jones.phaseY);

    return new UnifiedLightState(
      CoherencyMatrix.fromJones(ex, ey)
    );
  }

  /**
   * Create from Stokes vector
   */
  static fromStokes(stokes: [number, number, number, number]): UnifiedLightState {
    return new UnifiedLightState(
      CoherencyMatrix.fromStokes(stokes[0], stokes[1], stokes[2], stokes[3])
    );
  }

  /**
   * Create a simple linearly polarized light state
   */
  static linearPolarized(intensity: number, angleDegrees: number): UnifiedLightState {
    const angleRad = (angleDegrees * Math.PI) / 180;
    return new UnifiedLightState(
      CoherencyMatrix.createLinear(intensity, angleRad)
    );
  }

  /**
   * Create circularly polarized light
   */
  static circularPolarized(intensity: number, handedness: 'left' | 'right'): UnifiedLightState {
    return new UnifiedLightState(
      CoherencyMatrix.createCircular(intensity, handedness === 'right')
    );
  }

  /**
   * Create unpolarized light
   */
  static unpolarized(intensity: number): UnifiedLightState {
    return new UnifiedLightState(
      CoherencyMatrix.createUnpolarized(intensity)
    );
  }

  /**
   * Create zero intensity light (vacuum)
   */
  static zero(): UnifiedLightState {
    return new UnifiedLightState(CoherencyMatrix.ZERO);
  }

  /**
   * Clone this light state
   */
  clone(): UnifiedLightState {
    // For CoherencyMatrix, create a new instance with same Stokes parameters
    const stokes = this.coherency.toStokes();
    return new UnifiedLightState(
      CoherencyMatrix.fromStokes(stokes[0], stokes[1], stokes[2], stokes[3])
    );
  }
}
