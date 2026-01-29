/**
 * JonesLinearMode - Jones calculus with linear polarization only
 *
 * This mode uses the WaveOptics.ts Jones calculus implementation for
 * accurate wave optics simulation with continuous polarization angles.
 *
 * Characteristics:
 * - Continuous intensity (0-1, scales to 0-100)
 * - Continuous polarization angles (0-180°)
 * - Continuous phase (0-2π)
 * - Linear polarization only (no circular/elliptical)
 * - Accurate Malus's Law application
 * - True quarter-wave and half-wave plate behavior
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
import { JonesMatrix, JonesVector, Complex as WaveComplex } from '../../WaveOptics';

/**
 * Jones Linear mode implementation
 */
export class JonesLinearMode implements IPhysicsMode {
  readonly name = PhysicsMode.JONES_LINEAR;

  private rayCounter = 0;
  private activeRays = new Map<string, LightRay>();

  /**
   * Process light through a single component using Jones calculus
   */
  processLight(
    light: UnifiedLightState,
    component: OpticalComponent
  ): UnifiedLightState[] {
    // Convert to Jones vector format
    const jones = light.toJonesVector();
    const jonesVector = new JonesVector(
      new WaveComplex(jones.Ex, jones.phaseX),
      new WaveComplex(jones.Ey, jones.phaseY)
    );

    let outputJones;
    switch (component.type) {
      case 'polarizer': {
        // Linear polarizer at specific angle
        const angle = (component.polarizationAngle || 0) * Math.PI / 180;
        outputJones = JonesMatrix.linearPolarizer(angle).apply(jonesVector);
        break;
      }

      case 'rotator': {
        // Optical rotator (rotates polarization without intensity loss)
        const angle = (component.rotationAmount || 45) * Math.PI / 180;
        outputJones = JonesMatrix.rotator(angle).apply(jonesVector);
        break;
      }

      case 'quarterWavePlate': {
        // True quarter-wave plate (converts linear to circular if at 45°)
        const angle = (component.angle || 0) * Math.PI / 180;
        outputJones = JonesMatrix.quarterWavePlate(angle).apply(jonesVector);
        break;
      }

      case 'halfWavePlate': {
        // True half-wave plate (flips polarization across fast axis)
        const angle = (component.angle || 0) * Math.PI / 180;
        outputJones = JonesMatrix.halfWavePlate(angle).apply(jonesVector);
        break;
      }

      case 'mirror': {
        // Mirror reflects light (in Jones mode, just changes direction, not polarization)
        outputJones = jonesVector;
        break;
      }

      case 'splitter': {
        // Polarizing beam splitter - separates orthogonal polarizations
        // This returns two output states
        return this.processSplitter(light);
      }

      case 'sensor':
      case 'emitter':
      default:
        // These don't modify light
        outputJones = jonesVector;
        break;
    }

    if (!outputJones) {
      return [];
    }

    // Convert back to UnifiedLightState
    return [UnifiedLightState.fromJonesVector({
      Ex: outputJones.Ex.real,
      Ey: outputJones.Ey.real,
      phaseX: outputJones.Ex.phase,
      phaseY: outputJones.Ey.phase,
    })];
  }

  /**
   * Process polarizing beam splitter (creates two output beams)
   */
  private processSplitter(
    light: UnifiedLightState
  ): UnifiedLightState[] {
    // PBS separates horizontal (p-polarized) and vertical (s-polarized) components
    const jones = light.toJonesVector();

    // Horizontal component (transmitted)
    const horizontalLight = UnifiedLightState.fromJonesVector({
      Ex: jones.Ex,
      Ey: 0,
      phaseX: jones.phaseX,
      phaseY: 0,
    });

    // Vertical component (reflected at 90°)
    const verticalLight = UnifiedLightState.fromJonesVector({
      Ex: 0,
      Ey: jones.Ey,
      phaseX: 0,
      phaseY: jones.phaseY,
    });

    const results: UnifiedLightState[] = [];

    // Only include components with significant intensity
    if (horizontalLight.intensity > 0.001) {
      results.push(horizontalLight);
    }
    if (verticalLight.intensity > 0.001) {
      results.push(verticalLight);
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
    const maxIterations = 100; // Prevent infinite loops

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
      // Allow ±10° tolerance for Jones mode (more precise)
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

    // Check for emitters without sensors
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
      activated: false, // Will be updated after trace
      receivedIntensity: Math.round(lightState.intensity * 100),
      receivedPolarization: lightState.isUnpolarized() ? null : lightState.orientationAngle,
      requiredIntensity: component.requiredIntensity || 50,
      requiredPolarization: component.requiredPolarization || null,
      matchQuality: 0, // Will be calculated
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
