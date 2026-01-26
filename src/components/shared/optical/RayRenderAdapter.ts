/**
 * RayRenderAdapter - 统一物理引擎到渲染层的桥梁
 *
 * Converts RaySegment from unified physics engine to rendering-compatible formats.
 * Handles:
 * - 3D → 2D coordinate projection
 * - CoherencyMatrix → polarization visualization properties
 * - Polarization type classification (linear, circular, elliptical, unpolarized)
 * - Rendering hints for different visualization styles
 *
 * Usage:
 *   const adapter = new RayRenderAdapter({ projection: 'xy', scale: 100 })
 *   const renderData = adapter.convert(raySegment)
 *   // Use renderData with LightBeamSVG or Canvas drawing
 */

import type { RaySegment } from '@/core/physics/unified/LightTracer'
import type { Vector3 } from '@/core/math/Vector3'
import type { LightBeamSegment, GetPolarizationColorFn } from './types'
import type { Direction2D } from '@/lib/opticsPhysics'

// ============================================
// Types
// ============================================

/**
 * Polarization visualization type
 */
export type PolarizationType =
  | 'linear'      // Linearly polarized (DoP > 0.9, χ ≈ 0)
  | 'circular'    // Circularly polarized (DoP > 0.9, |χ| ≈ π/4)
  | 'elliptical'  // Elliptically polarized (DoP > 0.9, 0 < |χ| < π/4)
  | 'unpolarized' // Natural light (DoP < 0.1)
  | 'partial'     // Partially polarized (0.1 ≤ DoP ≤ 0.9)

/**
 * Handedness for circular/elliptical polarization
 */
export type Handedness = 'right' | 'left' | 'none'

/**
 * 3D → 2D projection type
 */
export type ProjectionType = 'xy' | 'xz' | 'yz' | 'custom'

/**
 * Extended rendering data with physics-accurate properties
 */
export interface RayRenderData {
  // === 2D Screen Space Coordinates ===
  start: { x: number; y: number }
  end: { x: number; y: number }

  // === Intensity & Color ===
  intensity: number                    // 0-100 normalized scale
  color: string                        // Computed polarization color
  opacity: number                      // Derived from intensity

  // === Polarization Classification ===
  polarizationType: PolarizationType
  polarizationAngle: number            // Orientation angle (degrees, 0-180)
  ellipticityAngle: number             // χ angle (degrees, -45 to 45)
  handedness: Handedness
  degreeOfPolarization: number         // DoP (0-1)

  // === Rendering Hints ===
  renderHint: RenderHint
  strokeWidth: number                  // Computed from intensity

  // === Source Tracking ===
  rayId: string
  sourceId: string

  // === Direction for flow animations ===
  direction2D: Direction2D

  // === Original Physics Data (for advanced rendering) ===
  stokesParameters: [number, number, number, number]

  // === Wave Visualization Data ===
  waveData?: WaveVisualizationData
}

/**
 * Render hints for different visualization styles
 */
export interface RenderHint {
  /** Primary rendering style */
  style: 'solid' | 'wave' | 'helix' | 'particles' | 'gradient'

  /** Animation type for the beam */
  animation: 'flow' | 'pulse' | 'spiral' | 'shimmer' | 'none'

  /** Whether to show polarization ellipse at endpoints */
  showEllipse: boolean

  /** Blur/glow amount for unpolarized light */
  glowAmount: number

  /** Phase coherence indicator (for interference visualization) */
  coherenceMarker: boolean
}

/**
 * Wave visualization data for sine wave rendering
 */
export interface WaveVisualizationData {
  /** Oscillation plane in screen space (angle from horizontal) */
  oscillationAngle: number

  /** Amplitude scaling factor */
  amplitude: number

  /** Phase offset (radians) */
  phase: number

  /** Wavelength for sine wave (pixels) */
  wavelengthPx: number

  /** For circular/elliptical: secondary oscillation angle */
  secondaryAngle?: number

  /** For circular/elliptical: secondary amplitude */
  secondaryAmplitude?: number

  /** Phase difference for secondary component */
  secondaryPhase?: number
}

/**
 * Adapter configuration
 */
export interface RayRenderAdapterConfig {
  /** 3D → 2D projection type */
  projection: ProjectionType

  /** Custom projection matrix (for 'custom' projection) */
  customProjection?: (v: Vector3) => { x: number; y: number }

  /** Scale factor from physics units to screen pixels */
  scale: number

  /** Offset in screen coordinates */
  offset: { x: number; y: number }

  /** Maximum intensity for normalization (default: 1.0) */
  maxIntensity: number

  /** Custom polarization color function */
  colorFn?: GetPolarizationColorFn

  /** Threshold for classifying as unpolarized (default: 0.1) */
  unpolarizedThreshold: number

  /** Threshold for classifying as fully polarized (default: 0.9) */
  polarizedThreshold: number

  /** Threshold for classifying as circular vs elliptical (default: 0.95) */
  circularThreshold: number

  /** Default wavelength in pixels for wave visualization */
  defaultWavelengthPx: number
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: RayRenderAdapterConfig = {
  projection: 'xy',
  scale: 100,
  offset: { x: 0, y: 0 },
  maxIntensity: 1.0,
  unpolarizedThreshold: 0.1,
  polarizedThreshold: 0.9,
  circularThreshold: 0.95,
  defaultWavelengthPx: 20,
}

// ============================================
// Default Polarization Color Function
// ============================================

/**
 * Default polarization color mapping
 * Based on standard visualization convention (not physical)
 */
const DEFAULT_COLOR_FN: GetPolarizationColorFn = (angle: number) => {
  const normalizedAngle = ((angle % 180) + 180) % 180

  // 0° (horizontal): Red
  if (normalizedAngle < 22.5 || normalizedAngle >= 157.5) {
    return '#ff4444'
  }
  // 45°: Orange
  if (normalizedAngle < 67.5) {
    return '#ffaa00'
  }
  // 90° (vertical): Green
  if (normalizedAngle < 112.5) {
    return '#44ff44'
  }
  // 135°: Blue
  return '#4444ff'
}

/**
 * Color for circular polarization
 */
function getCircularColor(handedness: Handedness): string {
  if (handedness === 'right') {
    return '#ff44ff' // Magenta for RCP
  }
  if (handedness === 'left') {
    return '#44ffff' // Cyan for LCP
  }
  return '#ffffff'
}

/**
 * Color for unpolarized light
 */
const UNPOLARIZED_COLOR = '#ffffaa' // Pale yellow

// ============================================
// RayRenderAdapter Class
// ============================================

export class RayRenderAdapter {
  private config: RayRenderAdapterConfig

  constructor(config: Partial<RayRenderAdapterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Convert a RaySegment to RayRenderData
   */
  convert(segment: RaySegment): RayRenderData {
    // Project 3D positions to 2D
    const start = this.project(segment.start)
    const end = this.project(segment.end)

    // Extract polarization properties from CoherencyMatrix
    const stokes = segment.state.toStokes()
    const dop = segment.state.degreeOfPolarization
    const orientationRad = segment.state.orientationAngle
    const ellipticityRad = segment.state.ellipticityAngle

    // Convert to degrees
    const orientationDeg = (orientationRad * 180 / Math.PI + 180) % 180
    const ellipticityDeg = ellipticityRad * 180 / Math.PI

    // Classify polarization type
    const polarizationType = this.classifyPolarization(dop, ellipticityRad)

    // Determine handedness from S3 (Stokes parameter for circular component)
    const handedness = this.determineHandedness(stokes[3], dop)

    // Compute color
    const color = this.computeColor(polarizationType, orientationDeg, handedness)

    // Normalize intensity
    const normalizedIntensity = Math.min(
      100,
      (segment.intensity / this.config.maxIntensity) * 100
    )

    // Compute rendering hints
    const renderHint = this.computeRenderHint(polarizationType, dop)

    // Compute stroke width based on intensity
    const strokeWidth = Math.max(0.5, (normalizedIntensity / 100) * 3)

    // Determine 2D direction for animations
    const direction2D = this.computeDirection2D(start, end)

    // Compute wave visualization data
    const waveData = this.computeWaveData(
      polarizationType,
      orientationDeg,
      ellipticityDeg,
      handedness,
      normalizedIntensity
    )

    return {
      start,
      end,
      intensity: normalizedIntensity,
      color,
      opacity: Math.max(0.2, normalizedIntensity / 100),
      polarizationType,
      polarizationAngle: orientationDeg,
      ellipticityAngle: ellipticityDeg,
      handedness,
      degreeOfPolarization: dop,
      renderHint,
      strokeWidth,
      rayId: segment.rayId,
      sourceId: segment.sourceId,
      direction2D,
      stokesParameters: stokes,
      waveData,
    }
  }

  /**
   * Convert RayRenderData to LightBeamSegment for compatibility with existing components
   */
  toBeamSegment(renderData: RayRenderData): LightBeamSegment {
    return {
      startX: renderData.start.x,
      startY: renderData.start.y,
      endX: renderData.end.x,
      endY: renderData.end.y,
      intensity: renderData.intensity,
      polarization: renderData.polarizationAngle,
      direction: renderData.direction2D,
      polarizationInfo: {
        type: renderData.polarizationType === 'unpolarized' ||
              renderData.polarizationType === 'partial'
          ? 'linear'
          : renderData.polarizationType as 'linear' | 'circular' | 'elliptical',
        angle: renderData.polarizationAngle,
        intensity: renderData.intensity,
        ellipticity: renderData.ellipticityAngle * Math.PI / 180,
        handedness: renderData.handedness,
      },
      coherenceId: renderData.sourceId,
      phase: renderData.waveData?.phase ?? 0,
    }
  }

  /**
   * Batch convert multiple segments
   */
  convertAll(segments: RaySegment[]): RayRenderData[] {
    return segments.map(s => this.convert(s))
  }

  /**
   * Batch convert to LightBeamSegments
   */
  toBeamSegments(segments: RaySegment[]): LightBeamSegment[] {
    return segments.map(s => this.toBeamSegment(this.convert(s)))
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * Project 3D vector to 2D screen coordinates
   */
  private project(v: Vector3): { x: number; y: number } {
    let x: number
    let y: number

    switch (this.config.projection) {
      case 'xy':
        x = v.x
        y = v.y
        break
      case 'xz':
        x = v.x
        y = v.z
        break
      case 'yz':
        x = v.y
        y = v.z
        break
      case 'custom':
        if (this.config.customProjection) {
          return this.config.customProjection(v)
        }
        x = v.x
        y = v.y
        break
      default:
        x = v.x
        y = v.y
    }

    return {
      x: x * this.config.scale + this.config.offset.x,
      y: y * this.config.scale + this.config.offset.y,
    }
  }

  /**
   * Classify polarization type based on DoP and ellipticity
   */
  private classifyPolarization(dop: number, ellipticityRad: number): PolarizationType {
    // Unpolarized light
    if (dop < this.config.unpolarizedThreshold) {
      return 'unpolarized'
    }

    // Partially polarized
    if (dop < this.config.polarizedThreshold) {
      return 'partial'
    }

    // Fully polarized: determine if linear, circular, or elliptical
    const absEllipticity = Math.abs(ellipticityRad)
    const maxEllipticity = Math.PI / 4 // 45° for circular

    // Check if circular (ellipticity near ±45°)
    if (absEllipticity > maxEllipticity * this.config.circularThreshold) {
      return 'circular'
    }

    // Check if linear (ellipticity near 0°)
    if (absEllipticity < maxEllipticity * (1 - this.config.circularThreshold)) {
      return 'linear'
    }

    // Otherwise elliptical
    return 'elliptical'
  }

  /**
   * Determine handedness from S3 Stokes parameter
   */
  private determineHandedness(s3: number, dop: number): Handedness {
    // Need sufficient polarization to determine handedness
    if (dop < this.config.unpolarizedThreshold) {
      return 'none'
    }

    const threshold = 0.1 * dop // Scale threshold by DoP

    if (s3 > threshold) {
      return 'right' // RCP: positive S3
    }
    if (s3 < -threshold) {
      return 'left' // LCP: negative S3
    }
    return 'none' // Linear: S3 ≈ 0
  }

  /**
   * Compute display color based on polarization type
   */
  private computeColor(
    type: PolarizationType,
    orientationDeg: number,
    handedness: Handedness
  ): string {
    switch (type) {
      case 'unpolarized':
        return UNPOLARIZED_COLOR

      case 'partial':
        // Blend between unpolarized and polarized color
        const polarizedColor = this.config.colorFn
          ? this.config.colorFn(orientationDeg)
          : DEFAULT_COLOR_FN(orientationDeg)
        return polarizedColor // Could implement blending here

      case 'circular':
        return getCircularColor(handedness)

      case 'elliptical':
        // For elliptical: blend between linear color and circular color
        return this.config.colorFn
          ? this.config.colorFn(orientationDeg)
          : DEFAULT_COLOR_FN(orientationDeg)

      case 'linear':
      default:
        return this.config.colorFn
          ? this.config.colorFn(orientationDeg)
          : DEFAULT_COLOR_FN(orientationDeg)
    }
  }

  /**
   * Compute rendering hints based on polarization type
   */
  private computeRenderHint(type: PolarizationType, dop: number): RenderHint {
    switch (type) {
      case 'unpolarized':
        return {
          style: 'particles',
          animation: 'shimmer',
          showEllipse: false,
          glowAmount: 2.0,
          coherenceMarker: false,
        }

      case 'partial':
        return {
          style: 'gradient',
          animation: 'pulse',
          showEllipse: true,
          glowAmount: 1.0 + (1 - dop),
          coherenceMarker: false,
        }

      case 'circular':
        return {
          style: 'helix',
          animation: 'spiral',
          showEllipse: true,
          glowAmount: 0.5,
          coherenceMarker: true,
        }

      case 'elliptical':
        return {
          style: 'wave',
          animation: 'flow',
          showEllipse: true,
          glowAmount: 0.5,
          coherenceMarker: true,
        }

      case 'linear':
      default:
        return {
          style: 'wave',
          animation: 'flow',
          showEllipse: false,
          glowAmount: 0.3,
          coherenceMarker: true,
        }
    }
  }

  /**
   * Compute 2D direction for flow animations
   */
  private computeDirection2D(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): Direction2D {
    const dx = end.x - start.x
    const dy = end.y - start.y

    // Determine primary direction
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left'
    }
    return dy > 0 ? 'down' : 'up'
  }

  /**
   * Compute wave visualization data
   */
  private computeWaveData(
    type: PolarizationType,
    orientationDeg: number,
    ellipticityDeg: number,
    handedness: Handedness,
    intensity: number
  ): WaveVisualizationData | undefined {
    if (type === 'unpolarized') {
      // No coherent wave visualization for unpolarized light
      return undefined
    }

    const amplitude = Math.sqrt(intensity / 100)

    if (type === 'linear') {
      return {
        oscillationAngle: orientationDeg,
        amplitude,
        phase: 0,
        wavelengthPx: this.config.defaultWavelengthPx,
      }
    }

    if (type === 'circular') {
      // Circular: two orthogonal oscillations with 90° phase difference
      return {
        oscillationAngle: 0,
        amplitude: amplitude / Math.SQRT2,
        phase: 0,
        wavelengthPx: this.config.defaultWavelengthPx,
        secondaryAngle: 90,
        secondaryAmplitude: amplitude / Math.SQRT2,
        secondaryPhase: handedness === 'right' ? -Math.PI / 2 : Math.PI / 2,
      }
    }

    if (type === 'elliptical') {
      // Elliptical: use orientation and ellipticity to compute components
      const tanChi = Math.tan(ellipticityDeg * Math.PI / 180)
      const majorAmp = amplitude * Math.cos(Math.atan(Math.abs(tanChi)))
      const minorAmp = amplitude * Math.sin(Math.atan(Math.abs(tanChi)))

      return {
        oscillationAngle: orientationDeg,
        amplitude: majorAmp,
        phase: 0,
        wavelengthPx: this.config.defaultWavelengthPx,
        secondaryAngle: orientationDeg + 90,
        secondaryAmplitude: minorAmp,
        secondaryPhase: handedness === 'right' ? -Math.PI / 2 : Math.PI / 2,
      }
    }

    // Partial polarization: use dominant polarization component
    return {
      oscillationAngle: orientationDeg,
      amplitude: amplitude * 0.7, // Reduced amplitude for partial
      phase: 0,
      wavelengthPx: this.config.defaultWavelengthPx,
    }
  }

  /**
   * Update configuration
   */
  configure(updates: Partial<RayRenderAdapterConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get current configuration
   */
  getConfig(): RayRenderAdapterConfig {
    return { ...this.config }
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Create adapter with XY projection (most common for 2D demos)
 */
export function createXYAdapter(
  scale: number = 100,
  offset: { x: number; y: number } = { x: 0, y: 0 }
): RayRenderAdapter {
  return new RayRenderAdapter({ projection: 'xy', scale, offset })
}

/**
 * Create adapter with XZ projection (top-down view)
 */
export function createXZAdapter(
  scale: number = 100,
  offset: { x: number; y: number } = { x: 0, y: 0 }
): RayRenderAdapter {
  return new RayRenderAdapter({ projection: 'xz', scale, offset })
}

/**
 * Quick conversion function for simple use cases
 */
export function convertSegmentToBeam(
  segment: RaySegment,
  scale: number = 100
): LightBeamSegment {
  const adapter = new RayRenderAdapter({ scale })
  return adapter.toBeamSegment(adapter.convert(segment))
}

/**
 * Batch conversion function
 */
export function convertSegmentsToBeams(
  segments: RaySegment[],
  scale: number = 100
): LightBeamSegment[] {
  const adapter = new RayRenderAdapter({ scale })
  return adapter.toBeamSegments(segments)
}

// ============================================
// Canvas Drawing Utilities
// ============================================

/**
 * Draw a ray using Canvas 2D context
 */
export function drawRayOnCanvas(
  ctx: CanvasRenderingContext2D,
  renderData: RayRenderData,
  options: {
    showWave?: boolean
    waveAmplitude?: number
    wavePoints?: number
  } = {}
): void {
  const { start, end, color, opacity, strokeWidth, polarizationType, waveData } = renderData
  const { showWave = false, waveAmplitude = 5, wavePoints = 50 } = options

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = strokeWidth
  ctx.lineCap = 'round'

  if (!showWave || !waveData || polarizationType === 'unpolarized') {
    // Simple line rendering
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  } else {
    // Wave rendering for polarized light
    drawWaveOnCanvas(ctx, start, end, waveData, waveAmplitude, wavePoints)
  }

  // Add glow effect for unpolarized light
  if (polarizationType === 'unpolarized') {
    ctx.globalAlpha = opacity * 0.3
    ctx.lineWidth = strokeWidth * 3
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Draw wave visualization
 */
function drawWaveOnCanvas(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  waveData: WaveVisualizationData,
  amplitude: number,
  points: number
): void {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)

  // Direction vectors
  const dirX = dx / length
  const dirY = dy / length

  // Perpendicular vector for oscillation
  const perpX = -dirY
  const perpY = dirX

  // Oscillation direction based on polarization angle
  const oscAngleRad = waveData.oscillationAngle * Math.PI / 180
  const beamAngle = Math.atan2(dy, dx)
  const relativeOscAngle = oscAngleRad - beamAngle

  // Effective perpendicular components
  const oscPerpX = perpX * Math.cos(relativeOscAngle)
  const oscPerpY = perpY * Math.cos(relativeOscAngle)

  ctx.beginPath()

  for (let i = 0; i <= points; i++) {
    const t = i / points
    const baseX = start.x + dx * t
    const baseY = start.y + dy * t

    // Primary wave oscillation
    const phase = (t * length / waveData.wavelengthPx) * 2 * Math.PI + waveData.phase
    const offset1 = Math.sin(phase) * amplitude * waveData.amplitude

    let totalOffsetX = oscPerpX * offset1
    let totalOffsetY = oscPerpY * offset1

    // Secondary oscillation for circular/elliptical
    if (waveData.secondaryAmplitude !== undefined && waveData.secondaryPhase !== undefined) {
      const phase2 = phase + waveData.secondaryPhase
      const offset2 = Math.sin(phase2) * amplitude * waveData.secondaryAmplitude

      // Secondary perpendicular direction (rotated 90°)
      totalOffsetX += -oscPerpY * offset2
      totalOffsetY += oscPerpX * offset2
    }

    const x = baseX + totalOffsetX
    const y = baseY + totalOffsetY

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
}

/**
 * Draw polarization ellipse at a point
 */
export function drawPolarizationEllipse(
  ctx: CanvasRenderingContext2D,
  position: { x: number; y: number },
  renderData: RayRenderData,
  size: number = 10
): void {
  if (renderData.polarizationType === 'unpolarized') {
    // Draw circle with random phase markers for unpolarized
    ctx.save()
    ctx.strokeStyle = renderData.color
    ctx.globalAlpha = renderData.opacity * 0.5
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(position.x, position.y, size, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    return
  }

  const orientationRad = renderData.polarizationAngle * Math.PI / 180
  const ellipticityRad = renderData.ellipticityAngle * Math.PI / 180

  // Semi-axes from ellipticity
  const a = size // Major axis
  const b = size * Math.abs(Math.tan(ellipticityRad)) // Minor axis

  ctx.save()
  ctx.translate(position.x, position.y)
  ctx.rotate(orientationRad)

  ctx.strokeStyle = renderData.color
  ctx.globalAlpha = renderData.opacity
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.ellipse(0, 0, a, Math.max(0.5, b), 0, 0, Math.PI * 2)
  ctx.stroke()

  // Draw handedness indicator for circular/elliptical
  if (renderData.handedness !== 'none') {
    ctx.beginPath()
    ctx.arc(
      0, 0, a * 0.3,
      0, Math.PI * (renderData.handedness === 'right' ? 1 : -1)
    )
    ctx.stroke()
  }

  ctx.restore()
}
