import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { OpticalComponent } from '@/components/shared/optical/types'
import type { AdvancedLevel } from '@/core/game2d/advancedLevels'

// Level definition interface
export interface Level2D {
  id: number
  name: string
  nameZh: string
  description: string
  descriptionZh: string
  hint?: string
  hintZh?: string
  components: OpticalComponent[]
  gridSize: { width: number; height: number }
  openEnded?: boolean
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

// Game mode type
export type GameMode = 'classic' | 'advanced'

// Combined level type for store
export type AnyLevel = Level2D | AdvancedLevel

interface Game2DState {
  // Level state
  currentLevelIndex: number
  currentAdvancedIndex: number
  showAdvancedLevels: boolean
  currentLevel: AnyLevel | null

  // Component state
  componentStates: Record<string, Partial<OpticalComponent>>
  selectedComponent: string | null

  // Game state
  isComplete: boolean
  showHint: boolean
  isAnimating: boolean
  showPolarization: boolean

  // Physics mode
  gameMode: GameMode

  // UI state
  showMobileInfo: boolean

  // Undo/Redo history
  history: Record<string, Partial<OpticalComponent>>[]
  historyIndex: number

  // Actions
  setLevelIndex: (index: number) => void
  setAdvancedIndex: (index: number) => void
  toggleAdvancedLevels: (show: boolean) => void
  setCurrentLevel: (level: AnyLevel) => void

  setComponentStates: (states: Record<string, Partial<OpticalComponent>>) => void
  setSelectedComponent: (id: string | null) => void

  setComplete: (complete: boolean) => void
  toggleHint: () => void
  toggleAnimating: () => void
  togglePolarization: () => void

  setGameMode: (mode: GameMode) => void
  toggleMobileInfo: () => void

  // Component manipulation
  rotateComponent: (
    id: string,
    delta: number,
    property: 'angle' | 'polarizationAngle' | 'rotationAmount',
    component: OpticalComponent
  ) => void

  // Undo/Redo
  undo: () => void
  redo: () => void
  pushToHistory: (states: Record<string, Partial<OpticalComponent>>) => void
  resetLevel: () => void

  // Computed
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useGame2DStore = create<Game2DState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentLevelIndex: 0,
    currentAdvancedIndex: 0,
    showAdvancedLevels: false,
    currentLevel: null,

    componentStates: {},
    selectedComponent: null,

    isComplete: false,
    showHint: false,
    isAnimating: true,
    showPolarization: true,

    gameMode: 'advanced',

    showMobileInfo: false,

    history: [],
    historyIndex: -1,

    // Actions
    setLevelIndex: (index) => set({ currentLevelIndex: index }),

    setAdvancedIndex: (index) => set({ currentAdvancedIndex: index }),

    toggleAdvancedLevels: (show) => set({ showAdvancedLevels: show }),

    setCurrentLevel: (level) => set({ currentLevel: level }),

    setComponentStates: (states) => set({ componentStates: states }),

    setSelectedComponent: (id) => set({ selectedComponent: id }),

    setComplete: (complete) => set({ isComplete: complete }),

    toggleHint: () => set((state) => ({ showHint: !state.showHint })),

    toggleAnimating: () => set((state) => ({ isAnimating: !state.isAnimating })),

    togglePolarization: () => set((state) => ({ showPolarization: !state.showPolarization })),

    setGameMode: (mode) => set({ gameMode: mode }),

    toggleMobileInfo: () => set((state) => ({ showMobileInfo: !state.showMobileInfo })),

    rotateComponent: (id, delta, property, component) => {
      const { componentStates, history, historyIndex } = get()
      const current = componentStates[id] || {}

      let newValue: number

      if (property === 'rotationAmount') {
        // Toggle between 45 and 90
        newValue = (current.rotationAmount ?? component.rotationAmount ?? 45) === 45 ? 90 : 45
      } else {
        const currentVal = current[property] ?? (component[property as keyof OpticalComponent] as number) ?? 0
        newValue = (currentVal + delta + 360) % 360
        if (property === 'polarizationAngle') {
          newValue = newValue % 180
        }
      }

      const newStates = {
        ...componentStates,
        [id]: {
          ...current,
          [property]: newValue,
        },
      }

      // Push to history
      const truncatedHistory = history.slice(0, historyIndex + 1)
      const newHistory = [...truncatedHistory, newStates]

      set({
        componentStates: newStates,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isComplete: false,
      })
    },

    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        set({
          historyIndex: newIndex,
          componentStates: history[newIndex],
          isComplete: false,
        })
      }
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        set({
          historyIndex: newIndex,
          componentStates: history[newIndex],
          isComplete: false,
        })
      }
    },

    pushToHistory: (states) => {
      const { history, historyIndex } = get()
      const truncatedHistory = history.slice(0, historyIndex + 1)
      const newHistory = [...truncatedHistory, states]
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      })
    },

    resetLevel: () => {
      const { currentLevel, history, historyIndex } = get()
      if (!currentLevel) return

      const initialStates: Record<string, Partial<OpticalComponent>> = {}
      currentLevel.components.forEach((c) => {
        initialStates[c.id] = {
          angle: c.angle,
          polarizationAngle: c.polarizationAngle,
          rotationAmount: c.rotationAmount,
          phaseShift: c.phaseShift,
        }
      })

      const truncatedHistory = history.slice(0, historyIndex + 1)
      const newHistory = [...truncatedHistory, initialStates]

      set({
        componentStates: initialStates,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isComplete: false,
      })
    },

    canUndo: () => {
      const { historyIndex } = get()
      return historyIndex > 0
    },

    canRedo: () => {
      const { history, historyIndex } = get()
      return historyIndex < history.length - 1
    },
  }))
)
