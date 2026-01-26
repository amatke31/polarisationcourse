/**
 * ThreePolarizersDemo - 三偏振片悖论演示 (Enhanced Version)
 * 展示经典的"三偏振片悖论"：在两个正交偏振片之间插入45°偏振片可以让光通过
 *
 * Physics Engine Migration:
 * - Uses unified CoherencyMatrix-based calculations via PolarizationPhysics
 * - Polarizer chain computed through engine (handles unpolarized input + cascaded polarizers)
 *
 * Enhanced Features:
 * - Real-time I-θ curve showing transmission vs middle polarizer angle
 * - Draggable polarizer angles directly on visualization
 * - Interactive angle handles for intuitive manipulation
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Volume2, VolumeX, TrendingUp } from 'lucide-react'
import { useHapticAudio } from '@/hooks/useHapticAudio'
import { PolarizationPhysics } from '@/hooks/usePolarizationSimulation'
import {
  ControlPanel,
  SliderControl,
  Toggle,
  InfoCard,
  Formula,
  PresetButtons,
  AnimatedValue,
} from '../DemoControls'

// 光束组件
interface LightBeamProps {
  x1: number
  x2: number
  intensity: number
  polarization: number
  showPolarization: boolean
  animate?: boolean
}

function LightBeam({ x1, x2, intensity, polarization, showPolarization, animate = true }: LightBeamProps) {
  const y = 150
  const color = showPolarization ? getPolarizationColor(polarization) : '#ffd700'
  const strokeWidth = Math.max(1, intensity * 8)
  const opacity = Math.max(0.1, intensity)

  return (
    <g>
      {/* 光束主体 */}
      <motion.line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : {}}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* 发光效果 */}
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={color}
        strokeWidth={strokeWidth * 3}
        strokeOpacity={opacity * 0.3}
        strokeLinecap="round"
      />

      {/* 偏振方向指示箭头 */}
      {showPolarization && intensity > 0.1 && (
        <g transform={`translate(${(x1 + x2) / 2}, ${y})`}>
          <motion.g
            animate={animate ? { rotate: [0, 0] } : {}}
            style={{ transformOrigin: 'center' }}
          >
            <line
              x1={-15 * Math.cos((polarization * Math.PI) / 180)}
              y1={-15 * Math.sin((polarization * Math.PI) / 180)}
              x2={15 * Math.cos((polarization * Math.PI) / 180)}
              y2={15 * Math.sin((polarization * Math.PI) / 180)}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.8"
            />
          </motion.g>
        </g>
      )}
    </g>
  )
}

// 偏振角度转颜色
function getPolarizationColor(angle: number): string {
  const normalizedAngle = ((angle % 180) + 180) % 180
  if (normalizedAngle < 22.5 || normalizedAngle >= 157.5) return '#ff4444' // 0° - 红
  if (normalizedAngle < 67.5) return '#ffaa00' // 45° - 橙
  if (normalizedAngle < 112.5) return '#44ff44' // 90° - 绿
  return '#4444ff' // 135° - 蓝
}

// ========================================
// Real-time I-θ Curve Component (马吕斯曲线)
// ========================================
interface MalusCurveProps {
  polarizer1Angle: number
  polarizer2Angle: number | null // Middle polarizer (nullable)
  polarizer3Angle: number
  showMiddlePolarizer: boolean
  currentMiddleAngle: number
  isZh: boolean
}

function MalusCurve({
  polarizer1Angle,
  polarizer3Angle,
  showMiddlePolarizer,
  currentMiddleAngle,
  isZh,
}: MalusCurveProps) {
  // Generate curve data using physics engine
  const curveData = useMemo(() => {
    const points: { angle: number; transmission: number }[] = []

    for (let middleAngle = 0; middleAngle <= 180; middleAngle += 2) {
      const angles = showMiddlePolarizer
        ? [polarizer1Angle, middleAngle, polarizer3Angle]
        : [polarizer1Angle, polarizer3Angle]

      const result = PolarizationPhysics.polarizerChain(angles, true, 1.0)
      points.push({
        angle: middleAngle,
        transmission: result.intensity * 100,
      })
    }

    return points
  }, [polarizer1Angle, polarizer3Angle, showMiddlePolarizer])

  // Current point on the curve
  const currentPoint = useMemo(() => {
    if (!showMiddlePolarizer) return null

    const angles = [polarizer1Angle, currentMiddleAngle, polarizer3Angle]
    const result = PolarizationPhysics.polarizerChain(angles, true, 1.0)
    return {
      angle: currentMiddleAngle,
      transmission: result.intensity * 100,
    }
  }, [polarizer1Angle, currentMiddleAngle, polarizer3Angle, showMiddlePolarizer])

  // Chart dimensions
  const width = 280
  const height = 140
  const padding = { top: 20, right: 15, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Scale functions
  const xScale = (angle: number) => padding.left + (angle / 180) * chartWidth
  const yScale = (transmission: number) =>
    padding.top + chartHeight - (transmission / 25) * chartHeight // Max 25% for 3 polarizers

  // Build SVG path
  const pathD = curveData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.angle)},${yScale(p.transmission)}`)
    .join(' ')

  // Find max transmission point
  const maxPoint = curveData.reduce((max, p) => (p.transmission > max.transmission ? p : max), curveData[0])

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-medium text-gray-300">
          {isZh ? '透射率 vs 中间偏振片角度' : 'Transmission vs Middle Polarizer Angle'}
        </span>
      </div>

      <svg width={width} height={height} className="w-full">
        {/* Background grid */}
        <defs>
          <pattern id="curve-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(100,150,255,0.1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="url(#curve-grid)"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#475569"
          strokeWidth="1"
        />

        {/* X-axis labels */}
        {[0, 45, 90, 135, 180].map((angle) => (
          <g key={angle}>
            <line
              x1={xScale(angle)}
              y1={padding.top + chartHeight}
              x2={xScale(angle)}
              y2={padding.top + chartHeight + 4}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text
              x={xScale(angle)}
              y={padding.top + chartHeight + 16}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
            >
              {angle}°
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {[0, 12.5, 25].map((val) => (
          <g key={val}>
            <line
              x1={padding.left - 4}
              y1={yScale(val)}
              x2={padding.left}
              y2={yScale(val)}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(val) + 3}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="9"
            >
              {val.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* Main curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          opacity={showMiddlePolarizer ? 1 : 0.3}
        />

        {/* Maximum point marker */}
        {showMiddlePolarizer && (
          <g>
            <line
              x1={xScale(maxPoint.angle)}
              y1={yScale(maxPoint.transmission)}
              x2={xScale(maxPoint.angle)}
              y2={padding.top + chartHeight}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.5"
            />
            <circle
              cx={xScale(maxPoint.angle)}
              cy={yScale(maxPoint.transmission)}
              r="4"
              fill="#fbbf24"
              opacity="0.6"
            />
          </g>
        )}

        {/* Current point */}
        {showMiddlePolarizer && currentPoint && (
          <motion.g
            animate={{
              cx: xScale(currentPoint.angle),
              cy: yScale(currentPoint.transmission),
            }}
            transition={{ duration: 0.1 }}
          >
            <circle
              cx={xScale(currentPoint.angle)}
              cy={yScale(currentPoint.transmission)}
              r="6"
              fill="#22d3ee"
              stroke="white"
              strokeWidth="2"
            />
          </motion.g>
        )}

        {/* Axis labels */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 4}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
        >
          θ₂ ({isZh ? '中间偏振片角度' : 'Middle Polarizer'})
        </text>
        <text
          x={10}
          y={padding.top + chartHeight / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          transform={`rotate(-90, 10, ${padding.top + chartHeight / 2})`}
        >
          I/I₀ (%)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span>
          {isZh ? '最大透射' : 'Max'}: {maxPoint.transmission.toFixed(1)}% @ {maxPoint.angle}°
        </span>
        {showMiddlePolarizer && currentPoint && (
          <span className="text-cyan-400">
            {isZh ? '当前' : 'Current'}: {currentPoint.transmission.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

// ========================================
// Draggable Polarizer Handle
// ========================================
interface DraggablePolarizerProps {
  x: number
  angle: number
  label: string
  color: string
  isActive: boolean
  showLines?: boolean
  onAngleChange?: (angle: number) => void
  draggable?: boolean
}

function DraggablePolarizerVisualizer({
  x,
  angle,
  label,
  color,
  isActive,
  showLines = true,
  onAngleChange,
  draggable = false,
}: DraggablePolarizerProps) {
  const lineCount = 7
  const radius = 35
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef<SVGGElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggable || !onAngleChange) return
    e.preventDefault()
    setIsDragging(true)
  }, [draggable, onAngleChange])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !svgRef.current || !onAngleChange) return

    const svg = svgRef.current.ownerSVGElement
    if (!svg) return

    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgPoint = point.matrixTransform(ctm.inverse())
    const dx = svgPoint.x - x
    const dy = svgPoint.y - 150 // centerY

    let newAngle = Math.atan2(dx, -dy) * (180 / Math.PI)
    newAngle = ((newAngle % 180) + 180) % 180

    // Snap to 5-degree increments
    const snappedAngle = Math.round(newAngle / 5) * 5
    onAngleChange(snappedAngle)
  }, [isDragging, onAngleChange, x])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <g ref={svgRef} transform={`translate(${x}, 150)`}>
      {/* 偏振片框架 */}
      <motion.ellipse
        cx="0"
        cy="0"
        rx={radius}
        ry={radius * 1.2}
        fill={isActive ? `${color}15` : '#1e293b'}
        stroke={isActive ? color : '#475569'}
        strokeWidth={isActive ? 2 : 1}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* 偏振方向线条 */}
      {showLines && (
        <g transform={`rotate(${angle})`}>
          {Array.from({ length: lineCount }, (_, i) => {
            const yOffset = ((i - Math.floor(lineCount / 2)) / (lineCount / 2)) * radius * 0.9
            const xLength = Math.sqrt(radius * radius - yOffset * yOffset) * 0.85
            return (
              <line
                key={i}
                x1={-xLength}
                y1={yOffset}
                x2={xLength}
                y2={yOffset}
                stroke={isActive ? color : '#64748b'}
                strokeWidth={1.5}
                opacity={isActive ? 0.8 : 0.4}
              />
            )
          })}

          {/* 透光轴箭头 */}
          <line x1="0" y1={-radius - 8} x2="0" y2={radius + 8} stroke={color} strokeWidth="2" opacity="0.7" />
          <polygon points="0,-47 -4,-40 4,-40" fill={color} opacity="0.7" />
          <polygon points="0,47 -4,40 4,40" fill={color} opacity="0.7" />
        </g>
      )}

      {/* Draggable handle (外圈) */}
      {draggable && (
        <motion.circle
          cx="0"
          cy="0"
          r={radius + 8}
          fill="transparent"
          stroke={isDragging ? color : 'transparent'}
          strokeWidth="2"
          strokeDasharray="4 2"
          style={{ cursor: 'grab' }}
          onMouseDown={handleMouseDown}
          animate={{ opacity: isDragging ? 1 : 0.3 }}
        />
      )}

      {/* Drag indicator */}
      {draggable && (
        <g transform={`rotate(${angle})`}>
          <motion.circle
            cx="0"
            cy={-radius - 12}
            r="5"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            style={{ cursor: 'grab' }}
            onMouseDown={handleMouseDown}
            animate={{
              scale: isDragging ? 1.3 : 1,
              y: isDragging ? -2 : 0,
            }}
            transition={{ duration: 0.15 }}
          />
        </g>
      )}

      {/* 角度标签 */}
      <text x="0" y={radius + 25} textAnchor="middle" fill="#9ca3af" fontSize="11">
        {label}
      </text>
      <text x="0" y={radius + 40} textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">
        {angle}°
      </text>
    </g>
  )
}

// 预设配置
const PRESETS = [
  { name: 'Crossed (0°-90°)', nameZh: '正交（0°-90°）', p1: 0, p2: null, p3: 90 },
  { name: 'With 45° Middle', nameZh: '加入45°中间片', p1: 0, p2: 45, p3: 90 },
  { name: 'With 30° Middle', nameZh: '加入30°中间片', p1: 0, p2: 30, p3: 90 },
  { name: 'Aligned (All 0°)', nameZh: '全对齐（全0°）', p1: 0, p2: 0, p3: 0 },
]

export function ThreePolarizersDemo() {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  // Haptic audio for precision feedback
  const {
    checkAngle,
    initAudio,
    isAudioEnabled,
    toggleAudio,
  } = useHapticAudio({
    snapAngles: [0, 30, 45, 60, 90, 120, 135, 150, 180],
    angleThreshold: 2.5,
    volume: 0.12,
    pitchVariation: true,
  })

  // Initialize audio on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)
    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [initAudio])

  // 状态
  const [polarizer1Angle, setPolarizer1Angle] = useState(0) // 起偏器
  const [polarizer2Angle, setPolarizer2Angle] = useState<number | null>(45) // 中间偏振片（可选）
  const [polarizer3Angle, setPolarizer3Angle] = useState(90) // 检偏器
  const [showMiddlePolarizer, setShowMiddlePolarizer] = useState(true)
  const [showPolarization, setShowPolarization] = useState(true)
  const [showFormulas, setShowFormulas] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1)
  const [showCurve, setShowCurve] = useState(true)
  const [enableDrag, setEnableDrag] = useState(true)

  // Handle angle changes with haptic feedback
  const handleAngleChange = useCallback((setter: (v: number) => void, value: number) => {
    setter(value)
    checkAngle(value)
  }, [checkAngle])

  // 计算光强 - 使用统一物理引擎
  // Physics: Unpolarized light passes through a chain of polarizers
  // Engine computes: I₁ = I₀/2 (unpolarized→polarized), then cos²(θ) for each subsequent polarizer
  const calculations = useMemo(() => {
    const I0 = 1 // 初始光强
    const pol1 = polarizer1Angle

    // Build polarizer chain based on configuration
    const polarizers = showMiddlePolarizer && polarizer2Angle !== null
      ? [polarizer1Angle, polarizer2Angle, polarizer3Angle]
      : [polarizer1Angle, polarizer3Angle]

    // Use unified physics engine for chain calculation
    // Engine handles: unpolarized input → first polarizer (50%) → Malus for each subsequent
    const chainResult = PolarizationPhysics.polarizerChain(
      polarizers,
      true, // isUnpolarizedInput
      I0
    )

    if (!showMiddlePolarizer || polarizer2Angle === null) {
      // 两偏振片情况
      const angleDiff = Math.abs(polarizer3Angle - polarizer1Angle) % 180
      const normalizedAngleDiff = Math.min(angleDiff, 180 - angleDiff)
      return {
        I0,
        I1: chainResult.stages[0] || 0.5,  // After first polarizer
        I2: null,
        I3: chainResult.intensity,         // Final intensity from engine
        pol1,
        pol2: null,
        pol3: polarizer3Angle,
        theta1: null,
        theta2: normalizedAngleDiff,
        transmission: chainResult.intensity / I0,
      }
    } else {
      // 三偏振片情况
      const angleDiff1 = Math.abs(polarizer2Angle - polarizer1Angle) % 180
      const normalizedAngleDiff1 = Math.min(angleDiff1, 180 - angleDiff1)

      const angleDiff2 = Math.abs(polarizer3Angle - polarizer2Angle) % 180
      const normalizedAngleDiff2 = Math.min(angleDiff2, 180 - angleDiff2)

      return {
        I0,
        I1: chainResult.stages[0] || 0.5,  // After P₁
        I2: chainResult.stages[1] || 0,    // After P₂
        I3: chainResult.intensity,         // Final intensity from engine
        pol1,
        pol2: polarizer2Angle,
        pol3: polarizer3Angle,
        theta1: normalizedAngleDiff1,
        theta2: normalizedAngleDiff2,
        transmission: chainResult.intensity / I0,
      }
    }
  }, [polarizer1Angle, polarizer2Angle, polarizer3Angle, showMiddlePolarizer])

  // 处理预设选择
  const handlePresetSelect = useCallback((index: number) => {
    const preset = PRESETS[index]
    setSelectedPreset(index)
    setPolarizer1Angle(preset.p1)
    setPolarizer3Angle(preset.p3)
    if (preset.p2 !== null) {
      setShowMiddlePolarizer(true)
      setPolarizer2Angle(preset.p2)
    } else {
      setShowMiddlePolarizer(false)
      setPolarizer2Angle(null)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* 可视化区域 */}
        <div className="flex-1">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-xl border border-blue-500/20 p-4 overflow-hidden">
            <svg viewBox="0 0 700 320" className="w-full h-auto" style={{ minHeight: '300px' }}>
              <defs>
                <pattern id="three-pol-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(100,150,255,0.05)"
                    strokeWidth="1"
                  />
                </pattern>
                <filter id="beam-glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="700" height="320" fill="url(#three-pol-grid)" />

              {/* 标题 */}
              <text x="350" y="25" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">
                {isZh ? '三偏振片实验' : 'Three Polarizer Experiment'}
              </text>

              {/* 光源 */}
              <g transform="translate(50, 150)">
                <motion.circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="#ffd700"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <circle cx="0" cy="0" r="15" fill="#fff" opacity="0.5" />
                <text x="0" y="45" textAnchor="middle" fill="#9ca3af" fontSize="11">
                  {isZh ? '非偏振光' : 'Unpolarized'}
                </text>
                <text x="0" y="60" textAnchor="middle" fill="#ffd700" fontSize="11">
                  I₀ = 100%
                </text>
              </g>

              {/* 光束段 */}
              {/* 光源到P1 */}
              <LightBeam
                x1={70}
                x2={130}
                intensity={calculations.I0}
                polarization={0}
                showPolarization={false}
              />

              {/* P1到P2或P3 */}
              <LightBeam
                x1={200}
                x2={showMiddlePolarizer ? 280 : 430}
                intensity={calculations.I1}
                polarization={calculations.pol1}
                showPolarization={showPolarization}
              />

              {/* P2到P3（如果有中间偏振片） */}
              {showMiddlePolarizer && calculations.I2 !== null && (
                <LightBeam
                  x1={350}
                  x2={430}
                  intensity={calculations.I2}
                  polarization={calculations.pol2 || 0}
                  showPolarization={showPolarization}
                />
              )}

              {/* P3后 */}
              <LightBeam
                x1={500}
                x2={650}
                intensity={calculations.I3}
                polarization={calculations.pol3}
                showPolarization={showPolarization}
              />

              {/* 偏振片1（起偏器） - Draggable */}
              <DraggablePolarizerVisualizer
                x={165}
                angle={polarizer1Angle}
                label={isZh ? '起偏器 P₁' : 'Polarizer P₁'}
                color="#22d3ee"
                isActive={true}
                draggable={enableDrag}
                onAngleChange={(angle) => {
                  setPolarizer1Angle(angle)
                  checkAngle(angle)
                  setSelectedPreset(null)
                }}
              />

              {/* 偏振片2（中间）- Draggable */}
              <AnimatePresence>
                {showMiddlePolarizer && polarizer2Angle !== null && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DraggablePolarizerVisualizer
                      x={315}
                      angle={polarizer2Angle}
                      label={isZh ? '中间片 P₂' : 'Middle P₂'}
                      color="#fbbf24"
                      isActive={true}
                      draggable={enableDrag}
                      onAngleChange={(angle) => {
                        setPolarizer2Angle(angle)
                        checkAngle(angle)
                        setSelectedPreset(null)
                      }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* 偏振片3（检偏器）- Draggable */}
              <DraggablePolarizerVisualizer
                x={465}
                angle={polarizer3Angle}
                label={isZh ? '检偏器 P₃' : 'Analyzer P₃'}
                color="#4ade80"
                isActive={true}
                draggable={enableDrag}
                onAngleChange={(angle) => {
                  setPolarizer3Angle(angle)
                  checkAngle(angle)
                  setSelectedPreset(null)
                }}
              />

              {/* 探测器 */}
              <g transform="translate(610, 150)">
                <rect
                  x="-20"
                  y="-25"
                  width="40"
                  height="50"
                  rx="4"
                  fill={calculations.I3 > 0.01 ? '#22c55e20' : '#1e293b'}
                  stroke={calculations.I3 > 0.01 ? '#22c55e' : '#475569'}
                  strokeWidth="2"
                />
                <text x="0" y="45" textAnchor="middle" fill="#9ca3af" fontSize="11">
                  {isZh ? '探测器' : 'Detector'}
                </text>
                <text x="0" y="60" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="bold">
                  {(calculations.transmission * 100).toFixed(1)}%
                </text>
              </g>

              {/* 光强标注 */}
              <g>
                <text x="165" y="90" textAnchor="middle" fill="#22d3ee" fontSize="10">
                  I₁ = 50%
                </text>

                {showMiddlePolarizer && calculations.I2 !== null && (
                  <text x="315" y="90" textAnchor="middle" fill="#fbbf24" fontSize="10">
                    I₂ = {(calculations.I2 * 100).toFixed(1)}%
                  </text>
                )}

                <text x="465" y="90" textAnchor="middle" fill="#4ade80" fontSize="10">
                  I₃ = {(calculations.I3 * 100).toFixed(1)}%
                </text>
              </g>

              {/* 角度差标注 */}
              {showFormulas && (
                <g>
                  {showMiddlePolarizer && calculations.theta1 !== null && (
                    <>
                      <path
                        d="M 200 240 Q 240 260 280 240"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                      />
                      <text x="240" y="275" textAnchor="middle" fill="#fbbf24" fontSize="10">
                        θ₁ = {calculations.theta1}°
                      </text>
                    </>
                  )}

                  <path
                    d={
                      showMiddlePolarizer
                        ? 'M 350 240 Q 390 260 430 240'
                        : 'M 200 240 Q 315 280 430 240'
                    }
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={showMiddlePolarizer ? 390 : 315}
                    y={showMiddlePolarizer ? 275 : 295}
                    textAnchor="middle"
                    fill="#4ade80"
                    fontSize="10"
                  >
                    θ₂ = {calculations.theta2}°
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* 数值面板 */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatedValue
              label={isZh ? '初始光强 I₀' : 'Initial I₀'}
              value={100}
              unit="%"
              decimals={0}
              color="orange"
              showBar
              max={100}
            />
            <AnimatedValue
              label={isZh ? 'P₁后光强 I₁' : 'After P₁ I₁'}
              value={calculations.I1 * 100}
              unit="%"
              decimals={1}
              color="cyan"
              showBar
              max={100}
            />
            {showMiddlePolarizer && calculations.I2 !== null && (
              <AnimatedValue
                label={isZh ? 'P₂后光强 I₂' : 'After P₂ I₂'}
                value={calculations.I2 * 100}
                unit="%"
                decimals={1}
                color="orange"
                showBar
                max={100}
              />
            )}
            <AnimatedValue
              label={isZh ? '最终透射率' : 'Final Transmission'}
              value={calculations.transmission * 100}
              unit="%"
              decimals={1}
              color="green"
              showBar
              max={100}
            />
          </div>

          {/* Real-time I-θ Curve */}
          {showCurve && (
            <div className="mt-4">
              <MalusCurve
                polarizer1Angle={polarizer1Angle}
                polarizer2Angle={polarizer2Angle}
                polarizer3Angle={polarizer3Angle}
                showMiddlePolarizer={showMiddlePolarizer}
                currentMiddleAngle={polarizer2Angle ?? 45}
                isZh={isZh}
              />
            </div>
          )}
        </div>

        {/* 控制面板 */}
        <div className="w-full lg:w-80 space-y-4">
          <ControlPanel title={isZh ? '预设实验' : 'Preset Experiments'}>
            <PresetButtons
              options={PRESETS.map((p, i) => ({
                value: i,
                label: isZh ? p.nameZh : p.name,
              }))}
              value={selectedPreset ?? -1}
              onChange={(v) => handlePresetSelect(v as number)}
              columns={2}
            />
          </ControlPanel>

          <ControlPanel title={isZh ? '偏振片角度' : 'Polarizer Angles'}>
            <SliderControl
              label={isZh ? '起偏器 P₁' : 'Polarizer P₁'}
              value={polarizer1Angle}
              min={0}
              max={180}
              step={5}
              unit="°"
              onChange={(v) => {
                handleAngleChange(setPolarizer1Angle, v)
                setSelectedPreset(null)
              }}
              color="cyan"
            />

            <div className="space-y-2">
              <Toggle
                label={isZh ? '启用中间偏振片 P₂' : 'Enable Middle Polarizer P₂'}
                checked={showMiddlePolarizer}
                onChange={(v) => {
                  setShowMiddlePolarizer(v)
                  if (v && polarizer2Angle === null) {
                    setPolarizer2Angle(45)
                  }
                  setSelectedPreset(null)
                }}
              />

              {showMiddlePolarizer && polarizer2Angle !== null && (
                <SliderControl
                  label={isZh ? '中间片 P₂' : 'Middle P₂'}
                  value={polarizer2Angle}
                  min={0}
                  max={180}
                  step={5}
                  unit="°"
                  onChange={(v) => {
                    handleAngleChange((val) => setPolarizer2Angle(val), v)
                    setSelectedPreset(null)
                  }}
                  color="orange"
                />
              )}
            </div>

            <SliderControl
              label={isZh ? '检偏器 P₃' : 'Analyzer P₃'}
              value={polarizer3Angle}
              min={0}
              max={180}
              step={5}
              unit="°"
              onChange={(v) => {
                handleAngleChange(setPolarizer3Angle, v)
                setSelectedPreset(null)
              }}
              color="green"
            />
          </ControlPanel>

          <ControlPanel title={isZh ? '显示选项' : 'Display Options'}>
            <Toggle
              label={isZh ? '显示偏振颜色' : 'Show Polarization Colors'}
              checked={showPolarization}
              onChange={setShowPolarization}
            />
            <Toggle
              label={isZh ? '显示公式标注' : 'Show Formula Annotations'}
              checked={showFormulas}
              onChange={setShowFormulas}
            />
            <Toggle
              label={isZh ? '显示透射率曲线' : 'Show I-θ Curve'}
              checked={showCurve}
              onChange={setShowCurve}
            />
            <Toggle
              label={isZh ? '拖拽旋转偏振片' : 'Drag to Rotate Polarizers'}
              checked={enableDrag}
              onChange={setEnableDrag}
            />

            {/* Audio Feedback Toggle */}
            <div className="pt-2 border-t border-slate-700/50 mt-2">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
                  isAudioEnabled
                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                }`}
                title={isZh ? '切换精密角度音效反馈' : 'Toggle precision angle audio feedback'}
              >
                {isAudioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span>{isZh ? '角度咔哒声' : 'Angle Clicks'}</span>
              </button>
            </div>
          </ControlPanel>

          {showFormulas && (
            <InfoCard title={isZh ? '马吕斯定律' : "Malus's Law"} color="cyan">
              <Formula highlight>I = I₀ × cos²(θ)</Formula>
              <div className="mt-3 space-y-2 text-xs text-slate-400">
                {showMiddlePolarizer ? (
                  <>
                    <p>
                      {isZh ? '三偏振片计算：' : 'Three polarizers:'}
                    </p>
                    <p className="font-mono text-cyan-400">
                      I₁ = I₀ × 0.5 = 50%
                    </p>
                    <p className="font-mono text-orange-400">
                      I₂ = I₁ × cos²({calculations.theta1}°) = {((calculations.I2 || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="font-mono text-green-400">
                      I₃ = I₂ × cos²({calculations.theta2}°) = {(calculations.I3 * 100).toFixed(1)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {isZh ? '两偏振片计算：' : 'Two polarizers:'}
                    </p>
                    <p className="font-mono text-cyan-400">
                      I₁ = I₀ × 0.5 = 50%
                    </p>
                    <p className="font-mono text-green-400">
                      I₃ = I₁ × cos²({calculations.theta2}°) = {(calculations.I3 * 100).toFixed(1)}%
                    </p>
                  </>
                )}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      {/* 知识卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title={isZh ? '三偏振片悖论' : 'Three Polarizer Paradox'} color="purple">
          <ul className="text-xs text-gray-300 space-y-1.5">
            <li>
              •{' '}
              {isZh
                ? '两个正交（90°）偏振片完全阻挡光线'
                : 'Two crossed (90°) polarizers completely block light'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '在中间插入45°偏振片，反而有光通过！'
                : 'Adding a 45° polarizer in between allows light through!'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '每个偏振片都会改变光的偏振方向'
                : 'Each polarizer changes the polarization direction'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '最大透射率：0°→45°→90° = 12.5%'
                : 'Maximum transmission: 0°→45°→90° = 12.5%'}
            </li>
          </ul>
        </InfoCard>

        <InfoCard title={isZh ? '物理解释' : 'Physical Explanation'} color="cyan">
          <ul className="text-xs text-gray-300 space-y-1.5">
            <li>
              •{' '}
              {isZh
                ? '偏振片不只是"过滤"，还会"重新定向"光的偏振'
                : 'Polarizers don\'t just filter - they reorient polarization'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '经过偏振片后，光的偏振方向变为偏振片的透光轴方向'
                : 'After a polarizer, light is polarized along the filter axis'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '中间偏振片将0°偏振光转为45°偏振光'
                : 'Middle polarizer converts 0° polarized light to 45°'}
            </li>
            <li>
              •{' '}
              {isZh
                ? '45°偏振光可以部分通过90°偏振片'
                : '45° polarized light can partially pass through 90° polarizer'}
            </li>
          </ul>
        </InfoCard>
      </div>
    </div>
  )
}
