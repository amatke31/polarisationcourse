/**
 * LightPhysics 测试文件
 * 验证光物理引擎的核心功能
 */

import { LightPhysics } from './LightPhysics';
import { LightPacket, BlockState, Direction, PolarizationAngle, Phase } from './types';

/**
 * 测试马吕斯定律计算
 */
describe('LightPhysics - Malus Law', () => {
  test('applyMalusLaw should calculate correct intensity', () => {
    // 测试案例：0度偏振光通过0度偏振片
    expect(LightPhysics.applyMalusLaw(15, 0, 0)).toBe(15);
    
    // 测试案例：0度偏振光通过90度偏振片
    expect(LightPhysics.applyMalusLaw(15, 0, 90)).toBe(0);
    
    // 测试案例：45度偏振光通过0度偏振片
    const result = LightPhysics.applyMalusLaw(15, 45, 0);
    expect(result).toBeGreaterThanOrEqual(7);
    expect(result).toBeLessThanOrEqual(8);
    
    // 测试案例：强度为0时返回0
    expect(LightPhysics.applyMalusLaw(0, 0, 0)).toBe(0);
  });
});

/**
 * 测试偏振分束器功能
 */
describe('LightPhysics - Polarizing Beam Splitting', () => {
  test('splitLight should correctly split polarized light', () => {
    const input: LightPacket = {
      direction: 'north',
      intensity: 15,
      polarization: 45,
      phase: 1
    };
    
    const [pLight, sLight] = LightPhysics.splitLight(input, 'east');
    
    // 验证p光（水平偏振）
    expect(pLight.polarization).toBe(0);
    expect(pLight.direction).toBe('north');
    expect(pLight.intensity).toBeGreaterThan(0);
    
    // 验证s光（垂直偏振）
    expect(sLight.polarization).toBe(90);
    expect(sLight.direction).not.toBe('north');
    expect(sLight.intensity).toBeGreaterThan(0);
    
    // 验证总强度守恒（允许舍入误差）
    expect(pLight.intensity + sLight.intensity).toBeGreaterThanOrEqual(14);
    expect(pLight.intensity + sLight.intensity).toBeLessThanOrEqual(15);
  });
});

/**
 * 测试干涉计算
 */
describe('LightPhysics - Interference', () => {
  test('calculateInterference should handle constructive interference', () => {
    const lights: LightPacket[] = [
      {
        direction: 'north',
        intensity: 8,
        polarization: 0,
        phase: 1
      },
      {
        direction: 'north',
        intensity: 7,
        polarization: 0,
        phase: 1
      }
    ];
    
    const result = LightPhysics.calculateInterference(lights);
    expect(result.length).toBe(1);
    expect(result[0].intensity).toBe(15);
  });
  
  test('calculateInterference should handle destructive interference', () => {
    const lights: LightPacket[] = [
      {
        direction: 'north',
        intensity: 8,
        polarization: 0,
        phase: 1
      },
      {
        direction: 'north',
        intensity: 5,
        polarization: 0,
        phase: -1
      }
    ];
    
    const result = LightPhysics.calculateInterference(lights);
    expect(result.length).toBe(1);
    expect(result[0].intensity).toBe(3);
  });
  
  test('calculateInterference should group by direction and polarization', () => {
    const lights: LightPacket[] = [
      {
        direction: 'north',
        intensity: 5,
        polarization: 0,
        phase: 1
      },
      {
        direction: 'north',
        intensity: 5,
        polarization: 90,
        phase: 1
      }
    ];
    
    const result = LightPhysics.calculateInterference(lights);
    expect(result.length).toBe(2);
  });
});

/**
 * 测试连续相位干涉计算
 */
describe('LightPhysics - Continuous Interference', () => {
  test('calculateContinuousInterference should calculate correct intensity', () => {
    // 测试同相干涉（建设性）
    expect(LightPhysics.calculateContinuousInterference(0.5, 0.5, 0)).toBeCloseTo(2, 1);
    
    // 测试反相干涉（破坏性）
    expect(LightPhysics.calculateContinuousInterference(0.5, 0.5, Math.PI)).toBeCloseTo(0, 1);
    
    // 测试部分干涉
    const result = LightPhysics.calculateContinuousInterference(0.5, 0.5, Math.PI / 2);
    expect(result).toBeCloseTo(1, 1);
  });
});

/**
 * 测试光学元件处理
 */
describe('LightPhysics - Optical Elements', () => {
  test('processPolarizerBlock should correctly filter light', () => {
    const input: LightPacket = {
      direction: 'north',
      intensity: 15,
      polarization: 0,
      phase: 1
    };
    
    const blockState: BlockState = {
      type: 'polarizer',
      rotation: 0,
      polarizationAngle: 90,
      rotationAmount: 45,
      activated: false,
      requiredIntensity: 8,
      facing: 'north',
      absorptionRate: 0.5,
      phaseShift: 0,
      linkedPortalId: null,
      splitRatio: 0.5,
      focalLength: 2,
      dispersive: false
    };
    
    // 0度偏振光通过90度偏振片应该被完全吸收
    const result = LightPhysics.processPolarizerBlock(input, blockState);
    expect(result).toBeNull();
  });
  
  test('processRotatorBlock should correctly rotate polarization', () => {
    const input: LightPacket = {
      direction: 'north',
      intensity: 15,
      polarization: 0,
      phase: 1
    };
    
    const blockState: BlockState = {
      type: 'rotator',
      rotation: 0,
      polarizationAngle: 0,
      rotationAmount: 45,
      activated: false,
      requiredIntensity: 8,
      facing: 'north',
      absorptionRate: 0.5,
      phaseShift: 0,
      linkedPortalId: null,
      splitRatio: 0.5,
      focalLength: 2,
      dispersive: false
    };
    
    const result = LightPhysics.processRotatorBlock(input, blockState);
    expect(result).not.toBeNull();
    expect(result?.polarization).toBe(45);
    expect(result?.intensity).toBe(15);
  });
  
  test('processMirrorBlock should correctly reflect light', () => {
    // 测试案例：光从south向north移动，击中面向south的镜子
    const input: LightPacket = {
      direction: 'north',
      intensity: 15,
      polarization: 0,
      phase: 1
    };
    
    const blockState: BlockState = {
      type: 'mirror',
      rotation: 0,
      polarizationAngle: 0,
      rotationAmount: 0,
      activated: false,
      requiredIntensity: 8,
      facing: 'south', // 镜子面向south，接收从north来的光
      absorptionRate: 0.5,
      phaseShift: 0,
      linkedPortalId: null,
      splitRatio: 0.5,
      focalLength: 2,
      dispersive: false
    };
    
    const result = LightPhysics.processMirrorBlock(input, blockState);
    expect(result).not.toBeNull();
    expect(result?.direction).toBe('south');
    expect(result?.intensity).toBe(15);
  });
});

/**
 * 测试辅助函数
 */
describe('LightPhysics - Helper Functions', () => {
  test('isOrthogonal should correctly identify orthogonal polarizations', () => {
    expect(LightPhysics.isOrthogonal(0, 90)).toBe(true);
    expect(LightPhysics.isOrthogonal(45, 135)).toBe(true);
    expect(LightPhysics.isOrthogonal(0, 0)).toBe(false);
    expect(LightPhysics.isOrthogonal(0, 45)).toBe(false);
  });
  
  test('getIntensityBrightness should calculate correct brightness', () => {
    expect(LightPhysics.getIntensityBrightness(15)).toBe(1);
    expect(LightPhysics.getIntensityBrightness(7)).toBeCloseTo(7/15, 2);
    expect(LightPhysics.getIntensityBrightness(0)).toBe(0);
  });
  
  test('getActualFacing should return correct direction', () => {
    expect(LightPhysics.getActualFacing('north', 0)).toBe('north');
    expect(LightPhysics.getActualFacing('north', 90)).toBe('east');
    expect(LightPhysics.getActualFacing('north', 180)).toBe('south');
    expect(LightPhysics.getActualFacing('north', 270)).toBe('west');
    expect(LightPhysics.getActualFacing('up', 90)).toBe('up');
  });
});

/**
 * 测试边界情况
 */
describe('LightPhysics - Edge Cases', () => {
  test('should handle null or invalid inputs gracefully', () => {
    // 测试干涉计算处理空数组
    expect(LightPhysics.calculateInterference([])).toEqual([]);
    
    // 测试干涉计算处理单个光包
    const singleLight: LightPacket = {
      direction: 'north',
      intensity: 15,
      polarization: 0,
      phase: 1
    };
    expect(LightPhysics.calculateInterference([singleLight])).toEqual([singleLight]);
  });
});
