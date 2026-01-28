import { memo } from 'react'
import { Trophy } from 'lucide-react'

interface VictoryModalProps {
  isComplete: boolean
  isOpenEnded: boolean
  currentLevelIndex: number
  totalLevels: number
  isZh: boolean

  onNextLevel: () => void
}

export const VictoryModal = memo(({
  isComplete,
  isOpenEnded,
  currentLevelIndex,
  totalLevels,
  isZh,
  onNextLevel,
}: VictoryModalProps) => {
  if (!isComplete) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-fade-in-up">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-6 rounded-2xl shadow-2xl text-center">
        <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white mb-1">
          {isZh ? '关卡完成！' : 'Level Complete!'}
        </h3>
        {isOpenEnded && (
          <p className="text-green-100 text-sm mb-3">
            {isZh
              ? '这是开放性关卡，可能有多种解法'
              : 'Open-ended puzzle - multiple solutions exist'}
          </p>
        )}
        {currentLevelIndex < totalLevels - 1 && (
          <button
            onClick={onNextLevel}
            className="mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
          >
            {isZh ? '下一关' : 'Next Level'} →
          </button>
        )}
      </div>
    </div>
  )
})

VictoryModal.displayName = 'VictoryModal'
