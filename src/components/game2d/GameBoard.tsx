import { memo } from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPolarizationColor } from '@/lib/polarization'
import {
  EmitterSVG,
  PolarizerSVG,
  MirrorSVG,
  SplitterSVG,
  RotatorSVG,
  SensorSVG,
  LightBeamSVG,
  LightBeamDefs,
} from '@/components/shared/optical'
import type { OpticalComponent } from '@/components/shared/optical/types'

// SensorState interface (redefined since not exported from useLightTracer)
export interface SensorState {
  id: string
  activated: boolean
  receivedIntensity: number
  receivedPolarization: number | null
}

interface GameBoardProps {
  levelComponents: OpticalComponent[]
  componentStates: Record<string, Partial<OpticalComponent>>
  selectedComponent: string | null
  lightBeams: any[]
  sensorStates: SensorState[]
  showPolarization: boolean
  isAnimating: boolean
  isDark: boolean
  isComplete: boolean

  onTogglePolarization: () => void
  onSelectComponent: (id: string) => void
  onRotateComponent: (id: string, delta: number, property: 'angle' | 'polarizationAngle' | 'rotationAmount') => void
}

export const GameBoard = memo(({
  levelComponents,
  componentStates,
  selectedComponent,
  lightBeams,
  sensorStates,
  showPolarization,
  isAnimating,
  isDark,
  isComplete,
  onTogglePolarization,
  onSelectComponent,
  onRotateComponent,
}: GameBoardProps) => {
  const getComponentState = (component: OpticalComponent) => {
    const state = componentStates[component.id] || {}
    return {
      ...component,
      angle: state.angle ?? component.angle,
      polarizationAngle: state.polarizationAngle ?? component.polarizationAngle,
      rotationAmount: state.rotationAmount ?? component.rotationAmount,
    }
  }

  return (
    <div
      className={cn(
        'relative w-full max-w-2xl aspect-square rounded-2xl overflow-hidden shadow-2xl',
        isDark
          ? 'bg-slate-900/90 border border-cyan-500/20'
          : 'bg-white border border-slate-200'
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ background: isDark ? '#0a0a1a' : '#f8fafc' }}
      >
        {/* Grid background and filters */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              strokeWidth="0.2"
            />
          </pattern>
          <LightBeamDefs />
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Light beams */}
        {lightBeams.map((beam, i) => (
          <LightBeamSVG
            key={i}
            beam={beam}
            showPolarization={showPolarization}
            isAnimating={isAnimating}
            getPolarizationColor={getPolarizationColor}
          />
        ))}

        {/* Render components */}
        {levelComponents.map((component) => {
          const state = getComponentState(component)
          const isSelected = selectedComponent === component.id

          return (
            <g key={component.id}>
              {component.type === 'emitter' && (
                <EmitterSVG
                  x={state.x}
                  y={state.y}
                  polarization={state.polarizationAngle ?? 0}
                  direction={state.direction ?? 'down'}
                  isAnimating={isAnimating}
                  showPolarization={showPolarization}
                  getPolarizationColor={getPolarizationColor}
                />
              )}

              {component.type === 'polarizer' && (
                <PolarizerSVG
                  x={state.x}
                  y={state.y}
                  polarizationAngle={state.polarizationAngle ?? 0}
                  locked={component.locked}
                  selected={isSelected}
                  onClick={() => !component.locked && onSelectComponent(component.id)}
                  onRotate={(delta) => onRotateComponent(component.id, delta, 'polarizationAngle')}
                  getPolarizationColor={getPolarizationColor}
                  isDark={isDark}
                />
              )}

              {component.type === 'mirror' && (
                <MirrorSVG
                  x={state.x}
                  y={state.y}
                  angle={state.angle ?? 45}
                  locked={component.locked}
                  selected={isSelected}
                  onClick={() => !component.locked && onSelectComponent(component.id)}
                  onRotate={(delta) => onRotateComponent(component.id, delta, 'angle')}
                  isDark={isDark}
                />
              )}

              {component.type === 'splitter' && (
                <SplitterSVG x={state.x} y={state.y} isDark={isDark} />
              )}

              {component.type === 'rotator' && (
                <RotatorSVG
                  x={state.x}
                  y={state.y}
                  rotationAmount={state.rotationAmount ?? 45}
                  locked={component.locked}
                  selected={isSelected}
                  onClick={() => !component.locked && onSelectComponent(component.id)}
                  onToggle={() => onRotateComponent(component.id, 0, 'rotationAmount')}
                  isDark={isDark}
                />
              )}

              {component.type === 'sensor' && (
                <SensorSVG
                  x={state.x}
                  y={state.y}
                  sensorState={sensorStates.find((s) => s.id === component.id)}
                  requiredIntensity={component.requiredIntensity ?? 50}
                  requiredPolarization={component.requiredPolarization}
                  isDark={isDark}
                  isAnimating={isAnimating}
                  getPolarizationColor={getPolarizationColor}
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* Overlay info */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 text-xs">
        <button
          onClick={onTogglePolarization}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all',
            showPolarization
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : isDark
                ? 'bg-slate-800/80 text-slate-400'
                : 'bg-slate-200 text-slate-600'
          )}
        >
          <Eye className="w-3 h-3" />
          Polarization
        </button>
      </div>

      {/* Sensors status */}
      <div
        className={cn(
          'absolute top-3 right-3 px-3 py-2 rounded-lg text-xs font-mono',
          isDark ? 'bg-slate-800/90 text-slate-300' : 'bg-white/90 text-slate-700'
        )}
      >
        {sensorStates.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={cn('w-2 h-2 rounded-full', s.activated ? 'bg-green-400' : 'bg-slate-500')}
            />
            <span>
              S{i + 1}: {Math.round(s.receivedIntensity)}%
            </span>
          </div>
        ))}
      </div>

      {/* Win overlay - handled by VictoryModal */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-fade-in-up">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-6 rounded-2xl shadow-2xl text-center">
            <p className="text-white text-lg font-bold">Level Complete!</p>
          </div>
        </div>
      )}
    </div>
  )
})

GameBoard.displayName = 'GameBoard'
