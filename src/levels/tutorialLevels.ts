/**
 * Tutorial levels for 3D voxel puzzle game
 * 3D体素益智游戏教程关卡
 */

import { LevelData } from './types'

/**
 * Tutorial levels - 5 levels teaching basic polarization mechanics
 * 教程关卡 - 5个关卡教授基础偏振机制
 */
export const TUTORIAL_LEVELS: LevelData[] = [
  {
    name: "第一课：光与门",
    description: "将光源对准感应器以打开门。尝试旋转光源(R)改变偏振角度。",
    hints: [
      '光源正在发射偏振光。观察光线是否到达感应器。',
      '按 R 旋转光源改变偏振角度，使感应器激活。',
      '按 V 切换偏振视角，可以看到光的偏振颜色。'
    ],
    blocks: [
      // 地面已由initializeGround创建

      // 光源
      { x: 0, y: 1, z: -3, type: 'emitter', state: { facing: 'south', polarizationAngle: 0 } },

      // 感应器（需要0度偏振）
      { x: 0, y: 1, z: 3, type: 'sensor', state: { polarizationAngle: 0, requiredIntensity: 8 } },

      // 装饰墙
      { x: -2, y: 1, z: 0, type: 'solid' },
      { x: 2, y: 1, z: 0, type: 'solid' },
    ],
    goal: { sensorPositions: [{ x: 0, y: 1, z: 3 }] }
  },
  {
    name: "第二课：偏振片",
    description: "光需要通过偏振片。调整偏振片角度让足够的光通过。",
    hints: [
      '光需要通过偏振片。按 R 调整偏振片角度。',
      '马吕斯定律：光强 = 原强度 × cos²(角度差)'
    ],
    blocks: [
      { x: 0, y: 1, z: -3, type: 'emitter', state: { facing: 'south', polarizationAngle: 0 } },
      { x: 0, y: 1, z: 0, type: 'polarizer', state: { polarizationAngle: 45 } },
      { x: 0, y: 1, z: 3, type: 'sensor', state: { polarizationAngle: 45, requiredIntensity: 6 } },
    ]
  },
  {
    name: "第三课：马吕斯定律",
    description: "两个偏振片串联。90度差会完全阻挡光线！",
    hints: [
      '两个偏振片串联时，90°角度差会完全阻挡光线！',
      '尝试找到让光通过的角度组合。'
    ],
    blocks: [
      { x: 0, y: 1, z: -4, type: 'emitter', state: { facing: 'south', polarizationAngle: 0 } },
      { x: 0, y: 1, z: -1, type: 'polarizer', state: { polarizationAngle: 0 } },
      { x: 0, y: 1, z: 2, type: 'polarizer', state: { polarizationAngle: 90 } },
      { x: 0, y: 1, z: 5, type: 'sensor', state: { polarizationAngle: 90, requiredIntensity: 1 } },
    ]
  },
  {
    name: "第四课：波片旋转",
    description: "波片可以旋转光的偏振方向而不损失强度。",
    hints: [
      '波片可以旋转光的偏振方向而不损失强度。',
      '按 R 改变波片的旋转量（45°或90°）'
    ],
    blocks: [
      { x: 0, y: 1, z: -3, type: 'emitter', state: { facing: 'south', polarizationAngle: 0 } },
      { x: 0, y: 1, z: 0, type: 'rotator', state: { rotationAmount: 90 } },
      { x: 0, y: 1, z: 3, type: 'sensor', state: { polarizationAngle: 90, requiredIntensity: 12 } },
    ]
  },
  {
    name: "第五课：方解石分光",
    description: "方解石将光分裂成两束垂直偏振的光。",
    hints: [
      '方解石（双折射晶体）将光分裂成两束垂直偏振的光。',
      '尝试激活两个不同偏振角度的感应器。'
    ],
    blocks: [
      { x: 0, y: 1, z: -3, type: 'emitter', state: { facing: 'south', polarizationAngle: 45 } },
      { x: 0, y: 1, z: 0, type: 'splitter', state: { facing: 'east' } },
      { x: 0, y: 1, z: 3, type: 'sensor', state: { polarizationAngle: 0, requiredIntensity: 5 } },
      { x: 3, y: 1, z: 0, type: 'sensor', state: { polarizationAngle: 90, requiredIntensity: 5 } },
    ]
  }
];
