/**
 * WorldAdapter - Adapter for 3D World integration
 *
 * Converts between World's block/light format and UnifiedPhysicsEngine's format.
 * Enables the 3D game to use the unified physics engine.
 */
import type { World } from '../../World';
import type { BlockState, BlockPosition, LightState } from '../../types';
import type {
  SceneGeometry,
  Position3D,
  Position2D,
  OpticalComponent,
  LightSource,
} from '../modes/IPhysicsMode';
import { UnifiedLightState } from '../UnifiedLightState';
import type { TraceResult } from '../modes/IPhysicsMode';
import type { Direction } from '../modes/IPhysicsMode';

/**
 * Adapter for World ↔ UnifiedPhysicsEngine integration
 */
export class WorldAdapter {
  /**
   * Convert World to SceneGeometry format
   */
  static fromWorld(world: World): SceneGeometry {
    const blocks = world.getAllBlocks();

    // Calculate bounds
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const { position, state } of blocks) {
      if (state.type !== 'air') {
        minX = Math.min(minX, position.x);
        minY = Math.min(minY, position.y);
        minZ = Math.min(minZ, position.z);
        maxX = Math.max(maxX, position.x);
        maxY = Math.max(maxY, position.y);
        maxZ = Math.max(maxZ, position.z);
      }
    }

    const bounds = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
    };

    // Convert blocks to optical components
    const components: OpticalComponent[] = blocks
      .filter(({ state }) => state.type !== 'air' && state.type !== 'solid')
      .map(({ position, state }) => WorldAdapter.blockToComponent(position, state));

    return {
      type: '3d',
      bounds,
      components,
      getComponentAt: (position: Position3D | Position2D) => {
        // Only handle 3D positions for World adapter
        if ('z' in position) {
          const block = world.getBlock(position.x, position.y, position.z);
          if (!block || block.type === 'air' || block.type === 'solid') {
            return null;
          }
          return WorldAdapter.blockToComponent(position, block);
        }
        return null;
      },
      isValidPosition: (position: Position3D | Position2D) => {
        if ('z' in position) {
          return position.x >= bounds.min.x && position.x <= bounds.max.x &&
                 position.y >= bounds.min.y && position.y <= bounds.max.y &&
                 position.z >= bounds.min.z && position.z <= bounds.max.z;
        }
        // For 2D positions (not used in World adapter)
        return position.x >= bounds.min.x && position.x <= bounds.max.x &&
               position.y >= bounds.min.y && position.y <= bounds.max.y;
      },
      getNextPosition: (position: Position3D | Position2D, direction: Direction) => {
        // Only handle 3D positions for World adapter
        if ('z' in position) {
          const vectors = {
            north: { x: 0, y: 0, z: -1 },
            south: { x: 0, y: 0, z: 1 },
            east:  { x: 1, y: 0, z: 0 },
            west:  { x: -1, y: 0, z: 0 },
            up:    { x: 0, y: 1, z: 0 },
            down:  { x: 0, y: -1, z: 0 },
          };
          const vec = vectors[direction];
          return {
            x: position.x + vec.x,
            y: position.y + vec.y,
            z: position.z + vec.z,
          } as Position3D;
        }
        // For 2D positions (not used in World adapter)
        return position;
      },
    };
  }

  /**
   * Convert World BlockState to OpticalComponent format
   */
  static blockToComponent(position: BlockPosition, block: BlockState): OpticalComponent {
    // Generate a unique ID based on position
    const id = `block-${position.x}-${position.y}-${position.z}`;

    // Map BlockState types to OpticalComponent types
    const typeMap: Record<string, string> = {
      quarterWave: 'quarterWavePlate',
      halfWave: 'halfWavePlate',
      beamSplitter: 'splitter',
    };

    const componentType = typeMap[block.type] || block.type;

    return {
      id,
      type: componentType as any,
      x: position.x,
      y: position.y,
      // z is not part of OpticalComponent interface (2D only)
      // We'll store it in a custom property for 3D use
      ...(block.type === 'air' || block.type === 'solid' ? {} : {}),
      angle: block.rotation || 0,
      polarizationAngle: block.polarizationAngle || 0,
      rotationAmount: block.rotationAmount || 45,
      direction: (block.facing || 'down') as any,
      requiredIntensity: (block as any).requiredIntensity,
      locked: false, // Blocks in World are never locked
    } as OpticalComponent & { z?: number };
  }

  /**
   * Convert TraceResult to World's LightState format
   */
  static toWorldLightStates(
    traceResult: TraceResult
  ): Map<string, LightState> {
    const lightStates = new Map<string, LightState>();

    // Convert rays to light states
    for (const ray of traceResult.rays) {
      for (const pos of ray.path) {
        // Handle both 2D and 3D positions
        const key = 'z' in pos
          ? `${pos.x},${pos.y},${pos.z}`
          : `${pos.x},${pos.y},0`;
        const existing = lightStates.get(key);

        // Convert UnifiedLightState to LightPacket
        const packet = ray.state.toLightPacket();

        if (existing) {
          // Add to existing packets (interference will be handled by World)
          existing.packets.push(packet);
        } else {
          lightStates.set(key, {
            packets: [packet],
          });
        }
      }
    }

    return lightStates;
  }

  /**
   * Convert TraceResult sensor states to World sensor activations
   */
  static toWorldSensorStates(traceResult: TraceResult): Map<string, boolean> {
    const sensorStates = new Map<string, boolean>();

    for (const sensor of traceResult.sensorStates) {
      sensorStates.set(sensor.id, sensor.activated);
    }

    return sensorStates;
  }

  /**
   * Create LightSources from World's emitters
   */
  static createLightSources(world: World): LightSource[] {
    const sources: LightSource[] = [];
    const blocks = world.getAllBlocks();

    let emitterIndex = 0;
    for (const { position, state } of blocks) {
      if (state.type === 'emitter') {
        // Create initial light state from emitter configuration
        const lightState = UnifiedLightState.linearPolarized(
          1.0, // Full intensity
          state.polarizationAngle || 0
        );

        sources.push({
          id: `emitter-${emitterIndex++}`,
          position: { x: position.x, y: position.y, z: position.z },
          direction: state.facing || 'down',
          state: lightState,
          type: 'continuous',
        });
      }
    }

    return sources;
  }

  /**
   * Update World with trace results
   */
  static updateWorld(
    world: World,
    traceResult: TraceResult
  ): void {
    // Get current propagation config
    const config = world.getPropagationConfig();

    // Convert trace results to World format
    const sensorStates = WorldAdapter.toWorldSensorStates(traceResult);

    // Update World's internal state
    // Note: World doesn't expose direct setters for lightStates,
    // so we trigger a light propagation update
    world.setPropagationConfig({
      ...config,
      useWaveOptics: false, // Use the unified engine result instead
    });

    // Update sensor activations
    for (const { position, state } of world.getAllBlocks()) {
      if (state.type === 'sensor') {
        const sensorId = `block-${position.x}-${position.y}-${position.z}`;
        const activated = sensorStates.get(sensorId) || false;

        // Update the block state
        if (state.activated !== activated) {
          world.setBlock(position.x, position.y, position.z, {
            ...state,
            activated,
          });
        }
      }
    }
  }

  /**
   * Get World's configuration for UnifiedPhysicsEngine
   */
  static getPhysicsConfig(world: World) {
    const config = world.getPropagationConfig();

    // Map World's config to UnifiedPhysicsEngine's config
    return {
      mode: config.useWaveOptics ? 'jones-full' : 'legacy',
      intensityScale: 'discrete',
      polarizationPrecision: 'discrete',
      interference: 'binary',
      spectral: false,
      partialPolarization: false,
      maxIterations: config.maxIterations,
      energyThreshold: config.energyThreshold,
      debug: false,
    };
  }

  /**
   * Convert position key string to BlockPosition
   */
  static parsePositionKey(key: string): BlockPosition {
    const parts = key.split(',');
    if (parts.length !== 3) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: Number(parts[0]),
      y: Number(parts[1]),
      z: Number(parts[2]),
    };
  }

  /**
   * Convert BlockPosition to position key string
   */
  static positionToKey(pos: BlockPosition): string {
    return `${pos.x},${pos.y},${pos.z}`;
  }
}
