/**
 * Game2D Page - 2D polarization puzzle game
 * Complex open-ended puzzles with mirrors, splitters, rotators and multiple light paths
 *
 * Refactored version: Uses focused components and shared state management
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Zap,
  Info,
  X,
  Settings2,
  Keyboard,
} from 'lucide-react'
import { LanguageThemeSwitcher } from '@/components/ui/LanguageThemeSwitcher'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PersistentHeader } from '@/components/shared/PersistentHeader'
import { SEO } from '@/components/shared/SEO'
import { POLARIZATION_DISPLAY_CONFIG } from '@/lib/polarization'

// Import refactored components
import { GameBoard, GameControls, LevelManager, VictoryModal } from '@/components/game2d'

// Import state and hooks
import { useGame2DStore } from '@/stores/game2d/game2DStore'
import { useGame2DLogic } from '@/hooks/useGame2DLogic'

// Import level data
import { LEVELS } from '@/data/levels/game2dLevels'
import { ADVANCED_LEVELS } from '@/core/game2d/advancedLevels'

// Import shared optical SVG components (for type reference)
import type { OpticalComponent } from '@/components/shared/optical/types'

export function Game2DPage() {
  const { t, i18n } = useTranslation()
  void t
  const { theme } = useTheme()
  const { isMobile, isTablet } = useIsMobile()
  const isZh = i18n.language === 'zh'
  const isCompact = isMobile || isTablet
  const isDark = theme === 'dark'

  // Store state
  const {
    currentLevelIndex,
    currentAdvancedIndex,
    showAdvancedLevels,
    componentStates,
    selectedComponent,
    isComplete,
    showHint,
    isAnimating,
    showPolarization,
    showMobileInfo,
    setSelectedComponent,
    toggleMobileInfo,
    toggleHint,
  } = useGame2DStore()

  // Current level based on mode
  const currentLevel = showAdvancedLevels
    ? ADVANCED_LEVELS[currentAdvancedIndex]
    : LEVELS[currentLevelIndex]

  // Initialize current level in store
  useEffect(() => {
    if (currentLevel) {
      useGame2DStore.getState().setCurrentLevel(currentLevel)
    }
  }, [currentLevel])

  // Game logic hook - pass the level data directly (will handle both Level2D and AdvancedLevel)
  const {
    lightBeams,
    sensorStates,
    handleRotate,
    handleReset,
    goToNextLevel,
    goToPrevLevel,
    canUndo,
    canRedo,
  } = useGame2DLogic(currentLevel, ADVANCED_LEVELS)

  // Get selected component for mobile controls
  const selectedComponentData = selectedComponent
    ? currentLevel?.components.find((c) => c.id === selectedComponent) ?? null
    : null

  // Current level index for display
  const displayLevelIndex = showAdvancedLevels ? currentAdvancedIndex : currentLevelIndex
  const totalLevels = showAdvancedLevels ? ADVANCED_LEVELS.length : LEVELS.length

  return (
    <>
      <SEO
        title="2D Puzzle Game - PolarCraft"
        titleZh="2D益智游戏 - PolarCraft"
        description="Play 2D polarization puzzles with mirrors, splitters, and rotators. Learn Malus's Law through interactive gameplay."
        descriptionZh="通过镜子、分束器和旋转器玩2D偏振益智游戏。在互动游戏中学习马吕斯定律。"
      />
      <div
        className={cn(
          'min-h-screen flex flex-col',
          isDark
            ? 'bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a2a]'
            : 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100'
        )}
      >
        {/* Header */}
        <PersistentHeader
          moduleKey="polarquest"
          moduleName="PolarCraft 2D"
          variant="solid"
          compact={isCompact}
          showSettings={!isCompact}
          rightContent={
            <div className="flex items-center gap-2">
              {!isCompact && (
                <>
                  <Link
                    to="/game"
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                    )}
                    title={t('game.title')}
                  >
                    <Zap className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/demos"
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                    )}
                    title={t('demos.title')}
                  >
                    <BookOpen className="w-5 h-5" />
                  </Link>
                </>
              )}
              {isCompact && (
                <button
                  onClick={toggleMobileInfo}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    showMobileInfo
                      ? isDark ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                      : isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
              {isCompact && <LanguageThemeSwitcher compact />}
            </div>
          }
        />

        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col lg:flex-row overflow-hidden",
          isCompact ? "gap-2 p-2" : "gap-6 p-4 lg:p-6"
        )}>
          {/* Game Area */}
          <div className="flex-1 flex flex-col items-center">
            {/* Level Info */}
            <LevelManager
              currentLevelIndex={currentLevelIndex}
              totalLevels={totalLevels}
              displayLevelIndex={displayLevelIndex}
              currentLevel={currentLevel}
              isCompact={isCompact}
              isDark={isDark}
              isZh={isZh}
              showAdvancedLevels={showAdvancedLevels}
              LEVELS={LEVELS}
              goToNextLevel={goToNextLevel}
              goToPrevLevel={goToPrevLevel}
              setLevelIndex={(index) => useGame2DStore.getState().setLevelIndex(index)}
            />

            {/* Game Canvas */}
            <GameBoard
              levelComponents={currentLevel?.components ?? []}
              componentStates={componentStates}
              selectedComponent={selectedComponent}
              lightBeams={lightBeams}
              sensorStates={sensorStates}
              showPolarization={showPolarization}
              isAnimating={isAnimating}
              isDark={isDark}
              isComplete={isComplete}
              onTogglePolarization={() => useGame2DStore.getState().togglePolarization()}
              onSelectComponent={setSelectedComponent}
              onRotateComponent={handleRotate}
            />

            {/* Win Modal */}
            <VictoryModal
              isComplete={isComplete}
              isOpenEnded={currentLevel?.openEnded ?? false}
              currentLevelIndex={currentLevelIndex}
              totalLevels={LEVELS.length}
              isZh={isZh}
              onNextLevel={goToNextLevel}
            />

            {/* Controls */}
            <GameControls
              isCompact={isCompact}
              isDark={isDark}
              isAnimating={isAnimating}
              showHint={showHint}
              hasHint={!!currentLevel?.hint}
              canUndo={canUndo}
              canRedo={canRedo}
              selectedComponent={selectedComponentData as OpticalComponent | null}
              onUndo={() => useGame2DStore.getState().undo()}
              onRedo={() => useGame2DStore.getState().redo()}
              onReset={handleReset}
              onToggleAnimating={() => useGame2DStore.getState().toggleAnimating()}
              onToggleHint={toggleHint}
              onRotateComponent={handleRotate}
            />

            {/* Hint display */}
            {showHint && currentLevel?.hint && (
              <div
                className={cn(
                  'mt-3 px-4 py-2 rounded-lg text-sm max-w-md text-center',
                  'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300'
                )}
              >
                {isZh ? currentLevel.hintZh : currentLevel.hint}
              </div>
            )}
          </div>

          {/* Info Panel - Desktop always visible, Mobile toggle */}
          <div
            className={cn(
              'rounded-2xl overflow-y-auto',
              isCompact
                ? showMobileInfo
                  ? 'fixed inset-x-2 top-16 bottom-2 z-50 p-3'
                  : 'hidden'
                : 'w-full lg:w-80 p-4 lg:p-6 lg:max-h-[calc(100vh-120px)]',
              isDark
                ? 'bg-slate-900/95 border border-slate-700/50'
                : 'bg-white/95 border border-slate-200'
            )}
          >
            {/* Close button for mobile */}
            {isCompact && showMobileInfo && (
              <button
                onClick={toggleMobileInfo}
                className={cn(
                  "absolute top-2 right-2 p-1 rounded-lg",
                  isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Component Guide */}
            <div className="mb-6">
              <h3
                className={cn(
                  'font-bold mb-3 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-800'
                )}
              >
                <Settings2 className="w-4 h-4" />
                {isZh ? '元件说明' : 'Components'}
              </h3>
              <div className={cn('space-y-2 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs">
                    S
                  </span>
                  <span>{isZh ? '光源 - 发射偏振光' : 'Emitter - emits polarized light'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-500/30 border border-blue-500 flex items-center justify-center text-xs">
                    P
                  </span>
                  <span>{isZh ? '偏振片 - 过滤偏振方向' : 'Polarizer - filters polarization'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-400/30 border border-slate-400 flex items-center justify-center text-xs">
                    M
                  </span>
                  <span>{isZh ? '镜子 - 反射光线' : 'Mirror - reflects light'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/30 border border-cyan-500 flex items-center justify-center text-xs">
                    B
                  </span>
                  <span>{isZh ? '分光器 - 分离偏振' : 'Splitter - separates polarizations'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-500/30 border border-purple-500 flex items-center justify-center text-xs">
                    R
                  </span>
                  <span>{isZh ? '波片 - 旋转偏振方向' : 'Rotator - rotates polarization'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-green-500/30 border border-green-500 flex items-center justify-center text-xs">
                    D
                  </span>
                  <span>{isZh ? '传感器 - 检测光线' : 'Sensor - detects light'}</span>
                </div>
              </div>
            </div>

            {/* Physics Info */}
            <div className="mb-6">
              <h3
                className={cn(
                  'font-bold mb-3 flex items-center gap-2',
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                )}
              >
                <Info className="w-4 h-4" />
                {isZh ? '物理原理' : 'Physics'}
              </h3>
              <div className={cn('p-3 rounded-lg text-sm', isDark ? 'bg-slate-800/50' : 'bg-slate-100')}>
                <div className="text-center mb-2">
                  <span className={cn('text-lg font-mono', isDark ? 'text-cyan-300' : 'text-cyan-600')}>
                    I = I₀ × cos²θ
                  </span>
                </div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  {isZh
                    ? '马吕斯定律：光通过偏振片时，强度按角度差的余弦平方衰减'
                    : "Malus's Law: Light intensity decreases by cos²θ through a polarizer"}
                </p>
              </div>
            </div>

            {/* Keyboard Shortcuts - only show on desktop */}
            {!isCompact && (
              <div className="mb-6">
                <h3
                  className={cn(
                    'font-bold mb-3 flex items-center gap-2',
                    isDark ? 'text-white' : 'text-slate-800'
                  )}
                >
                  <Keyboard className="w-4 h-4" />
                  {isZh ? '快捷键' : 'Shortcuts'}
                </h3>
                <div className={cn('space-y-1 text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  <div className="flex justify-between">
                    <span>← →</span>
                    <span>{isZh ? '旋转选中元件' : 'Rotate component'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl+Z</span>
                    <span>{isZh ? '撤销' : 'Undo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl+⇧+Z</span>
                    <span>{isZh ? '重做' : 'Redo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>R</span>
                    <span>{isZh ? '重置关卡' : 'Reset level'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>H</span>
                    <span>{isZh ? '显示提示' : 'Toggle hint'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>V</span>
                    <span>{isZh ? '切换偏振色' : 'Toggle colors'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>N / ]</span>
                    <span>{isZh ? '下一关' : 'Next level'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P / [</span>
                    <span>{isZh ? '上一关' : 'Prev level'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Esc</span>
                    <span>{isZh ? '取消选择' : 'Deselect'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isZh ? '空格' : 'Space'}</span>
                    <span>{isZh ? '暂停/播放' : 'Pause/Play'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Polarization colors */}
            {showPolarization && (
              <div className="mb-6">
                <h3 className={cn('font-bold mb-3', isDark ? 'text-white' : 'text-slate-800')}>
                  {isZh ? '偏振颜色' : 'Polarization Colors'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POLARIZATION_DISPLAY_CONFIG.map(({ angle, label, color }) => (
                    <div key={angle} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                      <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-600')}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default Game2DPage
