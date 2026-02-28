import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/stores/gameStore'
import { TUTORIAL_LEVELS } from '@/levels'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LevelSelectorProps {
  compact?: boolean
}

export function LevelSelector({ compact = false }: LevelSelectorProps) {
  const { t } = useTranslation()
  const { currentLevelIndex, loadLevel } = useGameStore()

  // Compact mode for mobile - shows current level with prev/next buttons
  if (compact) {
    const canGoPrev = currentLevelIndex > 0
    const canGoNext = currentLevelIndex < TUTORIAL_LEVELS.length - 1

    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => canGoPrev && loadLevel(currentLevelIndex - 1)}
          disabled={!canGoPrev}
          className={cn(
            "p-1 rounded transition-all",
            canGoPrev
              ? "text-cyan-400 hover:bg-cyan-400/20"
              : "text-gray-600 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-cyan-400 min-w-[80px] text-center">
          {t('game.level')} {currentLevelIndex + 1}/{TUTORIAL_LEVELS.length}
        </span>
        <button
          onClick={() => canGoNext && loadLevel(currentLevelIndex + 1)}
          disabled={!canGoNext}
          className={cn(
            "p-1 rounded transition-all",
            canGoNext
              ? "text-cyan-400 hover:bg-cyan-400/20"
              : "text-gray-600 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Desktop mode - original layout
  return (
    <div className="flex gap-1.5">
      {TUTORIAL_LEVELS.map((_, index) => (
        <button
          key={index}
          onClick={() => loadLevel(index)}
          className={cn(
            "w-8 h-8 rounded-lg text-xs font-medium transition-all",
            "border",
            currentLevelIndex === index
              ? "bg-cyan-400/20 border-cyan-400 text-cyan-400"
              : "bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-400/50 hover:text-gray-200"
          )}
          title={t(`game.tutorials.${index}.name`)}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => {
          const { world } = useGameStore.getState()
          if (world) {
            world.clear()
          }
        }}
        className="px-3 h-8 rounded-lg text-xs font-medium transition-all
                   bg-orange-400/20 border border-orange-400/50 text-orange-400
                   hover:bg-orange-400/30 hover:border-orange-400"
        title={t('game.sandboxMode')}
      >
        {t('game.sandbox')}
      </button>
    </div>
  )
}
