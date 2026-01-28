import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Level2D } from '@/stores/game2d/game2DStore'
import type { AdvancedLevel } from '@/core/game2d/advancedLevels'

interface LevelManagerProps {
  currentLevelIndex: number
  totalLevels: number
  displayLevelIndex: number
  currentLevel: Level2D | AdvancedLevel
  isCompact: boolean
  isDark: boolean
  isZh: boolean
  showAdvancedLevels: boolean
  LEVELS: Level2D[]

  goToNextLevel: () => void
  goToPrevLevel: () => void
  setLevelIndex: (index: number) => void
}

// Difficulty colors
const difficultyColors: Record<string, string> = {
  easy: 'text-green-400 bg-green-500/20 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  hard: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  expert: 'text-red-400 bg-red-500/20 border-red-500/30',
  master: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  grandmaster: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
  legendary: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
}

export const LevelManager = memo(({
  currentLevelIndex,
  totalLevels,
  displayLevelIndex,
  currentLevel,
  isCompact,
  isDark,
  isZh,
  showAdvancedLevels,
  LEVELS,
  goToNextLevel,
  goToPrevLevel,
  setLevelIndex,
}: LevelManagerProps) => {
  const difficultyLabel = isZh
    ? {
        easy: '简单',
        medium: '中等',
        hard: '困难',
        expert: '专家',
        master: '大师',
        grandmaster: '宗师',
        legendary: '传奇',
      }[currentLevel.difficulty] ?? currentLevel.difficulty
    : currentLevel.difficulty

  return (
    <>
      {/* Level Info Header */}
      <div className={cn("text-center", isCompact ? "mb-2" : "mb-4")}>
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => {}}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-all',
              !showAdvancedLevels
                ? 'bg-cyan-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            )}
          >
            {isZh ? '经典关卡' : 'Classic'}
          </button>
          <button
            onClick={() => {}}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-all',
              showAdvancedLevels
                ? 'bg-purple-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            )}
          >
            {isZh ? '量子物理' : 'Quantum'}
          </button>
        </div>

        {/* Level Navigation */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <button
            onClick={goToPrevLevel}
            disabled={displayLevelIndex === 0}
            className={cn(
              'p-2 rounded-full transition-all',
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 disabled:opacity-30'
                : 'bg-slate-200 hover:bg-slate-300 disabled:opacity-30'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-800')}>
                {isZh ? currentLevel.nameZh : currentLevel.name}
              </h2>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  difficultyColors[currentLevel.difficulty]
                )}
              >
                {difficultyLabel}
              </span>
            </div>
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              {displayLevelIndex + 1} / {totalLevels}
            </span>
          </div>
          <button
            onClick={goToNextLevel}
            disabled={displayLevelIndex === totalLevels - 1}
            className={cn(
              'p-2 rounded-full transition-all',
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 disabled:opacity-30'
                : 'bg-slate-200 hover:bg-slate-300 disabled:opacity-30'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className={cn('text-sm max-w-md', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {isZh ? currentLevel.descriptionZh : currentLevel.description}
        </p>
      </div>

      {/* Level Progress Grid - Desktop */}
      {!isCompact && (
        <div className="mt-6">
          <h3 className={cn('font-bold mb-3', isDark ? 'text-white' : 'text-slate-800')}>
            {isZh ? '关卡选择' : 'Level Select'}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map((level, i) => (
              <button
                key={level.id}
                onClick={() => setLevelIndex(i)}
                className={cn(
                  'aspect-square rounded-lg font-bold transition-all text-sm',
                  currentLevelIndex === i
                    ? 'bg-cyan-500 text-white shadow-lg scale-105'
                    : isDark
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
                  level.difficulty === 'hard' && !isDark && 'border-l-2 border-orange-400',
                  level.difficulty === 'expert' && !isDark && 'border-l-2 border-red-400',
                  level.difficulty === 'hard' && isDark && 'border-l-2 border-orange-500/50',
                  level.difficulty === 'expert' && isDark && 'border-l-2 border-red-500/50'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
})

LevelManager.displayName = 'LevelManager'
