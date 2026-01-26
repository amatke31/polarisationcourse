/**
 * GameAdapter - 游戏物理适配器
 *
 * Bridges 2D game components to the unified physics engine.
 * Provides:
 * - Block -> OpticalSurface mapping
 * - Fidelity-based victory checking
 * - Signal strength calculation for UI feedback
 *
 * This ensures the game uses proper physics calculations from the unified engine
 * rather than hardcoded formulas.
 *
 * Usage:
 * ```typescript
 * const adapter = new GamePhysicsAdapter(components)
 * const result = adapter.traceAllPaths()
 * const victory = adapter.checkVictory(result.sensorStates)
 * ```
 */

import { Complex } from '@/core/math/Complex'
import { Matrix2x2 } from '@/core/math/Matrix2x2'
import {
  CoherencyMatrix,
  RIGHT_CIRCULAR,
  LEFT_CIRCULAR,
} from '@/core/physics/unified/CoherencyMatrix'
import type { OpticalComponent } from '../types'

// ============================================
// Type Definitions
// ============================================

/**
 * Result of physics-based sensor evaluation
 */
export interface SensorEvaluation {
  sensorId: string
  activated: boolean
  intensity: number
  polarizationMatch: number // 0-1 fidelity
  signalStrength: number // Combined metric for UI (0-100)
  state: CoherencyMatrix
  requiredState?: CoherencyMatrix
}

/**
 * Victory check result with fidelity-based scoring
 */
export interface VictoryResult {
  victory: boolean
  score: number // 0-100 based on total fidelity
  sensorResults: SensorEvaluation[]
  message: string
  messageZh: string
}

/**
 * Configuration for physics-based game
 */
export interface GamePhysicsConfig {
  /** Minimum fidelity required for victory (default: 0.95) */
  victoryThreshold: number
  /** Intensity threshold for "activated" (default: 5) */
  activationThreshold: number
  /** Maximum trace depth (default: 50) */
  maxTraceDepth: number
  /** Intensity threshold for cutting off trace (default: 0.5) */
  minTraceIntensity: number
}

const DEFAULT_CONFIG: GamePhysicsConfig = {
  victoryThreshold: 0.95,
  activationThreshold: 5,
  maxTraceDepth: 50,
  minTraceIntensity: 0.5,
}

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180

// ============================================
// Component to Physics Element Converters
// ============================================

/**
 * Create CoherencyMatrix for an emitter's polarization state
 */
export function createEmitterState(component: OpticalComponent): CoherencyMatrix {
  if (component.emitterPolarizationType === 'circular') {
    const handedness = component.handedness || 'right'
    return handedness === 'right' ? RIGHT_CIRCULAR.clone() : LEFT_CIRCULAR.clone()
  }

  // Default to linear polarization
  const angle = (component.polarizationAngle ?? 0) * DEG_TO_RAD
  return CoherencyMatrix.createLinear(1.0, angle)
}

/**
 * Create target CoherencyMatrix for a sensor's required state
 */
export function createSensorTarget(component: OpticalComponent): CoherencyMatrix | null {
  if (component.requiredPolarization === undefined) {
    return null // Any polarization accepted
  }

  const angle = component.requiredPolarization * DEG_TO_RAD
  return CoherencyMatrix.createLinear(1.0, angle)
}

/**
 * Create Jones matrix for a polarizer
 */
export function createPolarizerMatrix(angleDeg: number): Matrix2x2 {
  const theta = angleDeg * DEG_TO_RAD
  const c = Math.cos(theta)
  const s = Math.sin(theta)

  return new Matrix2x2(
    new Complex(c * c), new Complex(c * s),
    new Complex(c * s), new Complex(s * s)
  )
}

/**
 * Create Jones matrix for a waveplate
 */
export function createWaveplateMatrix(fastAxisDeg: number, retardance: number): Matrix2x2 {
  const theta = fastAxisDeg * DEG_TO_RAD
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const c2 = c * c
  const s2 = s * s
  const cs = c * s

  const eid = Complex.exp(retardance)
  const eidm1 = eid.sub(Complex.ONE)

  const a00 = new Complex(c2).add(eid.scale(s2))
  const a01 = new Complex(cs).mul(eidm1)
  const a11 = new Complex(s2).add(eid.scale(c2))

  return new Matrix2x2(a00, a01, a01, a11)
}

/**
 * Create Jones matrix for an optical rotator
 */
export function createRotatorMatrix(rotationDeg: number): Matrix2x2 {
  const theta = rotationDeg * DEG_TO_RAD
  const c = Math.cos(theta)
  const s = Math.sin(theta)

  return new Matrix2x2(
    new Complex(c), new Complex(-s),
    new Complex(s), new Complex(c)
  )
}

/**
 * Apply an optical component's effect to a polarization state
 */
export function applyComponentEffect(
  state: CoherencyMatrix,
  component: OpticalComponent
): CoherencyMatrix {
  let matrix: Matrix2x2

  switch (component.type) {
    case 'polarizer':
      matrix = createPolarizerMatrix(component.polarizationAngle ?? 0)
      break

    case 'halfWavePlate':
      matrix = createWaveplateMatrix(component.angle, Math.PI)
      break

    case 'quarterWavePlate':
      matrix = createWaveplateMatrix(component.angle, Math.PI / 2)
      break

    case 'rotator':
      matrix = createRotatorMatrix(component.rotationAmount ?? 45)
      break

    case 'phaseShifter':
      const phase = (component.phaseShift ?? 90) * DEG_TO_RAD
      matrix = createWaveplateMatrix(0, phase)
      break

    case 'circularFilter':
      // Circular filter: project onto RCP or LCP
      // This is implemented as a quarter wave plate + polarizer + quarter wave plate
      // For simplicity, we use a projection matrix
      const target = component.filterHandedness === 'left' ? LEFT_CIRCULAR : RIGHT_CIRCULAR
      // Project input onto the target circular state
      const fidelity = computeFidelity(state, target)
      return CoherencyMatrix.createCircular(state.intensity * fidelity, component.filterHandedness === 'right')

    default:
      return state // No effect
  }

  return state.applyOperator(matrix)
}

// ============================================
// Fidelity Calculation
// ============================================

/**
 * Compute polarization fidelity between two states
 * Returns value between 0 (orthogonal) and 1 (identical)
 *
 * Uses trace fidelity: F = Tr(ρ₁ × ρ₂) / (√(Tr(ρ₁²)) × √(Tr(ρ₂²)))
 */
export function computeFidelity(state1: CoherencyMatrix, state2: CoherencyMatrix): number {
  // Get Stokes parameters
  const s1 = state1.toStokes()
  const s2 = state2.toStokes()

  // For pure states, fidelity = |<ψ₁|ψ₂>|²
  // In Stokes representation: F = (1 + P⃗₁·P⃗₂) / 2
  // where P⃗ = [S₁/S₀, S₂/S₀, S₃/S₀]

  const dop1 = state1.degreeOfPolarization
  const dop2 = state2.degreeOfPolarization

  if (dop1 < 0.01 || dop2 < 0.01) {
    // One state is unpolarized - fidelity is based on DoP
    return Math.min(dop1, dop2)
  }

  // Normalized Stokes vectors
  const p1 = [s1[1] / s1[0], s1[2] / s1[0], s1[3] / s1[0]]
  const p2 = [s2[1] / s2[0], s2[2] / s2[0], s2[3] / s2[0]]

  // Dot product
  const dot = p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2]

  // Fidelity
  return Math.max(0, Math.min(1, (1 + dot) / 2))
}

/**
 * Compute signal strength as a combined metric for UI
 * Considers both intensity and polarization match
 */
export function computeSignalStrength(
  intensity: number,
  fidelity: number,
  requiredIntensity: number = 50
): number {
  // Intensity contribution (0-50 points)
  const intensityScore = Math.min(50, (intensity / requiredIntensity) * 50)

  // Fidelity contribution (0-50 points)
  const fidelityScore = fidelity * 50

  return Math.round(intensityScore + fidelityScore)
}

// ============================================
// Main Game Physics Adapter Class
// ============================================

export class GamePhysicsAdapter {
  private components: OpticalComponent[]
  private config: GamePhysicsConfig

  constructor(components: OpticalComponent[], config: Partial<GamePhysicsConfig> = {}) {
    this.components = components
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Update components
   */
  updateComponents(components: OpticalComponent[]): void {
    this.components = components
  }

  /**
   * Evaluate a sensor with physics-based fidelity
   */
  evaluateSensor(
    sensor: OpticalComponent,
    receivedState: CoherencyMatrix
  ): SensorEvaluation {
    const targetState = createSensorTarget(sensor)
    const intensity = receivedState.intensity * 100 // Convert to percentage

    let fidelity = 1.0
    if (targetState) {
      fidelity = computeFidelity(receivedState, targetState)
    }

    const requiredIntensity = sensor.requiredIntensity ?? 50
    const activated = intensity >= this.config.activationThreshold && fidelity >= 0.5

    return {
      sensorId: sensor.id,
      activated,
      intensity,
      polarizationMatch: fidelity,
      signalStrength: computeSignalStrength(intensity, fidelity, requiredIntensity),
      state: receivedState,
      requiredState: targetState ?? undefined,
    }
  }

  /**
   * Check victory conditions with fidelity-based scoring
   */
  checkVictory(sensorEvaluations: SensorEvaluation[]): VictoryResult {
    if (sensorEvaluations.length === 0) {
      return {
        victory: false,
        score: 0,
        sensorResults: [],
        message: 'No sensors to evaluate',
        messageZh: '没有传感器需要评估',
      }
    }

    // Calculate average fidelity and activation
    const avgFidelity = sensorEvaluations.reduce((sum, e) => sum + e.polarizationMatch, 0) / sensorEvaluations.length
    const allActivated = sensorEvaluations.every(e => e.activated)
    const avgSignalStrength = sensorEvaluations.reduce((sum, e) => sum + e.signalStrength, 0) / sensorEvaluations.length

    const victory = allActivated && avgFidelity >= this.config.victoryThreshold

    let message: string
    let messageZh: string

    if (victory) {
      if (avgFidelity > 0.99) {
        message = 'Perfect! All sensors matched with excellent fidelity!'
        messageZh = '完美！所有传感器以极高保真度匹配！'
      } else {
        message = 'Victory! All sensors activated with good fidelity.'
        messageZh = '胜利！所有传感器以良好保真度激活。'
      }
    } else if (!allActivated) {
      const inactiveCount = sensorEvaluations.filter(e => !e.activated).length
      message = `${inactiveCount} sensor(s) not activated. Adjust polarization or intensity.`
      messageZh = `${inactiveCount}个传感器未激活。调整偏振或强度。`
    } else {
      message = `Polarization mismatch. Current fidelity: ${(avgFidelity * 100).toFixed(0)}%. Need ${(this.config.victoryThreshold * 100).toFixed(0)}%.`
      messageZh = `偏振不匹配。当前保真度：${(avgFidelity * 100).toFixed(0)}%。需要${(this.config.victoryThreshold * 100).toFixed(0)}%。`
    }

    return {
      victory,
      score: Math.round(avgSignalStrength),
      sensorResults: sensorEvaluations,
      message,
      messageZh,
    }
  }

  /**
   * Get all sensors from components
   */
  getSensors(): OpticalComponent[] {
    return this.components.filter(c => c.type === 'sensor')
  }

  /**
   * Get all emitters from components
   */
  getEmitters(): OpticalComponent[] {
    return this.components.filter(c => c.type === 'emitter')
  }
}

// ============================================
// Signal Strength UI Helper
// ============================================

/**
 * Get color and label for signal strength display
 */
export function getSignalStrengthDisplay(strength: number): {
  color: string
  label: string
  labelZh: string
  barWidth: string
} {
  if (strength >= 95) {
    return {
      color: '#22c55e', // green-500
      label: 'Excellent',
      labelZh: '优秀',
      barWidth: '100%',
    }
  }
  if (strength >= 80) {
    return {
      color: '#84cc16', // lime-500
      label: 'Good',
      labelZh: '良好',
      barWidth: `${strength}%`,
    }
  }
  if (strength >= 60) {
    return {
      color: '#eab308', // yellow-500
      label: 'Fair',
      labelZh: '一般',
      barWidth: `${strength}%`,
    }
  }
  if (strength >= 40) {
    return {
      color: '#f97316', // orange-500
      label: 'Weak',
      labelZh: '较弱',
      barWidth: `${strength}%`,
    }
  }
  return {
    color: '#ef4444', // red-500
    label: 'Poor',
    labelZh: '差',
    barWidth: `${Math.max(5, strength)}%`,
  }
}

// ============================================
// Export convenience function
// ============================================

/**
 * Create a game physics adapter
 */
export function createGameAdapter(
  components: OpticalComponent[],
  config?: Partial<GamePhysicsConfig>
): GamePhysicsAdapter {
  return new GamePhysicsAdapter(components, config)
}
