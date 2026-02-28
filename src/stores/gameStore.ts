import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  BlockType,
  BlockState,
  BlockPosition,
  PolarizationAngle,
  createDefaultBlockState
} from '@/core/types'
import { World } from '@/core/World'
import { TUTORIAL_LEVELS, LevelData } from '@/levels'
import { logger } from '@/lib/logger'

export type CameraMode = 'first-person' | 'isometric' | 'top-down'
export type VisionMode = 'normal' | 'polarized'

interface GameState {
  // World instance
  world: World | null

  // Level state
  currentLevelIndex: number
  currentLevel: LevelData | null
  isLevelComplete: boolean

  // Player state
  selectedBlockType: BlockType
  selectedBlockRotation: number
  selectedPolarizationAngle: PolarizationAngle

  // View state
  visionMode: VisionMode
  cameraMode: CameraMode
  showGrid: boolean
  showHelp: boolean

  // Tutorial hints
  tutorialHints: string[]
  currentHintIndex: number
  showHint: boolean

  // Actions
  initWorld: (size?: number) => void
  loadLevel: (index: number) => void
  nextLevel: () => void
  resetLevel: () => void

  setSelectedBlockType: (type: BlockType) => void
  rotateSelectedBlock: () => void

  placeBlock: (position: BlockPosition) => void
  removeBlock: (position: BlockPosition) => void
  rotateBlockAt: (position: BlockPosition) => void

  toggleVisionMode: () => void
  setCameraMode: (mode: CameraMode) => void
  toggleGrid: () => void
  toggleHelp: () => void

  showNextHint: () => void
  hideHint: () => void

  checkLevelCompletion: () => boolean
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    world: null,
    currentLevelIndex: 0,
    currentLevel: null,
    isLevelComplete: false,

    selectedBlockType: 'emitter',
    selectedBlockRotation: 0,
    selectedPolarizationAngle: 0,

    visionMode: 'normal',
    cameraMode: 'first-person',
    showGrid: true,
    showHelp: false,

    tutorialHints: [],
    currentHintIndex: 0,
    showHint: false,

    // Actions
    initWorld: (size = 32) => {
      const world = new World(size)
      set({ world })
    },

    loadLevel: (index: number) => {
      const { world } = get()
      if (!world) {
        logger.error('Cannot load level: World not initialized. Call initWorld() first.')
        return
      }

      // Validate index is a valid number
      if (typeof index !== 'number' || isNaN(index) || !isFinite(index)) {
        logger.error(`Invalid level index: ${index}. Index must be a valid number.`)
        return
      }

      // Validate index is within bounds
      if (index < 0 || index >= TUTORIAL_LEVELS.length) {
        logger.error(`Level index ${index} out of bounds. Valid range: 0-${TUTORIAL_LEVELS.length - 1}.`)
        return
      }

      const level = TUTORIAL_LEVELS[index]
      if (!level) {
        logger.error(`Level at index ${index} is undefined.`)
        return
      }

      // Validate level structure
      if (!level.blocks || !Array.isArray(level.blocks)) {
        logger.error(`Level ${index} has invalid structure: missing or invalid blocks array.`)
        return
      }

      world.loadLevel(level)

      set({
        currentLevelIndex: index,
        currentLevel: level,
        isLevelComplete: false,
        tutorialHints: level.hints || [],
        currentHintIndex: 0,
        showHint: true
      })
    },

    nextLevel: () => {
      const { currentLevelIndex, loadLevel } = get()
      if (currentLevelIndex < TUTORIAL_LEVELS.length - 1) {
        loadLevel(currentLevelIndex + 1)
      }
    },

    resetLevel: () => {
      const { currentLevelIndex, loadLevel } = get()
      loadLevel(currentLevelIndex)
    },

    setSelectedBlockType: (type: BlockType) => {
      set({ selectedBlockType: type, selectedBlockRotation: 0 })
    },

    rotateSelectedBlock: () => {
      set(state => ({
        selectedBlockRotation: (state.selectedBlockRotation + 90) % 360
      }))
    },

    placeBlock: (position: BlockPosition) => {
      const { world, selectedBlockType, selectedBlockRotation, selectedPolarizationAngle } = get()
      if (!world) return

      const blockState = createDefaultBlockState(selectedBlockType)
      blockState.rotation = selectedBlockRotation
      blockState.polarizationAngle = selectedPolarizationAngle

      world.setBlock(position.x, position.y, position.z, blockState)
      get().checkLevelCompletion()
    },

    removeBlock: (position: BlockPosition) => {
      const { world } = get()
      if (!world) return

      // Don't remove ground blocks
      if (position.y === 0) return

      world.setBlock(position.x, position.y, position.z, createDefaultBlockState('air'))
      get().checkLevelCompletion()
    },

    rotateBlockAt: (position: BlockPosition) => {
      const { world } = get()
      if (!world) {
        logger.error('Cannot rotate block: World not initialized.')
        return
      }

      // Validate position
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
        logger.error('Invalid block position for rotation:', position)
        return
      }

      const block = world.getBlock(position.x, position.y, position.z)
      if (!block || block.type === 'solid' || block.type === 'air') return

      // Create a copy and rotate
      const newState: BlockState = { ...block }

      // For polarizers and emitters, rotate polarization angle
      if (block.type === 'polarizer' || block.type === 'emitter' || block.type === 'sensor') {
        // Validate current polarization angle before rotation
        const validAngles: PolarizationAngle[] = [0, 45, 90, 135]
        const currentAngle = validAngles.includes(block.polarizationAngle as PolarizationAngle)
          ? block.polarizationAngle
          : 0

        const newAngle = (currentAngle + 45) % 180
        // Ensure new angle is a valid PolarizationAngle
        newState.polarizationAngle = validAngles.includes(newAngle as PolarizationAngle)
          ? newAngle as PolarizationAngle
          : 0
      }
      // For rotators, toggle rotation amount
      else if (block.type === 'rotator') {
        newState.rotationAmount = block.rotationAmount === 45 ? 90 : 45
      }
      // For mirrors and splitters, rotate facing
      else {
        const currentRotation = typeof block.rotation === 'number' && !isNaN(block.rotation)
          ? block.rotation
          : 0
        newState.rotation = (currentRotation + 90) % 360
      }

      world.setBlock(position.x, position.y, position.z, newState)
      get().checkLevelCompletion()
    },

    toggleVisionMode: () => {
      set(state => ({
        visionMode: state.visionMode === 'normal' ? 'polarized' : 'normal'
      }))
    },

    setCameraMode: (mode: CameraMode) => {
      set({ cameraMode: mode })
    },

    toggleGrid: () => {
      set(state => ({ showGrid: !state.showGrid }))
    },

    toggleHelp: () => {
      set(state => ({ showHelp: !state.showHelp }))
    },

    showNextHint: () => {
      const { tutorialHints, currentHintIndex } = get()
      if (currentHintIndex < tutorialHints.length - 1) {
        set({ currentHintIndex: currentHintIndex + 1, showHint: true })
      } else {
        set({ showHint: false })
      }
    },

    hideHint: () => {
      set({ showHint: false })
    },

    checkLevelCompletion: () => {
      const { world, currentLevel } = get()
      if (!world || !currentLevel) {
        return false
      }

      // Check if all required sensors are activated
      const goal = currentLevel.goal
      if (!goal || !goal.sensorPositions || !Array.isArray(goal.sensorPositions)) {
        return false
      }

      // If no sensor positions are defined, level cannot be completed
      if (goal.sensorPositions.length === 0) {
        logger.warn('Level has no sensor positions defined in goal.')
        return false
      }

      const allActivated = goal.sensorPositions.every(pos => {
        // Validate position object
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
          logger.error('Invalid sensor position in level goal:', pos)
          return false
        }

        const block = world.getBlock(pos.x, pos.y, pos.z)
        if (!block) {
          logger.error(`No block found at sensor position (${pos.x}, ${pos.y}, ${pos.z}).`)
          return false
        }

        if (block.type !== 'sensor') {
          logger.error(`Block at (${pos.x}, ${pos.y}, ${pos.z}) is not a sensor. Found: ${block.type}`)
          return false
        }

        return block.activated === true
      })

      if (allActivated) {
        set({ isLevelComplete: true })
      }

      return allActivated
    }
  }))
)

// Subscribe to world changes
export const subscribeToWorldChanges = (callback: () => void) => {
  const { world } = useGameStore.getState()
  if (world) {
    world.addListener(() => {
      callback()
    })
  }
}
