/**
 * Level-related types and interfaces
 * 游戏关卡相关类型定义
 */

import { BlockType, BlockState, BlockPosition } from '@/core/types'

/**
 * Level data interface
 * 关卡数据接口
 */
export interface LevelData {
  /** Level name 关卡名称 */
  name: string

  /** Level description 关卡描述 */
  description: string

  /** Blocks in this level 关卡中的方块 */
  blocks: Array<{
    x: number
    y: number
    z: number
    type: BlockType
    state?: Partial<BlockState>
  }>

  /** Victory condition 胜利条件 */
  goal?: {
    /** Sensor positions that must be activated 需要激活的感应器位置 */
    sensorPositions: BlockPosition[]
  }

  /** Tutorial hints for this level 关卡的教程提示 */
  hints?: string[]
}
