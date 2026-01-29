/**
 * CoherencyMode - Full Coherency Matrix implementation with partial polarization
 *
 * This mode uses the advanced physics/unified system with CoherencyMatrix state
 * representation. It supports partial polarization and is the most accurate mode.
 *
 * Characteristics:
 * - Continuous intensity (0-1, scales to 0-100)
 * - Continuous polarization angles (0-180°)
 * - Continuous phase (0-2π)
 * - Full polarization support (linear, circular, elliptical)
 * - Partial polarization support (degree of polarization 0-1)
 * - Most accurate physics simulation
 */
import { PhysicsMode } from '../PhysicsMode';
import { UnifiedLightState } from '../UnifiedLightState';
import type {
  IPhysicsMode,
  LightSource,
  SceneGeometry,
  TraceResult,
  SensorState,
  LightRay,
  Position2D,
  Position3D,
} from './IPhysicsMode';
import type { OpticalComponent } from '@/components/shared/optical/types';

// Import unified physics system
import { CoherencyMatrix } from '../../physics/unified/CoherencyMatrix';
import { Complex } from '../../math/Complex';
import { Matrix2x2 } from '../../math/Matrix2x2';

/**
 * Coherency mode implementation with partial polarization support
 */
export class CoherencyMode implements IPhysicsMode {
  readonly name = PhysicsMode.COHERENCY;

  private rayCounter = 0;
  private activeRays = new Map<string, LightRay>();

  /**
   * Process light through a single component using CoherencyMatrix
   */
  processLight(
    light: UnifiedLightState,
    component: OpticalComponent
  ): UnifiedLightState[] {
    // Get CoherencyMatrix from UnifiedLightState
    const coherency = light.getCoherencyMatrix();

    let outputCoherency;
    switch (component.type) {
      case 'polarizer': {
        // Linear polarizer at specific angle (Malus's Law)
        const angle = (component.polarizationAngle || 0) * Math.PI / 180;
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        // Jones matrix for linear polarizer: P(θ) = [c²  cs]
        //                                            [cs  s²]
        const jonesMatrix = new Matrix2x2(
          new Complex(c * c, 0),
          new Complex(c * s, 0),
          new Complex(c * s, 0),
          new Complex(s * s, 0)
        );

        // Apply using CoherencyMatrix: J' = M × J × M†
        outputCoherency = coherency.applyOperator(jonesMatrix);
        break;
      }

      case 'rotator': {
        // Optical rotator (rotates polarization without intensity loss)
        const angle = (component.rotationAmount || 45) * Math.PI / 180;
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        // Jones matrix for rotator: R(θ) = [c  -s]
        //                                      [s   c]
        const rotationMatrix = new Matrix2x2(
          new Complex(c, 0),
          new Complex(-s, 0),
          new Complex(s, 0),
          new Complex(c, 0)
        );

        outputCoherency = coherency.applyOperator(rotationMatrix);
        break;
      }

      case 'quarterWavePlate': {
        // True quarter-wave plate with phase retardation of π/2
        const angle = (component.angle || 0) * Math.PI / 180;

        // For QWP, use the Jones calculus waveplate matrix
        // This converts linear to circular polarization at 45°
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const expPlus = new Complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4));  // e^(iπ/4)
        const expMinus = new Complex(Math.cos(-Math.PI / 4), Math.sin(-Math.PI / 4)); // e^(-iπ/4)

        const a = new Complex(c * c, 0).mul(expPlus).add(new Complex(s * s, 0).mul(expMinus));
        const b = new Complex(c * s, 0).mul(expPlus.sub(expMinus));
        const d = new Complex(s * s, 0).mul(expPlus).add(new Complex(c * c, 0).mul(expMinus));

        const qwpMatrix = new Matrix2x2(a, b, b, d);
        outputCoherency = coherency.applyOperator(qwpMatrix);
        break;
      }

      case 'halfWavePlate': {
        // True half-wave plate with phase retardation of π
        const angle = (component.angle || 0) * Math.PI / 180;

        // For HWP, phase difference is π
        const c2 = Math.cos(angle) * Math.cos(angle);
        const s2 = Math.sin(angle) * Math.sin(angle);
        const cs = Math.cos(angle) * Math.sin(angle);

        // Jones matrix for HWP: flips polarization about fast axis
        const hwpMatrix = new Matrix2x2(
          new Complex(c2 - s2, 0),
          new Complex(2 * cs, 0),
          new Complex(2 * cs, 0),
          new Complex(s2 - c2, 0)
        );

        outputCoherency = coherency.applyOperator(hwpMatrix);
        break;
      }

      case 'mirror': {
        // Mirror reflects light (preserves polarization state)
        outputCoherency = coherency;
        break;
      }

      case 'splitter': {
        // Polarizing beam splitter - separates orthogonal polarizations
        return this.processSplitter(light);
      }

      case 'sensor':
      case 'emitter':
      default:
        // These don't modify light
        outputCoherency = coherency;
        break;
    }

    if (!outputCoherency) {
      return [];
    }

    // Convert back to UnifiedLightState
    return [new UnifiedLightState(outputCoherency)];
  }

  /**
   * Process polarizing beam splitter (creates two output beams)
   */
  private processSplitter(
    light: UnifiedLightState
  ): UnifiedLightState[] {
    // PBS separates horizontal and vertical components
    const coherency = light.getCoherencyMatrix();
    const intensity = coherency.intensity;
    const angle = coherency.orientationAngle * Math.PI / 180;

    // Extract horizontal component (transmitted)
    const horizontalIntensity = intensity * Math.cos(angle) ** 2;
    const horizontalMatrix = CoherencyMatrix.createLinear(horizontalIntensity, 0);

    // Extract vertical component (reflected)
    const verticalIntensity = intensity * Math.sin(angle) ** 2;
    const verticalMatrix = CoherencyMatrix.createLinear(verticalIntensity, Math.PI / 2);

    const results: UnifiedLightState[] = [];

    if (horizontalMatrix.intensity > 0.001) {
      results.push(new UnifiedLightState(horizontalMatrix));
    }
    if (verticalMatrix.intensity > 0.001) {
      results.push(new UnifiedLightState(verticalMatrix));
    }

    return results;
  }

  /**
   * Trace light through the entire scene using BFS ray tracing
   */
  trace(
    sources: LightSource[],
    scene: SceneGeometry,
    _config?: unknown
  ): TraceResult {
    // Reset state
    this.rayCounter = 0;
    this.activeRays.clear();

    const allRays: LightRay[] = [];
    const sensorStates: SensorState[] = [];
    const visitedPositions = new Set<string>();
    const rayQueue: LightRay[] = [];

    // Initialize rays from sources
    for (const source of sources) {
      const ray = this.createRayFromSource(source);
      rayQueue.push(ray);
      this.activeRays.set(ray.id, ray);
    }

    // BFS ray tracing
    let iterations = 0;
    const maxIterations = 100;

    while (rayQueue.length > 0 && iterations < maxIterations) {
      iterations++;
      const ray = rayQueue.shift()!;

      // Check if we've already processed this position
      const posKey = this.positionKey(ray.position);
      if (visitedPositions.has(posKey)) {
        continue;
      }
      visitedPositions.add(posKey);

      // Check if position is valid
      if (!scene.isValidPosition(ray.position)) {
        allRays.push(ray);
        continue;
      }

      // Check for component at this position
      const component = scene.getComponentAt(ray.position);
      if (component) {
        // Process through component
        const outputStates = this.processLight(ray.state, component);

        if (outputStates.length === 0) {
          // Light was absorbed
          allRays.push(ray);
          continue;
        }

        // Handle sensor
        if (component.type === 'sensor') {
          const sensorState = this.createSensorState(component, outputStates[0]);
          sensorStates.push(sensorState);
          // Light is absorbed by sensor
          continue;
        }

        // Create new rays for each output state
        for (const outputState of outputStates) {
          const newPos = scene.getNextPosition(ray.position, ray.direction);
          const newRay: LightRay = {
            id: `ray-${this.rayCounter++}`,
            position: newPos,
            direction: ray.direction,
            state: outputState,
            path: [...ray.path, newPos],
            iterations: ray.iterations + 1,
            parentRayId: ray.id,
          };
          rayQueue.push(newRay);
          this.activeRays.set(newRay.id, newRay);
        }
      } else {
        // No component, light continues
        const newPos = scene.getNextPosition(ray.position, ray.direction);
        ray.path.push(newPos);
        ray.position = newPos;

        // Check if still valid
        if (scene.isValidPosition(newPos)) {
          rayQueue.push(ray);
        }
        allRays.push(ray);
      }
    }

    // Calculate total intensity
    const totalIntensity = Array.from(this.activeRays.values())
      .reduce((sum, ray) => sum + ray.state.intensity, 0);

    return {
      rays: allRays,
      sensorStates,
      totalIntensity,
      rayCount: this.rayCounter,
      maxIterationsReached: iterations >= maxIterations,
    };
  }

  /**
   * Get light intensity at a specific position
   */
  getIntensityAt(
    _position: Position2D | Position3D,
    _scene: SceneGeometry
  ): number {
    // For accurate results, run a full trace
    return 0;
  }

  /**
   * Check if sensor requirements are met
   */
  isSensorActivated(sensorState: SensorState): boolean {
    // Check intensity requirement
    if (sensorState.requiredIntensity !== undefined) {
      if (sensorState.receivedIntensity < sensorState.requiredIntensity) {
        return false;
      }
    }

    // Check polarization requirement
    if (sensorState.requiredPolarization !== null) {
      if (sensorState.receivedPolarization === null) {
        return false;
      }
      // Allow ±10° tolerance
      const angleDiff = Math.abs(sensorState.receivedPolarization - sensorState.requiredPolarization);
      const normalizedDiff = angleDiff > 90 ? 180 - angleDiff : angleDiff;
      if (normalizedDiff > 10) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate scene configuration
   */
  validateScene(scene: SceneGeometry): string[] {
    const errors: string[] = [];

    const hasEmitter = scene.components.some(c => c.type === 'emitter');
    const hasSensor = scene.components.some(c => c.type === 'sensor');

    if (hasEmitter && !hasSensor) {
      errors.push('Scene has emitters but no sensors');
    }

    return errors;
  }

  /**
   * Reset internal state
   */
  reset(): void {
    this.rayCounter = 0;
    this.activeRays.clear();
  }

  /**
   * Create a LightRay from a LightSource
   */
  private createRayFromSource(source: LightSource): LightRay {
    return {
      id: `ray-${this.rayCounter++}`,
      position: source.position,
      direction: source.direction,
      state: source.state,
      path: [source.position],
      iterations: 0,
    };
  }

  /**
   * Create a SensorState from a sensor component
   */
  private createSensorState(
    component: OpticalComponent,
    lightState: UnifiedLightState
  ): SensorState {
    return {
      id: component.id,
      activated: false,
      receivedIntensity: Math.round(lightState.intensity * 100),
      receivedPolarization: lightState.isUnpolarized() ? null : lightState.orientationAngle,
      requiredIntensity: component.requiredIntensity || 50,
      requiredPolarization: component.requiredPolarization || null,
      matchQuality: 0,
    };
  }

  /**
   * Generate a unique key for a position
   */
  private positionKey(position: Position2D | Position3D): string {
    if ('z' in position) {
      return `${position.x},${position.y},${position.z}`;
    }
    return `${position.x},${position.y}`;
  }
}
