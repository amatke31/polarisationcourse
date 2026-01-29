/**
 * ScalarMode - Legacy game physics mode implementation
 *
 * This mode wraps the existing LightPhysics.ts functionality to provide
 * backward compatibility with the original game mechanics.
 *
 * Characteristics:
 * - Discrete intensity (0-15)
 * - 4 discrete polarization angles (0, 45, 90, 135)
 * - Binary phase (+1 or -1)
 * - Simplified component behaviors (quarterWave = 45° rotator, etc.)
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

// Import legacy LightPhysics for backward compatibility
import { LightPhysics } from '../../LightPhysics';

/**
 * Legacy scalar mode implementation
 */
export class ScalarMode implements IPhysicsMode {
  readonly name = PhysicsMode.LEGACY_SCALAR;

  private rayCounter = 0;
  private activeRays = new Map<string, LightRay>();

  /**
   * Process light through a single component using legacy LightPhysics
   */
  processLight(
    light: UnifiedLightState,
    component: OpticalComponent
  ): UnifiedLightState[] {
    // Convert UnifiedLightState to legacy LightPacket
    const packet = light.toLightPacket();

    // Create a mock BlockState from the component
    const blockState = this.componentToBlockState(component);

    let outputPackets;
    switch (component.type) {
      case 'polarizer':
        outputPackets = LightPhysics.processPolarizerBlock(packet, blockState);
        break;

      case 'rotator':
        outputPackets = LightPhysics.processRotatorBlock(packet, blockState);
        break;

      case 'splitter':
        outputPackets = LightPhysics.processSplitterBlock(packet, blockState);
        break;

      case 'mirror':
        outputPackets = LightPhysics.processMirrorBlock(packet, blockState);
        break;

      case 'quarterWavePlate':
        // In legacy mode, quarterWave acts as a 45° rotator (NOT true QWP)
        outputPackets = LightPhysics.processRotatorBlock(packet, {
          ...blockState,
          rotationAmount: 45,
        });
        break;

      case 'halfWavePlate':
        // In legacy mode, halfWave acts as a 90° rotator (NOT true HWP)
        outputPackets = LightPhysics.processRotatorBlock(packet, {
          ...blockState,
          rotationAmount: 90,
        });
        break;

      case 'sensor':
      case 'emitter':
      default:
        // These don't modify light
        outputPackets = [packet];
        break;
    }

    // Convert output packets back to UnifiedLightState
    if (!outputPackets) {
      return [];
    }

    if (Array.isArray(outputPackets)) {
      return outputPackets.map(p => UnifiedLightState.fromLightPacket(p));
    } else {
      return [UnifiedLightState.fromLightPacket(outputPackets)];
    }
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
        continue;
      }

      // Check for component at this position
      const component = scene.getComponentAt(ray.position);
      if (component) {
        // Process through component
        const outputStates = this.processLight(ray.state, component);

        if (outputStates.length === 0) {
          // Light was absorbed
          ray.state = UnifiedLightState.zero();
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
    position: Position2D | Position3D,
    scene: SceneGeometry
  ): number {
    const component = scene.getComponentAt(position);
    if (!component) {
      return 0;
    }

    // This is a simplified implementation
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
      // Allow ±15° tolerance
      const angleDiff = Math.abs(sensorState.receivedPolarization - sensorState.requiredPolarization);
      if (angleDiff > 15 && angleDiff < 165) {
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
   * Convert OpticalComponent to legacy BlockState format
   */
  private componentToBlockState(component: OpticalComponent): any {
    return {
      type: component.type,
      rotation: component.angle || 0,
      polarizationAngle: component.polarizationAngle || 0,
      rotationAmount: component.rotationAmount || 45,
      facing: component.direction || 'down',
      x: component.x,
      y: component.y,
    };
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
