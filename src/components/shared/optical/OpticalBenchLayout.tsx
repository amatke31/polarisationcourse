/**
 * OpticalBenchLayout - 统一光学演示布局容器
 *
 * Provides a consistent, physics-aware UI framework for all optical demos:
 * - Unified layout with visualization area + control panel
 * - Real-time physics data tooltips on hover
 * - Preset configuration management
 * - Integration with RayRenderAdapter for physics-to-visual conversion
 *
 * Usage:
 * ```tsx
 * <OpticalBenchLayout
 *   title="Malus's Law"
 *   presets={MALUS_PRESETS}
 *   onPresetChange={handlePreset}
 *   controlPanel={<MyControls />}
 * >
 *   <MySVGVisualization />
 * </OpticalBenchLayout>
 * ```
 */

import React, { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RayRenderData } from './RayRenderAdapter'

// ============================================
// Types
// ============================================

export interface Preset {
  id: string
  name: string
  nameZh?: string
  description?: string
  descriptionZh?: string
  icon?: React.ReactNode
  color?: string
}

export interface PhysicsTooltipData {
  intensity: number
  polarizationAngle: number
  degreeOfPolarization: number
  stokesParameters: [number, number, number, number]
  polarizationType: 'linear' | 'circular' | 'elliptical' | 'unpolarized' | 'partial'
  handedness?: 'right' | 'left' | 'none'
}

export interface OpticalBenchLayoutProps {
  /** Demo title */
  title: string
  titleZh?: string

  /** Demo subtitle/description */
  subtitle?: string
  subtitleZh?: string

  /** Available presets */
  presets?: Preset[]

  /** Currently selected preset */
  selectedPreset?: string

  /** Called when preset changes */
  onPresetChange?: (presetId: string) => void

  /** Called when reset button is clicked */
  onReset?: () => void

  /** Control panel content */
  controlPanel?: React.ReactNode

  /** Secondary control panel (e.g., advanced options) */
  secondaryControls?: React.ReactNode

  /** Information cards to display below visualization */
  infoCards?: React.ReactNode

  /** Main visualization content */
  children: React.ReactNode

  /** Whether to show polarization colors by default */
  showPolarizationColors?: boolean

  /** Called when polarization color toggle changes */
  onPolarizationColorsChange?: (show: boolean) => void

  /** Physics data for tooltip display (from RayRenderAdapter) */
  tooltipData?: PhysicsTooltipData | null

  /** Position of the tooltip (screen coordinates) */
  tooltipPosition?: { x: number; y: number } | null

  /** Layout variant */
  variant?: 'standard' | 'compact' | 'wide'

  /** Additional class names */
  className?: string
}

// ============================================
// Context for nested components
// ============================================

interface BenchContextValue {
  showPolarizationColors: boolean
  setShowPolarizationColors: (show: boolean) => void
  hoveredRay: RayRenderData | null
  setHoveredRay: (ray: RayRenderData | null) => void
}

const BenchContext = createContext<BenchContextValue | null>(null)

export function useBenchContext() {
  const ctx = useContext(BenchContext)
  if (!ctx) {
    throw new Error('useBenchContext must be used within OpticalBenchLayout')
  }
  return ctx
}

// ============================================
// Sub-components
// ============================================

/**
 * Header with title and quick actions
 */
function BenchHeader({
  title,
  titleZh,
  subtitle,
  subtitleZh,
  showPolarizationColors,
  onPolarizationColorsChange,
  onReset,
}: {
  title: string
  titleZh?: string
  subtitle?: string
  subtitleZh?: string
  showPolarizationColors: boolean
  onPolarizationColorsChange: (show: boolean) => void
  onReset?: () => void
}) {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const displayTitle = isZh && titleZh ? titleZh : title
  const displaySubtitle = isZh && subtitleZh ? subtitleZh : subtitle

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/50">
      <div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
          {displayTitle}
        </h2>
        {displaySubtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{displaySubtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Polarization Colors Toggle */}
        <motion.button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showPolarizationColors
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:bg-slate-600/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPolarizationColorsChange(!showPolarizationColors)}
          title={isZh ? '显示偏振颜色' : 'Show polarization colors'}
        >
          {showPolarizationColors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {isZh ? '偏振色' : 'Colors'}
          </span>
        </motion.button>

        {/* Reset Button */}
        {onReset && (
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:bg-slate-600/50 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            title={isZh ? '重置' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isZh ? '重置' : 'Reset'}
            </span>
          </motion.button>
        )}
      </div>
    </div>
  )
}

/**
 * Preset selector bar
 */
function PresetBar({
  presets,
  selectedPreset,
  onPresetChange,
}: {
  presets: Preset[]
  selectedPreset?: string
  onPresetChange: (id: string) => void
}) {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  if (!presets.length) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-slate-700/50 bg-slate-900/30">
      <span className="text-xs text-gray-500 self-center mr-1">
        {isZh ? '预设:' : 'Presets:'}
      </span>
      {presets.map((preset) => {
        const isSelected = preset.id === selectedPreset
        const displayName = isZh && preset.nameZh ? preset.nameZh : preset.name

        return (
          <motion.button
            key={preset.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isSelected
                ? 'bg-opacity-20 border-opacity-50'
                : 'bg-slate-800/50 text-gray-400 border-slate-600/50 hover:border-slate-500'
            }`}
            style={{
              backgroundColor: isSelected ? `${preset.color || '#22d3ee'}20` : undefined,
              borderColor: isSelected ? `${preset.color || '#22d3ee'}80` : undefined,
              color: isSelected ? preset.color || '#22d3ee' : undefined,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPresetChange(preset.id)}
          >
            {preset.icon}
            {displayName}
          </motion.button>
        )
      })}
    </div>
  )
}

/**
 * Physics data tooltip
 */
function PhysicsTooltip({
  data,
  position,
}: {
  data: PhysicsTooltipData
  position: { x: number; y: number }
}) {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  const polarizationLabel = {
    linear: isZh ? '线偏振' : 'Linear',
    circular: isZh ? '圆偏振' : 'Circular',
    elliptical: isZh ? '椭圆偏振' : 'Elliptical',
    unpolarized: isZh ? '自然光' : 'Unpolarized',
    partial: isZh ? '部分偏振' : 'Partial',
  }[data.polarizationType]

  const handednessLabel = data.handedness === 'right'
    ? (isZh ? '右旋' : 'RCP')
    : data.handedness === 'left'
      ? (isZh ? '左旋' : 'LCP')
      : ''

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 5 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y - 10,
      }}
    >
      <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg shadow-xl p-3 min-w-[180px]">
        <div className="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-700 pb-1.5">
          {isZh ? '光线参数' : 'Ray Parameters'}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">{isZh ? '光强' : 'Intensity'}:</span>
            <span className="text-white font-mono">{data.intensity.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">{isZh ? '偏振态' : 'Polarization'}:</span>
            <span className="text-cyan-400">
              {polarizationLabel} {handednessLabel}
            </span>
          </div>

          {data.polarizationType === 'linear' && (
            <div className="flex justify-between">
              <span className="text-gray-400">{isZh ? '偏振角' : 'Angle'}:</span>
              <span className="text-orange-400 font-mono">{data.polarizationAngle.toFixed(1)}°</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">{isZh ? '偏振度' : 'DoP'}:</span>
            <span className="text-green-400 font-mono">{(data.degreeOfPolarization * 100).toFixed(1)}%</span>
          </div>

          {/* Stokes parameters */}
          <div className="pt-1.5 border-t border-slate-700 mt-1.5">
            <div className="text-gray-500 mb-1">{isZh ? '斯托克斯矢量' : 'Stokes'}:</div>
            <div className="font-mono text-[10px] text-gray-300 grid grid-cols-4 gap-1">
              <span>S₀: {data.stokesParameters[0].toFixed(2)}</span>
              <span>S₁: {data.stokesParameters[1].toFixed(2)}</span>
              <span>S₂: {data.stokesParameters[2].toFixed(2)}</span>
              <span>S₃: {data.stokesParameters[3].toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Main Component
// ============================================

export function OpticalBenchLayout({
  title,
  titleZh,
  subtitle,
  subtitleZh,
  presets = [],
  selectedPreset,
  onPresetChange,
  onReset,
  controlPanel,
  secondaryControls,
  infoCards,
  children,
  showPolarizationColors: initialShowColors = true,
  onPolarizationColorsChange,
  tooltipData,
  tooltipPosition,
  variant = 'standard',
  className = '',
}: OpticalBenchLayoutProps) {
  const [showPolarizationColors, setShowPolarizationColors] = useState(initialShowColors)
  const [hoveredRay, setHoveredRay] = useState<RayRenderData | null>(null)

  const handlePolarizationColorsChange = useCallback((show: boolean) => {
    setShowPolarizationColors(show)
    onPolarizationColorsChange?.(show)
  }, [onPolarizationColorsChange])

  const handlePresetChange = useCallback((id: string) => {
    onPresetChange?.(id)
  }, [onPresetChange])

  const contextValue: BenchContextValue = {
    showPolarizationColors,
    setShowPolarizationColors: handlePolarizationColorsChange,
    hoveredRay,
    setHoveredRay,
  }

  // Layout classes based on variant
  const layoutClasses = {
    standard: 'grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4',
    compact: 'grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3',
    wide: 'grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6',
  }

  return (
    <BenchContext.Provider value={contextValue}>
      <div className={`space-y-4 ${className}`}>
        {/* Main container */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-cyan-950/90 border border-cyan-500/20 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {/* Header */}
          <BenchHeader
            title={title}
            titleZh={titleZh}
            subtitle={subtitle}
            subtitleZh={subtitleZh}
            showPolarizationColors={showPolarizationColors}
            onPolarizationColorsChange={handlePolarizationColorsChange}
            onReset={onReset}
          />

          {/* Preset bar */}
          {presets.length > 0 && (
            <PresetBar
              presets={presets}
              selectedPreset={selectedPreset}
              onPresetChange={handlePresetChange}
            />
          )}

          {/* Main content area */}
          <div className={`p-4 ${layoutClasses[variant]}`}>
            {/* Visualization area */}
            <div className="bg-slate-950/50 rounded-xl border border-slate-700/50 overflow-hidden">
              {children}
            </div>

            {/* Control panel */}
            {controlPanel && (
              <div className="space-y-4">
                {controlPanel}
                {secondaryControls}
              </div>
            )}
          </div>
        </div>

        {/* Info cards */}
        {infoCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {infoCards}
          </div>
        )}

        {/* Physics Tooltip */}
        <AnimatePresence>
          {tooltipData && tooltipPosition && (
            <PhysicsTooltip data={tooltipData} position={tooltipPosition} />
          )}
        </AnimatePresence>
      </div>
    </BenchContext.Provider>
  )
}

// ============================================
// Helper Components for Demo Building
// ============================================

/**
 * Quick stat display for visualization area
 */
export function QuickStat({
  label,
  value,
  unit,
  color = 'cyan',
}: {
  label: string
  value: string | number
  unit?: string
  color?: 'cyan' | 'orange' | 'green' | 'purple' | 'pink'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-mono font-semibold ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        {unit && <span className="text-gray-500 ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

/**
 * Visualization overlay bar (bottom of canvas)
 */
export function VisualizationOverlay({
  children,
  position = 'bottom',
}: {
  children: React.ReactNode
  position?: 'top' | 'bottom'
}) {
  return (
    <div
      className={`absolute left-0 right-0 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      } bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 flex items-center justify-between`}
    >
      {children}
    </div>
  )
}

/**
 * Interactive angle indicator (for draggable rotation)
 */
export function AngleIndicator({
  angle,
  onChange,
  size = 60,
  color = '#22d3ee',
  label,
  disabled = false,
}: {
  angle: number
  onChange: (angle: number) => void
  size?: number
  color?: string
  label?: string
  disabled?: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const center = size / 2

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return
    setIsDragging(true)
    updateAngle(e)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    updateAngle(e)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateAngle = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left - center
    const y = e.clientY - rect.top - center
    let newAngle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (newAngle < 0) newAngle += 360
    onChange(newAngle % 360)
  }

  const handleRadius = size / 2 - 8
  const handleX = center + handleRadius * Math.sin((angle * Math.PI) / 180)
  const handleY = center - handleRadius * Math.cos((angle * Math.PI) / 180)

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={size / 2 - 2}
          fill="rgba(30, 41, 59, 0.5)"
          stroke={color}
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Angle line */}
        <line
          x1={center}
          y1={center}
          x2={handleX}
          y2={handleY}
          stroke={color}
          strokeWidth="2"
        />

        {/* Handle */}
        <motion.circle
          cx={handleX}
          cy={handleY}
          r={6}
          fill={color}
          stroke="white"
          strokeWidth="2"
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ duration: 0.15 }}
        />

        {/* Center point */}
        <circle cx={center} cy={center} r={3} fill={color} />
      </svg>

      {/* Label */}
      {label && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  )
}

