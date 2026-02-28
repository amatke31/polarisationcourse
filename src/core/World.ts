/**
 * PolarCraft - 体素世界管理
 * 管理方块和光传播的元胞自动机
 *
 * Refactored to use:
 * - Iterative BFS propagation (replaces recursive DFS) 提高性能和防止堆栈溢出
 * - Jones Calculus wave optics (WaveLight) 替代传统标量光模型
 * - Energy threshold-based termination 能量阈值终止
 */

import {
  BlockState,
  BlockPosition,
  LightPacket,
  LightState,
  Direction,
  DIRECTION_VECTORS,
  createDefaultBlockState,
  PolarizationAngle
} from './types';
import { LightPhysics, WaveLight } from './LightPhysics';
import { logger } from '@/lib/logger';
import { LevelData } from '@/levels/types';

// 方块键值生成
function posKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

// 从键值解析位置
function parseKey(key: string): BlockPosition {
  const parts = key.split(',');
  if (parts.length !== 3) {
    logger.error(`Invalid position key format: "${key}". Expected "x,y,z" format.`);
    return { x: 0, y: 0, z: 0 };
  }

  const [xStr, yStr, zStr] = parts;
  const x = Number(xStr);
  const y = Number(yStr);
  const z = Number(zStr);

  if (isNaN(x) || isNaN(y) || isNaN(z)) {
    logger.error(`Invalid position key values: "${key}". Coordinates must be valid numbers.`);
    return { x: 0, y: 0, z: 0 };
  }

  return { x, y, z };
}

/**
 * Propagation queue item for BFS light propagation 生成传播队列项用于BFS光传播
 */
interface PropagationItem {
  position: BlockPosition;
  light: WaveLight;
}

/**
 * Wave light state at a position (for coherent superposition) 波动光在位置的状态（用于相干叠加）
 */
interface WaveLightState {
  lights: WaveLight[];
}

/**
 * Configuration for light propagation 光传播配置
 */
interface PropagationConfig {
  /** Use wave optics (Jones Calculus) instead of legacy scalar model 使用波动光学（琼斯计算法）替代传统标量光模型 */
  useWaveOptics: boolean;
  /** Maximum iterations for BFS (prevents infinite loops) 最大迭代次数（防止无限循环） */
  maxIterations: number;
  /** Energy threshold for stopping propagation 能量阈值停止传播 */
  energyThreshold: number;
}

const DEFAULT_PROPAGATION_CONFIG: PropagationConfig = {
  useWaveOptics: true,
  maxIterations: 10000,
  energyThreshold: 0.01
};

/**
 * 体素世界类
 */
export class World {
  private blocks: Map<string, BlockState> = new Map();
  private lightStates: Map<string, LightState> = new Map();
  private waveLightStates: Map<string, WaveLightState> = new Map();
  private worldSize: number;
  private listeners: Set<(type: string, data: unknown) => void> = new Set();
  private propagationConfig: PropagationConfig = { ...DEFAULT_PROPAGATION_CONFIG };
  private emitterCounter: number = 0;

  constructor(size: number = 32) {
    this.worldSize = size;
    this.initializeGround();
  }

  /**
   * Configure propagation behavior 配置传播行为
   */
  setPropagationConfig(config: Partial<PropagationConfig>): void {
    this.propagationConfig = { ...this.propagationConfig, ...config };
  }

  /**
   * Get current propagation configuration 获取当前传播配置
   */
  getPropagationConfig(): PropagationConfig {
    return { ...this.propagationConfig };
  }

  /**
   * 初始化地面
   */
  private initializeGround(): void {
    // 创建一个平坦的地面
    for (let x = -this.worldSize / 2; x < this.worldSize / 2; x++) {
      for (let z = -this.worldSize / 2; z < this.worldSize / 2; z++) {
        this.setBlock(x, 0, z, createDefaultBlockState('solid'));
      }
    }
  }

  /**
   * 添加事件监听器
   */
  addListener(callback: (type: string, data: unknown) => void): void {
    this.listeners.add(callback);
  }

  /**
   * 移除事件监听器
   */
  removeListener(callback: (type: string, data: unknown) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * 触发事件
   */
  private emit(type: string, data: unknown): void {
    for (const listener of this.listeners) {
      listener(type, data);
    }
  }

  /**
   * 获取方块
   */
  getBlock(x: number, y: number, z: number): BlockState | null {
    return this.blocks.get(posKey(x, y, z)) || null;
  }

  /**
   * 设置方块
   */
  setBlock(x: number, y: number, z: number, state: BlockState): void {
    const key = posKey(x, y, z);

    if (state.type === 'air') {
      this.blocks.delete(key);
    } else {
      this.blocks.set(key, state);
    }

    this.emit('blockChanged', { x, y, z, state });

    // 重新计算光传播
    this.updateLightPropagation();
  }

  /**
   * 删除方块
   */
  removeBlock(x: number, y: number, z: number): void {
    this.setBlock(x, y, z, createDefaultBlockState('air'));
  }

  /**
   * 获取所有方块
   */
  getAllBlocks(): Array<{ position: BlockPosition; state: BlockState }> {
    const result: Array<{ position: BlockPosition; state: BlockState }> = [];
    for (const [key, state] of this.blocks) {
      result.push({ position: parseKey(key), state });
    }
    return result;
  }

  /**
   * 获取光状态
   */
  getLightState(x: number, y: number, z: number): LightState | null {
    return this.lightStates.get(posKey(x, y, z)) || null;
  }

  /**
   * 获取所有光状态
   */
  getAllLightStates(): Array<{ position: BlockPosition; state: LightState }> {
    const result: Array<{ position: BlockPosition; state: LightState }> = [];
    for (const [key, state] of this.lightStates) {
      if (state.packets.length > 0) {
        result.push({ position: parseKey(key), state });
      }
    }
    return result;
  }

  /**
   * 更新光传播 - 核心的元胞自动机
   * Refactored to use iterative BFS with wave optics
   */
  updateLightPropagation(): void {
    // 清空当前光状态
    this.lightStates.clear();
    this.waveLightStates.clear();

    if (this.propagationConfig.useWaveOptics) {
      this.propagateLightBFS();
    } else {
      this.propagateLightLegacy();
    }

    // 更新所有感应器状态
    this.updateSensors();

    this.emit('lightUpdated', this.getAllLightStates());
  }

  /**
   * BFS-based light propagation using wave optics (Jones Calculus)
   * 基于BFS的波动光学传播算法
   */
  private propagateLightBFS(): void {
    // Collect all emitters
    const emitters: Array<{ position: BlockPosition; state: BlockState }> = [];
    for (const [key, state] of this.blocks) {
      if (state.type === 'emitter') {
        emitters.push({ position: parseKey(key), state });
      }
    }

    // Initialize the propagation queue with all emitter outputs
    const queue: PropagationItem[] = [];

    for (const emitter of emitters) {
      const sourceId = `emitter_${this.emitterCounter++}`;
      const initialLight = LightPhysics.createEmitterWave(emitter.state, sourceId);
      queue.push({
        position: emitter.position,
        light: initialLight
      });
    }

    // Track visited positions per source to handle loops
    // Key: `${sourceId}_${posKey}_${direction}` to allow different paths
    const visited = new Set<string>();

    let iterations = 0;
    const { maxIterations, energyThreshold } = this.propagationConfig;

    // BFS propagation loop
    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;

      const item = queue.shift()!;
      const { position, light } = item;

      // Check energy threshold
      if (light.jones.intensity < energyThreshold) {
        continue;
      }

      // Calculate next position
      const dir = DIRECTION_VECTORS[light.direction];
      if (!dir) {
        logger.error(`Invalid light direction: "${light.direction}". Skipping.`);
        continue;
      }

      const nextPos: BlockPosition = {
        x: position.x + dir.x,
        y: position.y + dir.y,
        z: position.z + dir.z
      };

      // Check world bounds
      if (Math.abs(nextPos.x) > this.worldSize ||
          Math.abs(nextPos.y) > this.worldSize ||
          Math.abs(nextPos.z) > this.worldSize) {
        continue;
      }

      // Create visit key to prevent infinite loops
      const visitKey = `${light.sourceId}_${posKey(nextPos.x, nextPos.y, nextPos.z)}_${light.direction}`;

      // Skip if we've already processed this exact configuration
      if (visited.has(visitKey)) {
        continue;
      }
      visited.add(visitKey);

      // Advance the light (update path length and phase)
      const advancedLight = LightPhysics.advanceWaveLight(light);

      // Record light at this position
      this.addWaveLightToPosition(nextPos, advancedLight);

      // Get block at next position
      const block = this.getBlock(nextPos.x, nextPos.y, nextPos.z);

      // Process block and get output lights
      const outputLights = this.processBlockWave(nextPos, advancedLight, block);

      // Add output lights to queue for further propagation
      for (const outputLight of outputLights) {
        if (LightPhysics.isAboveThreshold(outputLight)) {
          queue.push({
            position: nextPos,
            light: outputLight
          });
        }
      }
    }

    if (iterations >= maxIterations) {
      logger.warn(`Light propagation reached maximum iterations (${maxIterations}). Consider optimizing the optical setup.`);
    }

    // Calculate coherent interference at each position and convert to legacy format
    this.finalizeWaveLightStates();
  }

  /**
   * Process a block using wave optics and return output lights
   * 使用波动光学处理方块并返回输出光
   */
  private processBlockWave(position: BlockPosition, light: WaveLight, block: BlockState | null): WaveLight[] {
    // Air or no block - continue propagating
    if (!block || block.type === 'air') {
      return [light];
    }

    switch (block.type) {
      case 'solid':
      case 'emitter':
        // Solid blocks and emitters block light
        return [];

      case 'polarizer': {
        const result = LightPhysics.processPolarizerWave(light, block);
        return result ? [result] : [];
      }

      case 'rotator': {
        const result = LightPhysics.processRotatorWave(light, block);
        return [result];
      }

      case 'splitter': {
        return LightPhysics.processSplitterWave(light, block);
      }

      case 'mirror': {
        const result = LightPhysics.processMirrorWave(light, block);
        return result ? [result] : [];
      }

      case 'sensor':
        // Sensors don't block light
        return [light];

      case 'absorber': {
        const result = LightPhysics.processAbsorberWave(light, block);
        return result ? [result] : [];
      }

      case 'phaseShifter': {
        const result = LightPhysics.processPhaseShifterWave(light, block);
        return [result];
      }

      case 'beamSplitter': {
        return LightPhysics.processBeamSplitterWave(light, block);
      }

      case 'quarterWave': {
        const result = LightPhysics.processQuarterWaveWave(light, block);
        return [result];
      }

      case 'halfWave': {
        const result = LightPhysics.processHalfWaveWave(light, block);
        return [result];
      }

      case 'prism': {
        const result = LightPhysics.processPrismWave(light, block);
        return [result];
      }

      case 'lens': {
        return LightPhysics.processLensWave(light, block);
      }

      case 'portal': {
        return this.handlePortalBlockWave(position, light, block);
      }

      default:
        // Unknown block type - pass through
        return [light];
    }
  }

  /**
   * Handle portal block with wave optics
   */
  private handlePortalBlockWave(_position: BlockPosition, light: WaveLight, block: BlockState): WaveLight[] {
    const linkedId = block.linkedPortalId;

    if (!linkedId) {
      // Unlinked portal - light passes through
      return [light];
    }

    // Find linked portal
    const linkedPortal = this.findPortalById(linkedId);

    if (linkedPortal) {
      // Teleport light to linked portal position
      // The light will continue from there in the next iteration
      return [{
        ...light,
        // Note: we return the light to be queued from the portal position
        // The caller should handle the position change
      }];
    }

    return [light];
  }

  /**
   * Add wave light to position for later interference calculation
   */
  private addWaveLightToPosition(position: BlockPosition, light: WaveLight): void {
    const key = posKey(position.x, position.y, position.z);

    if (!this.waveLightStates.has(key)) {
      this.waveLightStates.set(key, { lights: [] });
    }

    this.waveLightStates.get(key)!.lights.push(light);
  }

  /**
   * Calculate coherent superposition at each position and convert to legacy LightState
   * 计算每个位置的相干叠加并转换为传统光状态
   */
  private finalizeWaveLightStates(): void {
    for (const [key, waveState] of this.waveLightStates) {
      // Calculate coherent interference
      const superposedLights = LightPhysics.calculateInterferenceWave(waveState.lights);

      // Convert to legacy format
      const packets: LightPacket[] = [];
      for (const light of superposedLights) {
        if (LightPhysics.isAboveThreshold(light)) {
          packets.push(LightPhysics.toLightPacket(light));
        }
      }

      if (packets.length > 0) {
        // Also apply legacy interference for consistency
        const finalPackets = LightPhysics.calculateInterference(packets);
        this.lightStates.set(key, { packets: finalPackets });
      }
    }
  }

  /**
   * Legacy recursive propagation (for backward compatibility)
   * 传统递归传播（用于向后兼容）
   */
  private propagateLightLegacy(): void {
    // Collect all emitters
    const emitters: Array<{ position: BlockPosition; state: BlockState }> = [];
    for (const [key, state] of this.blocks) {
      if (state.type === 'emitter') {
        emitters.push({ position: parseKey(key), state });
      }
    }

    // Propagate from each emitter
    for (const emitter of emitters) {
      this.propagateLightFromEmitterLegacy(emitter.position, emitter.state);
    }
  }

  /**
   * 从光源传播光线 (Legacy)
   */
  private propagateLightFromEmitterLegacy(position: BlockPosition, state: BlockState): void {
    // 确定光源发射方向
    const emitDirection = LightPhysics.getActualFacing(state.facing, state.rotation);

    // 创建初始光包
    const initialLight: LightPacket = {
      direction: emitDirection,
      intensity: 15, // 最大强度
      polarization: state.polarizationAngle,
      phase: 1
    };

    // 开始传播
    this.propagateLightLegacyRecursive(position, initialLight, 0);
  }

  /**
   * 递归传播光线 (Legacy implementation)
   */
  private propagateLightLegacyRecursive(fromPosition: BlockPosition, light: LightPacket, depth: number): void {
    // 防止无限递归
    if (depth > 100 || light.intensity <= 0) {
      return;
    }

    // 计算下一个位置
    const dir = DIRECTION_VECTORS[light.direction];
    if (!dir) {
      logger.error(`Invalid light direction: "${light.direction}". Light propagation stopped.`);
      return;
    }

    const nextPos: BlockPosition = {
      x: fromPosition.x + dir.x,
      y: fromPosition.y + dir.y,
      z: fromPosition.z + dir.z
    };

    // 检查是否超出世界边界
    if (Math.abs(nextPos.x) > this.worldSize ||
        Math.abs(nextPos.y) > this.worldSize ||
        Math.abs(nextPos.z) > this.worldSize) {
      return;
    }

    // 在当前位置记录光
    this.addLightToPosition(nextPos, light);

    // 获取下一个位置的方块
    const block = this.getBlock(nextPos.x, nextPos.y, nextPos.z);

    if (!block) {
      // 空气 - 光继续传播
      this.propagateLightLegacyRecursive(nextPos, light, depth + 1);
      return;
    }

    // 处理不同类型的方块
    switch (block.type) {
      case 'air':
        this.propagateLightLegacyRecursive(nextPos, light, depth + 1);
        break;

      case 'solid':
        // 实体方块阻挡光线
        break;

      case 'polarizer':
        this.handlePolarizerBlock(nextPos, light, block, depth);
        break;

      case 'rotator':
        this.handleRotatorBlock(nextPos, light, block, depth);
        break;

      case 'splitter':
        this.handleSplitterBlock(nextPos, light, block, depth);
        break;

      case 'mirror':
        this.handleMirrorBlock(nextPos, light, block, depth);
        break;

      case 'sensor':
        // 感应器不阻挡光，但会记录
        this.propagateLightLegacyRecursive(nextPos, light, depth + 1);
        break;

      case 'emitter':
        // 光源方块阻挡光线（避免干扰）
        break;

      // ============== 高级方块类型 ==============

      case 'absorber':
        this.handleAbsorberBlock(nextPos, light, block, depth);
        break;

      case 'phaseShifter':
        this.handlePhaseShifterBlock(nextPos, light, block, depth);
        break;

      case 'beamSplitter':
        this.handleBeamSplitterBlock(nextPos, light, block, depth);
        break;

      case 'quarterWave':
        this.handleQuarterWaveBlock(nextPos, light, block, depth);
        break;

      case 'halfWave':
        this.handleHalfWaveBlock(nextPos, light, block, depth);
        break;

      case 'prism':
        this.handlePrismBlock(nextPos, light, block, depth);
        break;

      case 'lens':
        this.handleLensBlock(nextPos, light, block, depth);
        break;

      case 'portal':
        this.handlePortalBlock(nextPos, light, block, depth);
        break;
    }
  }

  /**
   * 处理偏振片 (Legacy)
   */
  private handlePolarizerBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processPolarizerBlock(light, block);

    if (result && result.intensity > 0) {
      this.propagateLightLegacyRecursive(position, result, depth + 1);
    }
  }

  /**
   * 处理波片 (Legacy)
   */
  private handleRotatorBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processRotatorBlock(light, block);
    this.propagateLightLegacyRecursive(position, result, depth + 1);
  }

  /**
   * 处理方解石（双折射）(Legacy)
   */
  private handleSplitterBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const results = LightPhysics.processSplitterBlock(light, block);

    for (const resultLight of results) {
      if (resultLight.intensity > 0) {
        this.propagateLightLegacyRecursive(position, resultLight, depth + 1);
      }
    }
  }

  /**
   * 处理反射镜 (Legacy)
   */
  private handleMirrorBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processMirrorBlock(light, block);

    if (result && result.intensity > 0) {
      this.propagateLightLegacyRecursive(position, result, depth + 1);
    }
  }

  // ============== 高级方块处理方法 (Legacy) ==============

  /**
   * 处理吸收器 (Legacy)
   */
  private handleAbsorberBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processAbsorberBlock(light, block);

    if (result && result.intensity > 0) {
      this.propagateLightLegacyRecursive(position, result, depth + 1);
    }
  }

  /**
   * 处理相位调制器 (Legacy)
   */
  private handlePhaseShifterBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processPhaseShifterBlock(light, block);
    this.propagateLightLegacyRecursive(position, result, depth + 1);
  }

  /**
   * 处理分束器 (Legacy)
   */
  private handleBeamSplitterBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const results = LightPhysics.processBeamSplitterBlock(light, block);

    for (const resultLight of results) {
      if (resultLight.intensity > 0) {
        this.propagateLightLegacyRecursive(position, resultLight, depth + 1);
      }
    }
  }

  /**
   * 处理四分之一波片 (Legacy)
   */
  private handleQuarterWaveBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processQuarterWaveBlock(light, block);
    this.propagateLightLegacyRecursive(position, result, depth + 1);
  }

  /**
   * 处理二分之一波片 (Legacy)
   */
  private handleHalfWaveBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processHalfWaveBlock(light, block);
    this.propagateLightLegacyRecursive(position, result, depth + 1);
  }

  /**
   * 处理棱镜 (Legacy)
   */
  private handlePrismBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const result = LightPhysics.processPrismBlock(light, block);
    this.propagateLightLegacyRecursive(position, result, depth + 1);
  }

  /**
   * 处理透镜 (Legacy)
   */
  private handleLensBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const results = LightPhysics.processLensBlock(light, block);

    for (const resultLight of results) {
      if (resultLight.intensity > 0) {
        this.propagateLightLegacyRecursive(position, resultLight, depth + 1);
      }
    }
  }

  /**
   * 处理传送门 (Legacy)
   * 将光传送到链接的传送门位置
   */
  private handlePortalBlock(
    position: BlockPosition,
    light: LightPacket,
    block: BlockState,
    depth: number
  ): void {
    const linkedId = block.linkedPortalId;

    if (!linkedId) {
      // 未链接的传送门，光线直接穿过
      this.propagateLightLegacyRecursive(position, light, depth + 1);
      return;
    }

    // 查找链接的传送门
    const linkedPortal = this.findPortalById(linkedId);

    if (linkedPortal) {
      // 从链接传送门的位置继续传播光线
      this.propagateLightLegacyRecursive(linkedPortal.position, light, depth + 1);
    }
  }

  /**
   * 根据ID查找传送门
   */
  private findPortalById(portalId: string): { position: BlockPosition; state: BlockState } | null {
    for (const [key, state] of this.blocks) {
      if (state.type === 'portal' && state.linkedPortalId === portalId) {
        // 避免找到同一个传送门（需要找配对的那个）
        const position = parseKey(key);
        return { position, state };
      }
    }
    return null;
  }

  /**
   * 在位置添加光
   */
  private addLightToPosition(position: BlockPosition, light: LightPacket): void {
    const key = posKey(position.x, position.y, position.z);

    if (!this.lightStates.has(key)) {
      this.lightStates.set(key, { packets: [] });
    }

    const state = this.lightStates.get(key)!;
    state.packets.push({ ...light });

    // 计算干涉
    state.packets = LightPhysics.calculateInterference(state.packets);
  }

  /**
   * 更新所有感应器状态
   */
  private updateSensors(): void {
    for (const [key, state] of this.blocks) {
      if (state.type === 'sensor') {
        const pos = parseKey(key);
        const lightState = this.lightStates.get(key);

        let totalIntensity = 0;
        let hasRequiredPolarization = false;

        if (lightState) {
          for (const packet of lightState.packets) {
            totalIntensity += packet.intensity;
            // 检查是否有正确偏振角的光
            if (packet.polarization === state.polarizationAngle) {
              hasRequiredPolarization = true;
            }
          }
        }

        // 更新激活状态
        const wasActivated = state.activated;
        state.activated = totalIntensity >= state.requiredIntensity && hasRequiredPolarization;

        if (wasActivated !== state.activated) {
          this.emit('sensorChanged', { position: pos, activated: state.activated });
        }
      }
    }
  }

  /**
   * 旋转方块
   */
  rotateBlock(x: number, y: number, z: number): void {
    const block = this.getBlock(x, y, z);
    if (!block) return;

    // 对于偏振片和光源，旋转偏振角度
    if (block.type === 'polarizer' || block.type === 'emitter') {
      const angles: PolarizationAngle[] = [0, 45, 90, 135];
      const currentIndex = angles.indexOf(block.polarizationAngle);
      block.polarizationAngle = angles[(currentIndex + 1) % 4];
    }
    // 对于波片，切换旋转量
    else if (block.type === 'rotator') {
      block.rotationAmount = block.rotationAmount === 45 ? 90 : 45;
    }
    // 对于其他方块，旋转朝向
    else {
      block.rotation = (block.rotation + 90) % 360;
      const directions: Direction[] = ['north', 'east', 'south', 'west'];
      const currentIndex = directions.indexOf(block.facing);
      block.facing = directions[(currentIndex + 1) % 4];
    }

    this.emit('blockChanged', { x, y, z, state: block });
    this.updateLightPropagation();
  }

  /**
   * 获取位置的总光强度
   */
  getTotalLightIntensity(x: number, y: number, z: number): number {
    const state = this.lightStates.get(posKey(x, y, z));
    if (!state) return 0;

    let total = 0;
    for (const packet of state.packets) {
      total += packet.intensity;
    }
    return Math.min(total, 15);
  }

  /**
   * 清空世界
   */
  clear(): void {
    this.blocks.clear();
    this.lightStates.clear();
    this.initializeGround();
    this.emit('worldCleared', null);
  }

  /**
   * 加载预设关卡
   */
  loadLevel(level: LevelData): void {
    this.clear();

    for (const block of level.blocks) {
      const state = createDefaultBlockState(block.type);
      Object.assign(state, block.state || {});
      this.setBlock(block.x, block.y, block.z, state);
    }

    this.updateLightPropagation();
  }
}
