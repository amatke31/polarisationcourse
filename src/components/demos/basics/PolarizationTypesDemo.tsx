/**
 * Polarization Types Demo - 偏振类型演示
 * 展示线偏振、圆偏振、椭圆偏振（SVG + Framer Motion）
 */
import { useState, useRef, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SliderControl, ControlPanel, InfoCard } from '../DemoControls'

// 3D波动传播视图 - 伪3D等轴测投影Canvas
function WavePropagation3DCanvas({
  phaseDiff,
  ampX,
  ampY,
  animate,
}: {
  phaseDiff: number
  ampX: number
  ampY: number
  animate: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 500
    const height = 300
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const axisY = height / 2
    const k = 0.05 // 波数
    const speed = 0.1
    const scale = 40
    // 投影因子 - 产生伪3D效果
    const slantX = 0.5 // 深度移动X
    const slantY = -0.3 // 深度移动Y

    const draw = () => {
      // 清除画布
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)

      const t = timeRef.current * speed
      const phaseRad = (phaseDiff * Math.PI) / 180

      // 绘制传播方向轴（灰色）
      ctx.beginPath()
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.moveTo(20, axisY)
      ctx.lineTo(width - 20, axisY)
      ctx.stroke()

      // Ex 分量 (红色) - 在伪3D空间中的"水平"方向
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.6)'
      ctx.lineWidth = 2
      for (let i = 0; i < width - 40; i += 2) {
        const val = ampX * Math.cos(k * i - t)
        const sx = 20 + i + val * scale * slantX
        const sy = axisY + val * scale * slantY
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.stroke()

      // Ey 分量 (绿色) - 垂直方向
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(68, 255, 68, 0.6)'
      ctx.lineWidth = 2
      for (let i = 0; i < width - 40; i += 2) {
        const val = ampY * Math.cos(k * i - t + phaseRad)
        const sx = 20 + i
        const sy = axisY - val * scale
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.stroke()

      // 合成矢量轨迹 (黄色) - 螺旋路径
      ctx.beginPath()
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 2.5
      for (let i = 0; i < width - 40; i++) {
        const valX = ampX * Math.cos(k * i - t)
        const valY = ampY * Math.cos(k * i - t + phaseRad)
        const sx = 20 + i + valX * scale * slantX
        const sy = axisY + valX * scale * slantY - valY * scale
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.stroke()

      // 绘制矢量箭头 - 帮助可视化
      for (let i = 0; i < width - 40; i += 60) {
        const valX = ampX * Math.cos(k * i - t)
        const valY = ampY * Math.cos(k * i - t + phaseRad)
        const sx = 20 + i + valX * scale * slantX
        const sy = axisY + valX * scale * slantY - valY * scale
        const originX = 20 + i
        const originY = axisY

        // 矢量线
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)'
        ctx.lineWidth = 1
        ctx.moveTo(originX, originY)
        ctx.lineTo(sx, sy)
        ctx.stroke()

        // 矢量端点
        ctx.beginPath()
        ctx.fillStyle = '#ffff00'
        ctx.arc(sx, sy, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // 轴标签
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText('传播方向 Z', width - 80, axisY + 20)

      // 图例
      ctx.fillStyle = '#ff4444'
      ctx.fillRect(20, 20, 12, 12)
      ctx.fillStyle = '#e0e0e0'
      ctx.fillText('Ex (水平)', 38, 30)

      ctx.fillStyle = '#44ff44'
      ctx.fillRect(20, 38, 12, 12)
      ctx.fillStyle = '#e0e0e0'
      ctx.fillText('Ey (垂直)', 38, 48)

      ctx.fillStyle = '#ffff00'
      ctx.fillRect(20, 56, 12, 12)
      ctx.fillStyle = '#e0e0e0'
      ctx.fillText('E (合成)', 38, 66)

      if (animate) {
        timeRef.current += 1
      }
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phaseDiff, ampX, ampY, animate])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-cyan-400/20 w-full"
      style={{ maxWidth: 500, height: 300 }}
    />
  )
}

// 2D偏振态投影Canvas
function PolarizationStateCanvas({
  phaseDiff,
  ampX,
  ampY,
  animate,
}: {
  phaseDiff: number
  ampX: number
  ampY: number
  animate: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 300
    const height = 300
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const cx = width / 2
    const cy = height / 2
    const radius = 100
    const phaseRad = (phaseDiff * Math.PI) / 180

    const draw = () => {
      // 清除画布
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)

      // 绘制坐标轴
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx, 20)
      ctx.lineTo(cx, height - 20)
      ctx.moveTo(20, cy)
      ctx.lineTo(width - 20, cy)
      ctx.stroke()

      // 轴标签
      ctx.fillStyle = '#64748b'
      ctx.font = '12px sans-serif'
      ctx.fillText('Ex', width - 30, cy - 10)
      ctx.fillText('Ey', cx + 10, 30)

      // 绘制偏振椭圆轨迹
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)'
      ctx.lineWidth = 2
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const px = ampX * Math.cos(a) * radius
        const py = ampY * Math.cos(a + phaseRad) * radius
        if (a === 0) ctx.moveTo(cx + px, cy - py)
        else ctx.lineTo(cx + px, cy - py)
      }
      ctx.closePath()
      ctx.stroke()

      // 当前矢量位置
      const phase = -timeRef.current * 0.05
      const vecX = ampX * Math.cos(phase) * radius
      const vecY = ampY * Math.cos(phase + phaseRad) * radius

      // 绘制当前矢量
      ctx.beginPath()
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 3
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + vecX, cy - vecY)
      ctx.stroke()

      // 矢量端点
      ctx.beginPath()
      ctx.fillStyle = '#ffff00'
      ctx.arc(cx + vecX, cy - vecY, 6, 0, Math.PI * 2)
      ctx.fill()

      // Ex分量指示
      ctx.beginPath()
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.moveTo(cx, cy + 120)
      ctx.lineTo(cx + vecX, cy + 120)
      ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = '#ff4444'
      ctx.arc(cx + vecX, cy + 120, 4, 0, Math.PI * 2)
      ctx.fill()

      // Ey分量指示
      ctx.beginPath()
      ctx.strokeStyle = '#44ff44'
      ctx.lineWidth = 2
      ctx.moveTo(cx - 120, cy)
      ctx.lineTo(cx - 120, cy - vecY)
      ctx.stroke()
      ctx.beginPath()
      ctx.fillStyle = '#44ff44'
      ctx.arc(cx - 120, cy - vecY, 4, 0, Math.PI * 2)
      ctx.fill()

      // 图例
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px sans-serif'
      ctx.fillText('Ex分量', cx + 50, cy + 135)
      ctx.fillText('Ey分量', 15, cy - 100)

      if (animate) {
        timeRef.current += 1
      }
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phaseDiff, ampX, ampY, animate])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-cyan-400/20"
      style={{ width: 300, height: 300 }}
    />
  )
}

// 偏振态类型判断
function getPolarizationState(
  phaseDiff: number,
  ampX: number,
  ampY: number
): { type: string; color: string; description: string } {
  const normalizedPhase = ((phaseDiff % 360) + 360) % 360

  if (ampX < 0.05 || ampY < 0.05) {
    return {
      type: '线偏振 (单轴)',
      color: '#ff4444',
      description: '只有一个分量振动，光沿单一方向振动',
    }
  }

  if (
    Math.abs(ampX - ampY) < 0.1 &&
    (Math.abs(normalizedPhase - 90) < 5 || Math.abs(normalizedPhase - 270) < 5)
  ) {
    const direction = Math.abs(normalizedPhase - 90) < 5 ? '右旋' : '左旋'
    return {
      type: `${direction}圆偏振`,
      color: '#44ff44',
      description: '电场矢量沿圆轨迹旋转，产生螺旋传播',
    }
  }

  if (
    normalizedPhase < 5 ||
    Math.abs(normalizedPhase - 180) < 5 ||
    Math.abs(normalizedPhase - 360) < 5
  ) {
    return {
      type: '线偏振',
      color: '#ffaa00',
      description: '两分量同相或反相，矢量沿直线振动',
    }
  }

  return {
    type: '椭圆偏振',
    color: '#a78bfa',
    description: '最一般的偏振态，电场矢量沿椭圆轨迹旋转',
  }
}

type PolarizationType = 'linear' | 'circular' | 'elliptical' | 'wave-propagation'

export function PolarizationTypesDemo() {
  const { t } = useTranslation()
  const [polarizationType, setPolarizationType] = useState<PolarizationType>('linear')
  const [linearAngle, setLinearAngle] = useState(45)
  const [ellipseRatio, setEllipseRatio] = useState(0.5)
  const [circularDirection, setCircularDirection] = useState<'right' | 'left'>('right')
  const [animationSpeed, setAnimationSpeed] = useState(0.5)
  const [showTrail, setShowTrail] = useState(true)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [phaseDiff, setPhaseDiff] = useState(0)
  const [ampX, setAmpX] = useState(1)
  const [ampY, setAmpY] = useState(1)

  // 动画循环
  useEffect(() => {
    if (!isPlaying || animationSpeed === 0) return

    const interval = setInterval(() => {
      setTime(t => t + 0.05 * animationSpeed)
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, animationSpeed])

  // 计算当前电场位置
  const { ex, ey, trailPath } = useMemo(() => {
    const radius = 100
    const phase = time * 2
    let ex = 0, ey = 0
    const trailPoints: string[] = []

    if (polarizationType === 'linear') {
      const angleRad = (linearAngle * Math.PI) / 180
      const oscillation = Math.sin(phase)
      ex = radius * Math.cos(angleRad) * oscillation
      ey = -radius * Math.sin(angleRad) * oscillation

      // 轨迹
      for (let t = 0; t < 100; t++) {
        const p = (time - t * 0.01) * 2
        const osc = Math.sin(p)
        trailPoints.push(`${200 + radius * Math.cos(angleRad) * osc},${200 - radius * Math.sin(angleRad) * osc}`)
      }
    } else if (polarizationType === 'circular') {
      const direction = circularDirection === 'right' ? 1 : -1
      ex = radius * Math.cos(phase)
      ey = -radius * Math.sin(phase * direction)

      // 轨迹
      for (let t = 0; t < 100; t++) {
        const p = (time - t * 0.01) * 2
        trailPoints.push(`${200 + radius * Math.cos(p)},${200 - radius * Math.sin(p * direction)}`)
      }
    } else {
      const direction = circularDirection === 'right' ? 1 : -1
      ex = radius * Math.cos(phase)
      ey = -radius * ellipseRatio * Math.sin(phase * direction)

      // 轨迹
      for (let t = 0; t < 100; t++) {
        const p = (time - t * 0.01) * 2
        trailPoints.push(`${200 + radius * Math.cos(p)},${200 - radius * ellipseRatio * Math.sin(p * direction)}`)
      }
    }

    return {
      ex: 200 + ex,
      ey: 200 + ey,
      trailPath: `M ${trailPoints.join(' L ')}`,
    }
  }, [time, polarizationType, linearAngle, ellipseRatio, circularDirection])

  // 参考形状路径
  const referencePath = useMemo(() => {
    const radius = 100
    if (polarizationType === 'linear') {
      const angleRad = (linearAngle * Math.PI) / 180
      const x1 = 200 - radius * Math.cos(angleRad)
      const y1 = 200 + radius * Math.sin(angleRad)
      const x2 = 200 + radius * Math.cos(angleRad)
      const y2 = 200 - radius * Math.sin(angleRad)
      return `M ${x1},${y1} L ${x2},${y2}`
    } else if (polarizationType === 'circular') {
      return `M 300,200 A 100,100 0 1,1 299.99,200`
    } else {
      const ry = radius * ellipseRatio
      return `M 300,200 A 100,${ry} 0 1,1 299.99,200`
    }
  }, [polarizationType, linearAngle, ellipseRatio])

  const getTypeLabel = (type: PolarizationType) => {
    if (type === 'linear') {
      return t('demoUi.common.linearPolarization')
    } else if (type === 'circular') {
      return circularDirection === 'right' ? t('demoUi.common.rightCircularPol') : t('demoUi.common.leftCircularPol')
    } else {
      return t('demoUi.common.ellipticalPolarization')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* 可视化区域 */}
        <div className="flex-1">
          {polarizationType === 'wave-propagation' ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 3D 波动传播视图 */}
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-cyan-400/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-cyan-400/10 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">3D 空间传播视图</h3>
                  <div className="text-xs text-gray-500">伪等轴测投影</div>
                </div>
                <div className="p-4 flex justify-center">
                  <WavePropagation3DCanvas
                    phaseDiff={phaseDiff}
                    ampX={ampX}
                    ampY={ampY}
                    animate={isPlaying}
                  />
                </div>
              </div>

              {/* 2D 偏振态投影 */}
              <div className="lg:w-[360px] bg-slate-900/50 rounded-xl border border-cyan-400/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-cyan-400/10">
                  <h3 className="text-sm font-semibold text-white">偏振态投影</h3>
                </div>
                <div className="p-4 flex flex-col items-center gap-3">
                  <PolarizationStateCanvas
                    phaseDiff={phaseDiff}
                    ampX={ampX}
                    ampY={ampY}
                    animate={isPlaying}
                  />
                  <div className="text-center space-y-1">
                    <div>
                      <span className="text-gray-400 text-sm">当前状态: </span>
                      <span className="font-semibold" style={{ color: getPolarizationState(phaseDiff, ampX, ampY).color }}>
                        {getPolarizationState(phaseDiff, ampX, ampY).type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{getPolarizationState(phaseDiff, ampX, ampY).description}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-xl border border-indigo-500/20 p-4">
              <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[400px] mx-auto">
                <defs>
                  {/* 发光滤镜 */}
                  <filter id="glow-cyan">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  {/* 渐变 */}
                  <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                {/* 坐标轴 */}
                <line x1="70" y1="200" x2="330" y2="200" stroke="#4b5563" strokeWidth="1.5" />
                <line x1="200" y1="70" x2="200" y2="330" stroke="#4b5563" strokeWidth="1.5" />

                {/* 箭头 */}
                <polygon points="330,200 320,195 320,205" fill="#4b5563" />
                <polygon points="200,70 195,80 205,80" fill="#4b5563" />

                {/* 轴标签 */}
                <text x="340" y="205" fill="#9ca3af" fontSize="14">Ex</text>
                <text x="205" y="60" fill="#9ca3af" fontSize="14">Ey</text>

                {/* 参考形状（虚线） */}
                <path
                  d={referencePath}
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />

                {/* 轨迹 */}
                {showTrail && (
                  <motion.path
                    d={trailPath}
                    fill="none"
                    stroke="url(#trail-gradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  />
                )}

                {/* 电场矢量 */}
                <motion.line
                  x1="200"
                  y1="200"
                  x2={ex}
                  y2={ey}
                  stroke="#22d3ee"
                  strokeWidth="3"
                  filter="url(#glow-cyan)"
                />

                {/* 箭头 */}
                <motion.g
                  style={{
                    transformOrigin: `${ex}px ${ey}px`,
                  }}
                >
                  <circle cx={ex} cy={ey} r="6" fill="#22d3ee" filter="url(#glow-cyan)" />
                </motion.g>

                {/* 当前点 */}
                <motion.circle
                  cx={ex}
                  cy={ey}
                  r="4"
                  fill="#fbbf24"
                  filter="url(#glow-cyan)"
                />

                {/* 中心点 */}
                <circle cx="200" cy="200" r="4" fill="#9ca3af" />

                {/* 类型标签 */}
                <text x="20" y="30" fill="#9ca3af" fontSize="14">{getTypeLabel(polarizationType)}</text>

                {/* 相位显示 */}
                <text x="320" y="30" fill="#6b7280" fontSize="12">
                  φ = {((time * 2 * 180 / Math.PI) % 360).toFixed(0)}°
                </text>
              </svg>
            </div>
          )}

          {/* 类型选择器 */}
          <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('demoUi.common.polarizationType')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['linear', 'circular', 'elliptical', 'wave-propagation'] as PolarizationType[]).map((type) => {
                const colors = {
                  linear: { active: 'bg-orange-400/20 border-orange-400/50 text-orange-400', inactive: 'hover:border-orange-400/30' },
                  circular: { active: 'bg-green-400/20 border-green-400/50 text-green-400', inactive: 'hover:border-green-400/30' },
                  elliptical: { active: 'bg-purple-400/20 border-purple-400/50 text-purple-400', inactive: 'hover:border-purple-400/30' },
                  'wave-propagation': { active: 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400', inactive: 'hover:border-cyan-400/30' },
                }
                const labels = {
                  linear: t('demoUi.common.linearPolarization'),
                  circular: t('demoUi.common.circularPolarization'),
                  elliptical: t('demoUi.common.ellipticalPolarization'),
                  'wave-propagation': '波动传播视图'
                }

                return (
                  <motion.button
                    key={type}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                      polarizationType === type
                        ? colors[type].active
                        : `bg-slate-700/50 text-gray-400 border-slate-600/50 ${colors[type].inactive}`
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPolarizationType(type)}
                  >
                    {labels[type]}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <ControlPanel title={t('demoUi.common.parameters')} className="w-full lg:w-72">
          {/* 条件控件 */}
          {polarizationType === 'linear' && (
            <SliderControl
              label={t('demoUi.common.polarizationAngle')}
              value={linearAngle}
              min={0}
              max={180}
              step={15}
              unit="°"
              onChange={setLinearAngle}
              color="orange"
            />
          )}

          {(polarizationType === 'circular' || polarizationType === 'elliptical') && (
            <div className="space-y-2">
              <span className="text-xs text-gray-400">{t('demoUi.common.rotationDirection')}</span>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    circularDirection === 'right'
                      ? 'bg-green-400/20 text-green-400 border-green-400/50'
                      : 'bg-slate-700/50 text-gray-400 border-slate-600/50 hover:border-green-400/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCircularDirection('right')}
                >
                  {t('demoUi.common.rightRotation')}
                </motion.button>
                <motion.button
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    circularDirection === 'left'
                      ? 'bg-purple-400/20 text-purple-400 border-purple-400/50'
                      : 'bg-slate-700/50 text-gray-400 border-slate-600/50 hover:border-purple-400/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCircularDirection('left')}
                >
                  {t('demoUi.common.leftRotation')}
                </motion.button>
              </div>
            </div>
          )}

          {polarizationType === 'elliptical' && (
            <SliderControl
              label={t('demoUi.common.ellipseRatio')}
              value={ellipseRatio}
              min={0.1}
              max={0.9}
              step={0.1}
              onChange={setEllipseRatio}
              color="purple"
            />
          )}

          {polarizationType === 'wave-propagation' && (
            <div className="space-y-4">
              <SliderControl
                label="相位差 (δ)"
                value={phaseDiff}
                min={0}
                max={360}
                step={5}
                unit="°"
                onChange={setPhaseDiff}
                color="purple"
              />
              <SliderControl
                label="Ex 振幅"
                value={ampX}
                min={0}
                max={1}
                step={0.1}
                onChange={setAmpX}
                formatValue={(v) => v.toFixed(1)}
                color="red"
              />
              <SliderControl
                label="Ey 振幅"
                value={ampY}
                min={0}
                max={1}
                step={0.1}
                onChange={setAmpY}
                formatValue={(v) => v.toFixed(1)}
                color="green"
              />
            </div>
          )}

          <SliderControl
            label={t('demoUi.common.animationSpeed')}
            value={animationSpeed}
            min={0}
            max={2}
            step={0.25}
            onChange={setAnimationSpeed}
            color="cyan"
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrail}
                onChange={(e) => setShowTrail(e.target.checked)}
                className="rounded border-gray-600 bg-slate-700 text-cyan-400"
              />
              <span className="text-sm text-gray-300">{t('demoUi.common.showTrail')}</span>
            </label>
          </div>

          <motion.button
            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
              isPlaying
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? t('demoUi.common.pause') : t('demoUi.common.play')}
          </motion.button>

          {/* 物理意义 */}
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <h4 className="text-sm font-semibold text-gray-300">{t('demoUi.common.physicalMeaning')}</h4>
            <div className="text-xs text-gray-400 space-y-1">
              {polarizationType === 'linear' && (
                <p>{t('demoUi.polarizationTypes.linearPhysics')}</p>
              )}
              {polarizationType === 'circular' && (
                <p>{t('demoUi.polarizationTypes.circularPhysics')}</p>
              )}
              {polarizationType === 'elliptical' && (
                <p>{t('demoUi.polarizationTypes.ellipticalPhysics')}</p>
              )}
              {polarizationType === 'wave-propagation' && (
                <div className="space-y-2">
                  <p>偏振态由两个互相垂直的电场分量 (Ex, Ey) 的振幅比和相位差(δ)决定。</p>
                  <p>当 δ = 90° 且 Ex = Ey 时，合成矢量画出圆（圆偏振）。</p>
                  <p>当 δ = 0° 或 180° 时，合成矢量画出直线（线偏振）。</p>
                </div>
              )}
            </div>
          </div>
        </ControlPanel>
      </div>

      {/* 快速预设 */}
      {polarizationType === 'wave-propagation' && (
        <div className="bg-slate-900/50 rounded-xl border border-cyan-400/20 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">快速预设</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: '水平线偏振', params: { phase: 0, ax: 1, ay: 0 }, color: '#ff4444' },
              { label: '45°线偏振', params: { phase: 0, ax: 1, ay: 1 }, color: '#ffaa00' },
              { label: '右旋圆偏振', params: { phase: 90, ax: 1, ay: 1 }, color: '#44ff44' },
              { label: '左旋圆偏振', params: { phase: 270, ax: 1, ay: 1 }, color: '#22d3ee' },
              { label: '椭圆偏振', params: { phase: 45, ax: 1, ay: 0.6 }, color: '#a78bfa' }
            ].map((preset) => (
              <motion.button
                key={preset.label}
                className="px-3 py-2 rounded-lg text-sm font-medium border transition-all bg-slate-700/50 text-gray-400 border-slate-600/50 hover:border-slate-500"
                style={{
                  backgroundColor: `${preset.color}20`,
                  borderColor: `${preset.color}80`,
                  color: preset.color,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPhaseDiff(preset.params.phase)
                  setAmpX(preset.params.ax)
                  setAmpY(preset.params.ay)
                }}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          title={t('demoUi.common.linearPolarization')}
          color={polarizationType === 'linear' ? 'orange' : 'cyan'}
        >
          <p className="text-xs text-gray-300">
            {t('demoUi.polarizationTypes.linearDesc')}
          </p>
        </InfoCard>
        <InfoCard
          title={t('demoUi.common.circularPolarization')}
          color={polarizationType === 'circular' ? 'green' : 'cyan'}
        >
          <p className="text-xs text-gray-300">
            {t('demoUi.polarizationTypes.circularDesc')}
          </p>
        </InfoCard>
        <InfoCard
          title={t('demoUi.common.ellipticalPolarization')}
          color={polarizationType === 'elliptical' ? 'purple' : 'cyan'}
        >
          <p className="text-xs text-gray-300">
            {t('demoUi.polarizationTypes.ellipticalDesc')}
          </p>
        </InfoCard>
      </div>
    </div>
  )
}
