import { useEffect, useCallback } from 'react'
import { useGame2DStore } from '@/stores/game2d/game2DStore'
import { useLightTracer } from '@/hooks/useLightTracer'
import { useJonesLightTracerLegacy } from '@/hooks/useJonesLightTracer'
import type { OpticalComponent } from '@/components/shared/optical/types'
import type { Level2D } from '@/stores/game2d/game2DStore'
import type { AdvancedLevel } from '@/core/game2d/advancedLevels'
import { LEVELS } from '@/data/levels/game2dLevels'

export function useGame2DLogic(
  currentLevel: Level2D | AdvancedLevel | null,
  ADVANCED_LEVELS: any[]
) {
  const {
    componentStates,
    gameMode,
    showAdvancedLevels,
    isComplete,
    setComplete,
    setSelectedComponent,
    rotateComponent,
    resetLevel,
    undo,
    redo,
    currentAdvancedIndex,
    currentLevelIndex,
    setLevelIndex,
    setAdvancedIndex,
    history,
    historyIndex,
    showHint,
  } = useGame2DStore()

  // Initialize component states when level changes
  useEffect(() => {
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

    // Use store actions to set state
    useGame2DStore.getState().setComponentStates(initialStates)
    useGame2DStore.getState().setComplete(false)
    useGame2DStore.getState().setSelectedComponent(null)

    // Reset hint state
    if (showHint) {
      useGame2DStore.getState().toggleHint()
    }

    // Reset history
    useGame2DStore.setState({
      history: [initialStates],
      historyIndex: 0,
    })
  }, [currentLevel, showAdvancedLevels, currentAdvancedIndex, currentLevelIndex, showHint])

  // Use appropriate light tracer based on game mode
  const classicResult = useLightTracer(
    currentLevel?.components ?? [],
    componentStates
  )
  const jonesResult = useJonesLightTracerLegacy(
    currentLevel?.components ?? [],
    componentStates
  )

  // Select tracer result based on mode
  const { beams: lightBeams, sensorStates } = gameMode === 'advanced' ? jonesResult : classicResult

  // Check win condition
  useEffect(() => {
    const allSensorsActivated = sensorStates.length > 0 && sensorStates.every((s) => s.activated)
    if (allSensorsActivated && !isComplete) {
      setComplete(true)
    }
  }, [sensorStates, isComplete, setComplete])

  // Handle component rotation
  const handleRotate = useCallback((
    id: string,
    delta: number,
    property: 'angle' | 'polarizationAngle' | 'rotationAmount'
  ) => {
    const component = currentLevel?.components.find((c) => c.id === id)
    if (!component || component.locked) return
    rotateComponent(id, delta, property, component)
  }, [currentLevel, rotateComponent])

  // Handle reset
  const handleReset = useCallback(() => {
    resetLevel()
  }, [resetLevel])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isMod = e.ctrlKey || e.metaKey

      // Undo: Ctrl/Cmd + Z
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
      if ((isMod && e.shiftKey && e.key.toLowerCase() === 'z') ||
          (isMod && e.key.toLowerCase() === 'y')) {
        e.preventDefault()
        redo()
        return
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          handleReset()
          break
        case 'h':
          if (currentLevel?.hint) {
            useGame2DStore.getState().toggleHint()
          }
          break
        case 'escape':
          setSelectedComponent(null)
          break
        case 'n':
        case ']':
          if (showAdvancedLevels) {
            if (currentAdvancedIndex < ADVANCED_LEVELS.length - 1) {
              setAdvancedIndex(currentAdvancedIndex + 1)
            }
          } else {
            // For regular LEVELS, use the array length instead of level id
            if (currentLevelIndex < LEVELS.length - 1) {
              setLevelIndex(currentLevelIndex + 1)
            }
          }
          break
        case 'p':
        case '[':
          if (showAdvancedLevels) {
            if (currentAdvancedIndex > 0) {
              setAdvancedIndex(currentAdvancedIndex - 1)
            }
          } else {
            if (currentLevelIndex > 0) {
              setLevelIndex(currentLevelIndex - 1)
            }
          }
          break
        case 'v':
          useGame2DStore.getState().togglePolarization()
          break
        case ' ':
          e.preventDefault()
          useGame2DStore.getState().toggleAnimating()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    currentLevel,
    currentLevelIndex,
    currentAdvancedIndex,
    showAdvancedLevels,
    ADVANCED_LEVELS.length,
    handleReset,
    undo,
    redo,
    setSelectedComponent,
    setLevelIndex,
    setAdvancedIndex,
  ])

  // Level navigation
  const goToNextLevel = useCallback(() => {
    if (showAdvancedLevels) {
      if (currentAdvancedIndex < ADVANCED_LEVELS.length - 1) {
        setAdvancedIndex(currentAdvancedIndex + 1)
      }
    } else {
      // For regular LEVELS, use the array length
      if (currentLevelIndex < LEVELS.length - 1) {
        setLevelIndex(currentLevelIndex + 1)
      }
    }
  }, [showAdvancedLevels, currentAdvancedIndex, currentLevelIndex, ADVANCED_LEVELS.length, LEVELS.length, setAdvancedIndex, setLevelIndex])

  const goToPrevLevel = useCallback(() => {
    if (showAdvancedLevels) {
      if (currentAdvancedIndex > 0) {
        setAdvancedIndex(currentAdvancedIndex - 1)
      }
    } else {
      if (currentLevelIndex > 0) {
        setLevelIndex(currentLevelIndex - 1)
      }
    }
  }, [showAdvancedLevels, currentAdvancedIndex, currentLevelIndex, setAdvancedIndex, setLevelIndex])

  return {
    lightBeams,
    sensorStates,
    handleRotate,
    handleReset,
    goToNextLevel,
    goToPrevLevel,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }
}
