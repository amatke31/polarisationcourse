/**
 * Game2DAdapter - Adapter for 2D game integration
 *
 * Converts between 2D game's component format and UnifiedPhysicsEngine's format.
 * Enables the 2D puzzle game to use the unified physics engine.
 */
import type { OpticalComponent } from '@/components/shared/optical/types';
import type {
  SceneGeometry,
  Position2D,
  LightSource,
} from '../modes/IPhysicsMode';
import { UnifiedLightState } from '../UnifiedLightState';
import type { TraceResult } from '../modes/IPhysicsMode';
import type { Direction } from '../modes/IPhysicsMode';

/**
 * 2D beam segment for rendering
 */
export interface BeamSegment {
  /** Starting position (percentage 0-100) */
  x1: number;
  y1: number;
  /** Ending position (percentage 0-100) */
  x2: number;
  y2: number;
  /** Light intensity (0-1) */
  intensity: number;
  /** Polarization angle (0-180) */
  polarization: number;
  /** Phase (±1 for scalar, 0-2π for wave) */
  phase: number;
  /** Beam path index (for rendering order) */
  pathIndex: number;
}

/**
 * Adapter for 2D game ↔ UnifiedPhysicsEngine integration
 */
export class Game2DAdapter {
  /**
   * Convert 2D components to SceneGeometry format
   */
  static fromComponents(components: OpticalComponent[]): SceneGeometry {
    // Calculate bounds
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const c of components) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y);
    }

    const bounds = {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    };

    return {
      type: '2d',
      bounds,
      components,
      getComponentAt: (position: Position2D) => {
        // Find component at position (with tolerance)
        const tolerance = 3; // 3% tolerance for positioning
        return components.find(c => {
          return Math.abs(c.x - position.x) < tolerance &&
                 Math.abs(c.y - position.y) < tolerance;
        }) || null;
      },
      isValidPosition: (position: Position2D) => {
        return position.x >= 0 && position.x <= 100 &&
               position.y >= 0 && position.y <= 100;
      },
      getNextPosition: (position: Position2D, direction: Direction) => {
        const step = 5; // 5% step size
        switch (direction) {
          case 'north': return { x: position.x, y: position.y - step };
          case 'south': return { x: position.x, y: position.y + step };
          case 'east':  return { x: position.x + step, y: position.y };
          case 'west':  return { x: position.x - step, y: position.y };
          default: return position;
        }
      },
    };
  }

  /**
   * Create LightSources from 2D emitters
   */
  static createLightSources(components: OpticalComponent[]): LightSource[] {
    const sources: LightSource[] = [];

    for (const component of components) {
      if (component.type === 'emitter') {
        const lightState = UnifiedLightState.linearPolarized(
          1.0, // Full intensity
          component.polarizationAngle || 0
        );

        // Convert Direction2D to Direction
        const dir2D = component.direction || 'down';
        const direction: Direction = dir2D === 'up' ? 'north' :
                                    dir2D === 'down' ? 'south' :
                                    dir2D === 'left' ? 'west' : 'east';

        sources.push({
          id: component.id,
          position: { x: component.x, y: component.y },
          direction,
          state: lightState,
          type: 'continuous',
        });
      }
    }

    return sources;
  }

  /**
   * Convert TraceResult to BeamSegments for 2D rendering
   */
  static toBeamSegments(traceResult: TraceResult): BeamSegment[] {
    const segments: BeamSegment[] = [];

    for (const ray of traceResult.rays) {
      if (ray.path.length < 2) {
        continue;
      }

      // Create beam segments from ray path
      for (let i = 0; i < ray.path.length - 1; i++) {
        const start = ray.path[i] as Position2D;
        const end = ray.path[i + 1] as Position2D;

        segments.push({
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y,
          intensity: ray.state.intensity,
          polarization: ray.state.orientationAngle,
          phase: ray.state.isLinearlyPolarized() ? 1 : -1,
          pathIndex: i,
        });
      }
    }

    return segments;
  }

  /**
   * Convert TraceResult to SensorState array
   */
  static toSensorStates(traceResult: TraceResult): Array<{
    id: string;
    activated: boolean;
    receivedIntensity: number;
    receivedPolarization: number | null;
  }> {
    return traceResult.sensorStates.map(sensor => ({
      id: sensor.id,
      activated: sensor.activated,
      receivedIntensity: sensor.receivedIntensity,
      receivedPolarization: sensor.receivedPolarization,
    }));
  }

  /**
   * Convert 2D component state to unified format
   */
  static normalizeComponent(
    component: OpticalComponent,
    componentStates: Record<string, Partial<OpticalComponent>>
  ): OpticalComponent {
    const state = componentStates[component.id] || {};
    return {
      ...component,
      angle: state.angle ?? component.angle,
      polarizationAngle: state.polarizationAngle ?? component.polarizationAngle,
      rotationAmount: state.rotationAmount ?? component.rotationAmount,
    };
  }

  /**
   * Get component ID at position
   */
  static getComponentAtPosition(
    x: number,
    y: number,
    components: OpticalComponent[]
  ): string | null {
    const tolerance = 5; // 5% tolerance
    const found = components.find(c => {
      return Math.abs(c.x - x) < tolerance && Math.abs(c.y - y) < tolerance;
    });

    return found?.id || null;
  }

  /**
   * Calculate light path through components
   * (for real-time preview without full trace)
   */
  static calculateLightPath(
    components: OpticalComponent[],
    componentStates: Record<string, Partial<OpticalComponent>>
  ): Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    intensity: number;
    polarization: number;
  }> {
    // Simplified path calculation for preview
    const paths: Array<any> = [];
    const emitters = components.filter(c => c.type === 'emitter');

    for (const emitter of emitters) {
      const state = Game2DAdapter.normalizeComponent(emitter, componentStates);
      let x = state.x;
      let y = state.y;
      const dir2D = state.direction || 'down';
      let intensity = 1.0;
      let polarization = state.polarizationAngle || 0;

      // Trace forward (simplified, max 10 steps)
      for (let step = 0; step < 10; step++) {
        // Calculate next position
        const stepSize = 10;
        let nextX = x, nextY = y;
        switch (dir2D) {
          case 'up': nextY -= stepSize; break;
          case 'down': nextY += stepSize; break;
          case 'right':  nextX += stepSize; break;
          case 'left':  nextX -= stepSize; break;
        }

        // Check for component collision
        const hitComponent = Game2DAdapter.getComponentAtPosition(
          nextX, nextY, components
        );

        if (hitComponent) {
          // Add path segment
          paths.push({
            x1: x,
            y1: y,
            x2: nextX,
            y2: nextY,
            intensity,
            polarization,
          });

          // Stop at sensor
          const component = components.find(c => c.id === hitComponent);
          if (component?.type === 'sensor') {
            break;
          }

          // Update position
          x = nextX;
          y = nextY;
        } else {
          // No component, extend path
          paths.push({
            x1: x,
            y1: y,
            x2: nextX,
            y2: nextY,
            intensity,
            polarization,
          });
          x = nextX;
          y = nextY;
        }

        // Stop if out of bounds
        if (x < 0 || x > 100 || y < 0 || y > 100) {
          break;
        }
      }
    }

    return paths;
  }

  /**
   * Check if all sensors are activated
   */
  static allSensorsActivated(sensorStates: ReturnType<typeof Game2DAdapter.toSensorStates>): boolean {
    return sensorStates.length > 0 && sensorStates.every(s => s.activated);
  }

  /**
   * Get game mode from components
   */
  static getGameMode(components: OpticalComponent[]): 'classic' | 'advanced' {
    // Check if components include advanced features
    const hasAdvanced = components.some(c => {
      return c.type === 'quarterWavePlate' ||
             c.type === 'halfWavePlate' ||
             c.type === 'beamCombiner';
    });

    return hasAdvanced ? 'advanced' : 'classic';
  }

  /**
   * Validate level configuration
   */
  static validateLevel(components: OpticalComponent[]): string[] {
    const errors: string[] = [];

    // Check for emitters
    const hasEmitter = components.some(c => c.type === 'emitter');
    if (!hasEmitter) {
      errors.push('Level must have at least one emitter');
    }

    // Check for sensors
    const hasSensor = components.some(c => c.type === 'sensor');
    if (!hasSensor) {
      errors.push('Level must have at least one sensor');
    }

    // Check for valid positions
    for (const c of components) {
      if (c.x < 0 || c.x > 100 || c.y < 0 || c.y > 100) {
        errors.push(`Component ${c.id} is out of bounds`);
      }
    }

    return errors;
  }
}
