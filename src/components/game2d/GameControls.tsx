import { memo } from 'react'
import { Undo2, Redo2, RotateCcw, Play, Pause, Lightbulb, RotateCcw as RotateCcwIcon, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { OpticalComponent } from '@/components/shared/optical/types'

interface GameControlsProps {
  isCompact: boolean
  isDark: boolean
  isAnimating: boolean
  showHint: boolean
  hasHint: boolean
  canUndo: boolean
  canRedo: boolean
  selectedComponent: OpticalComponent | null

  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onToggleAnimating: () => void
  onToggleHint: () => void
  onRotateComponent: (id: string, delta: number, property: 'angle' | 'polarizationAngle' | 'rotationAmount') => void
}

export const GameControls = memo(({
  isCompact,
  isDark,
  isAnimating,
  showHint,
  hasHint,
  canUndo,
  canRedo,
  selectedComponent,
  onUndo,
  onRedo,
  onReset,
  onToggleAnimating,
  onToggleHint,
  onRotateComponent,
}: GameControlsProps) => {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  const getComponentState = (component: OpticalComponent) => {
    return component
  }

  return (
    <div className={cn(
      "flex items-center flex-wrap justify-center",
      isCompact ? "gap-2 mt-2" : "gap-3 mt-4"
    )}>
      {/* Mobile rotation controls - show when component is selected */}
      {isCompact && selectedComponent && !selectedComponent.locked && (() => {
        const state = getComponentState(selectedComponent)
        const isRotator = selectedComponent.type === 'rotator'
        const isMirror = selectedComponent.type === 'mirror'

        return (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg",
            isDark ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-cyan-100 border border-cyan-300'
          )}>
            <span className={cn("text-xs mr-1", isDark ? 'text-cyan-400' : 'text-cyan-600')}>
              {isZh ? '旋转' : 'Rotate'}:
            </span>
            {isRotator ? (
              <button
                onClick={() => onRotateComponent(selectedComponent.id, 0, 'rotationAmount')}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  isDark ? 'bg-cyan-400/30 text-cyan-300' : 'bg-cyan-200 text-cyan-700'
                )}
              >
                {state.rotationAmount === 45 ? '45° → 90°' : '90° → 45°'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => onRotateComponent(selectedComponent.id, isMirror ? -45 : -15, isMirror ? 'angle' : 'polarizationAngle')}
                  className={cn(
                    "p-1.5 rounded",
                    isDark ? 'bg-cyan-400/30 text-cyan-300' : 'bg-cyan-200 text-cyan-700'
                  )}
                >
                  <RotateCcwIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRotateComponent(selectedComponent.id, isMirror ? 45 : 15, isMirror ? 'angle' : 'polarizationAngle')}
                  className={cn(
                    "p-1.5 rounded",
                    isDark ? 'bg-cyan-400/30 text-cyan-300' : 'bg-cyan-200 text-cyan-700'
                  )}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      })()}

      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors',
          isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
          !canUndo && 'opacity-40 cursor-not-allowed',
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:hover:bg-slate-800'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:hover:bg-slate-200'
        )}
        title={isZh ? '撤销 (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
      >
        <Undo2 className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
      </button>

      {/* Redo button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors',
          isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
          !canRedo && 'opacity-40 cursor-not-allowed',
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:hover:bg-slate-800'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:hover:bg-slate-200'
        )}
        title={isZh ? '重做 (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'}
      >
        <Redo2 className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors',
          isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
        )}
        title={isZh ? '重置 (R)' : 'Reset (R)'}
      >
        <RotateCcw className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
        {!isCompact && (isZh ? '重置' : 'Reset')}
      </button>

      {/* Play/Pause button */}
      <button
        onClick={onToggleAnimating}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors',
          isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
        )}
        title={isZh ? '暂停/播放 (空格)' : 'Pause/Play (Space)'}
      >
        {isAnimating ? <Pause className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} /> : <Play className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />}
        {!isCompact && (isAnimating ? (isZh ? '暂停' : 'Pause') : isZh ? '播放' : 'Play')}
      </button>

      {/* Hint button */}
      {hasHint && (
        <button
          onClick={onToggleHint}
          className={cn(
            'flex items-center gap-2 rounded-lg transition-colors',
            isCompact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
            showHint
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          )}
          title={isZh ? '提示 (H)' : 'Hint (H)'}
        >
          <Lightbulb className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
          {!isCompact && (isZh ? '提示' : 'Hint')}
        </button>
      )}
    </div>
  )
})

GameControls.displayName = 'GameControls'
