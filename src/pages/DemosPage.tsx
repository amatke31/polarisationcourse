/**
 * Demos Page - Interactive physics demonstrations for 5 units + Optical Basics
 * Enhanced with i18n, theme support, and improved interactivity indicators
 */
import { useState, useEffect, Suspense, ReactNode, memo } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { DemoErrorBoundary } from '@/components/demos/DemoErrorBoundary'
import { LanguageThemeSwitcher } from '@/components/ui/LanguageThemeSwitcher'
import { Gamepad2, BookOpen, Box, BarChart2, Menu, X, ChevronDown, ChevronRight, Lightbulb, HelpCircle, Search, GraduationCap, ArrowLeft } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PersistentHeader } from '@/components/shared/PersistentHeader'
import { SEO } from '@/components/shared/SEO'

// Demo components
import { MalusLawDemo } from '@/components/demos/unit1/MalusLawDemo'
import { BirefringenceDemo } from '@/components/demos/unit1/BirefringenceDemo'
import { WaveplateDemo } from '@/components/demos/unit1/WaveplateDemo'
import { PolarizationStateDemo } from '@/components/demos/unit1/PolarizationStateDemo'
import { FresnelDemo } from '@/components/demos/unit2/FresnelDemo'
import { BrewsterDemo } from '@/components/demos/unit2/BrewsterDemo'
import { ChromaticDemo } from '@/components/demos/unit3/ChromaticDemo'
import { OpticalRotationDemo } from '@/components/demos/unit3/OpticalRotationDemo'
import { AnisotropyDemo } from '@/components/demos/unit3/AnisotropyDemo'
import { MieScatteringDemo } from '@/components/demos/unit4/MieScatteringDemo'
import { RayleighScatteringDemo } from '@/components/demos/unit4/RayleighScatteringDemo'
import { MonteCarloScatteringDemo } from '@/components/demos/unit4/MonteCarloScatteringDemo'
import { StokesVectorDemo } from '@/components/demos/unit5/StokesVectorDemo'
import { MuellerMatrixDemo } from '@/components/demos/unit5/MuellerMatrixDemo'
import { JonesMatrixDemo } from '@/components/demos/unit5/JonesMatrixDemo'
import { PolarizationCalculatorDemo } from '@/components/demos/unit5/PolarizationCalculatorDemo'
import { PolarimetricMicroscopyDemo } from '@/components/demos/unit5/PolarimetricMicroscopyDemo'

// Optical Basics demos
import { PolarizationIntroDemo } from '@/components/demos/basics/PolarizationIntroDemo'
import { InteractiveOpticalBenchDemo } from '@/components/demos/basics/InteractiveOpticalBenchDemo'
// Unified demos (merged versions)
// Note: MalusLawGraphDemo removed - functionality integrated into unit1/MalusLawDemo
// Note: PolarizationLockDemo moved to Optical Design Studio
import { ElectromagneticWaveDemo } from '@/components/demos/basics/ElectromagneticWaveDemo'
import { PolarizationTypesUnifiedDemo } from '@/components/demos/basics/PolarizationTypesUnifiedDemo'

// Museum Components
import { GalleryHero } from '@/components/museum'
import MathText from '@/components/MathText'

// Optical Overview Diagram (moved from Chronicles)
import { OpticalOverviewDiagram } from '@/components/chronicles/OpticalOverviewDiagram'

// Icon components - memoized for performance
const DIYIcon = memo(function DIYIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
})

// SVG Diagrams - memoized for performance
const MalusDiagram = memo(function MalusDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <defs>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="40" r="12" fill="#fbbf24" opacity="0.8" />
      <rect x="35" y="38" width="40" height="4" fill="url(#beamGrad)" />
      <rect x="78" y="25" width="4" height="30" fill="#22d3ee" rx="1" />
      <rect x="85" y="38" width="40" height="4" fill="#22d3ee" opacity="0.8" />
      <rect x="128" y="25" width="4" height="30" fill="#a78bfa" rx="1" />
      <rect x="135" y="38" width="30" height="4" fill="#a78bfa" opacity="0.5" />
      <rect x="168" y="28" width="6" height="24" fill="#64748b" rx="1" />
    </svg>
  )
})

const BirefringenceDiagram = memo(function BirefringenceDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="20" y1="40" x2="70" y2="40" stroke="#fbbf24" strokeWidth="3" />
      <polygon points="70,40 64,36 64,44" fill="#fbbf24" />
      <path d="M80,20 L120,20 L130,60 L90,60 Z" fill="#22d3ee" opacity="0.3" stroke="#22d3ee" strokeWidth="1" />
      <line x1="130" y1="35" x2="180" y2="30" stroke="#ff4444" strokeWidth="2" />
      <text x="175" y="22" fill="#ff4444" fontSize="8">o</text>
      <line x1="130" y1="45" x2="180" y2="55" stroke="#44ff44" strokeWidth="2" />
      <text x="175" y="68" fill="#44ff44" fontSize="8">e</text>
    </svg>
  )
})

const WaveplateDiagram = memo(function WaveplateDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="15" y1="40" x2="55" y2="40" stroke="#fbbf24" strokeWidth="2" />
      <line x1="35" y1="30" x2="35" y2="50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3" />
      <rect x="60" y="25" width="30" height="30" fill="#a78bfa" opacity="0.3" stroke="#a78bfa" strokeWidth="1" />
      <ellipse cx="130" cy="40" rx="15" ry="15" fill="none" stroke="#22d3ee" strokeWidth="2" />
      <polygon points="145,40 140,35 140,45" fill="#22d3ee" />
      <line x1="90" y1="40" x2="112" y2="40" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3" />
    </svg>
  )
})

const PolarizationStateDiagram = memo(function PolarizationStateDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="25" y1="25" x2="25" y2="55" stroke="#ffaa00" strokeWidth="2" />
      <circle cx="25" cy="40" r="15" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2" />
      <circle cx="100" cy="40" r="15" fill="none" stroke="#44ff44" strokeWidth="2" />
      <polygon points="115,40 110,35 110,45" fill="#44ff44" />
      <ellipse cx="175" cy="40" rx="18" ry="10" fill="none" stroke="#a78bfa" strokeWidth="2" transform="rotate(-30 175 40)" />
    </svg>
  )
})

const FresnelDiagram = memo(function FresnelDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="30" y1="50" x2="170" y2="50" stroke="#64748b" strokeWidth="2" />
      <line x1="50" y1="15" x2="100" y2="50" stroke="#fbbf24" strokeWidth="2" />
      <line x1="100" y1="50" x2="150" y2="15" stroke="#22d3ee" strokeWidth="2" />
      <line x1="100" y1="50" x2="140" y2="78" stroke="#44ff44" strokeWidth="2" opacity="0.7" />
    </svg>
  )
})

const BrewsterDiagram = memo(function BrewsterDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="30" y1="50" x2="170" y2="50" stroke="#64748b" strokeWidth="2" />
      <line x1="40" y1="10" x2="100" y2="50" stroke="#fbbf24" strokeWidth="2" />
      <line x1="100" y1="50" x2="160" y2="10" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="130" cy="30" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="130" cy="30" r="1" fill="#22d3ee" />
      <path d="M100,50 L100,35" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2" />
      <text x="108" y="38" fill="#a78bfa" fontSize="8">θB</text>
    </svg>
  )
})

const ScatteringDiagram = memo(function ScatteringDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <line x1="20" y1="40" x2="70" y2="40" stroke="#fbbf24" strokeWidth="2" />
      <polygon points="70,40 64,36 64,44" fill="#fbbf24" />
      <circle cx="100" cy="40" r="15" fill="#64748b" opacity="0.3" stroke="#64748b" />
      <line x1="115" y1="40" x2="160" y2="40" stroke="#22d3ee" strokeWidth="1.5" />
      <line x1="110" y1="28" x2="145" y2="10" stroke="#22d3ee" strokeWidth="1.5" opacity="0.7" />
      <line x1="110" y1="52" x2="145" y2="70" stroke="#22d3ee" strokeWidth="1.5" opacity="0.7" />
      <line x1="100" y1="25" x2="100" y2="5" stroke="#4444ff" strokeWidth="1.5" opacity="0.8" />
    </svg>
  )
})

const StokesDiagram = memo(function StokesDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <circle cx="100" cy="40" r="30" fill="none" stroke="#64748b" strokeWidth="1" />
      <ellipse cx="100" cy="40" rx="30" ry="10" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2" />
      <line x1="65" y1="40" x2="135" y2="40" stroke="#ff4444" strokeWidth="1.5" />
      <text x="140" y="43" fill="#ff4444" fontSize="8">S₁</text>
      <line x1="100" y1="55" x2="100" y2="5" stroke="#44ff44" strokeWidth="1.5" />
      <text x="105" y="10" fill="#44ff44" fontSize="8">S₃</text>
      <circle cx="120" cy="30" r="4" fill="#ffff00" />
      <line x1="100" y1="40" x2="120" y2="30" stroke="#ffff00" strokeWidth="1.5" />
    </svg>
  )
})

const MuellerDiagram = memo(function MuellerDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <rect x="15" y="25" width="35" height="30" fill="#22d3ee" opacity="0.2" stroke="#22d3ee" rx="3" />
      <text x="32" y="43" textAnchor="middle" fill="#22d3ee" fontSize="10">S</text>
      <rect x="70" y="15" width="50" height="50" fill="#a78bfa" opacity="0.2" stroke="#a78bfa" rx="3" />
      <text x="95" y="35" textAnchor="middle" fill="#a78bfa" fontSize="8">M</text>
      <text x="95" y="48" textAnchor="middle" fill="#a78bfa" fontSize="7">4×4</text>
      <rect x="140" y="25" width="35" height="30" fill="#44ff44" opacity="0.2" stroke="#44ff44" rx="3" />
      <text x="157" y="43" textAnchor="middle" fill="#44ff44" fontSize="10">S'</text>
      <line x1="52" y1="40" x2="68" y2="40" stroke="#64748b" strokeWidth="1.5" />
      <polygon points="68,40 63,37 63,43" fill="#64748b" />
      <line x1="122" y1="40" x2="138" y2="40" stroke="#64748b" strokeWidth="1.5" />
      <polygon points="138,40 133,37 133,43" fill="#64748b" />
    </svg>
  )
})

const LightWaveDiagram = memo(function LightWaveDiagram() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto">
      <path d="M10,40 Q30,20 50,40 T90,40 T130,40 T170,40" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <path d="M10,40 Q30,60 50,40 T90,40 T130,40 T170,40" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4" />
      <line x1="180" y1="40" x2="195" y2="40" stroke="#64748b" strokeWidth="2" />
      <polygon points="195,40 188,36 188,44" fill="#64748b" />
      <text x="100" y="75" textAnchor="middle" fill="#94a3b8" fontSize="8">λ</text>
    </svg>
  )
})

// Demo info interface
interface DemoQuestions {
  leading?: string  // Main leading question - the most engaging question
  guided: string[]
  openEnded: string[]
}

interface DemoInfo {
  questions?: DemoQuestions
  physics: {
    principle: string
    principle_foundation?: string  // 基础层：简单易懂的描述
    principle_research?: string  // 研究层：学术严谨的描述
    formula?: string
    details: string[]
    details_foundation?: string[]  // 基础层：简化的细节
    details_research?: string[]  // 研究层：专业的细节
  }
  experiment: {
    title: string
    example: string
    details: string[]
  }
  frontier: {
    title: string
    example: string
    details: string[]
  }
  diy?: {
    title: string
    materials: string[]
    steps: string[]
    observation: string
  }
  diagram?: ReactNode
  visualType: '2D' | '3D' // Indicates whether demo uses 2D or 3D visualization
}

// Helper to get questions array from translations with difficulty level support
const getQuestions = (
  t: (key: string) => string,
  basePath: string,
  difficultyLevel?: DifficultyLevel
): DemoQuestions | undefined => {
  try {
    // Get the difficulty suffix for questions
    const suffix = difficultyLevel === 'foundation' ? '_foundation' :
                   difficultyLevel === 'research' ? '_research' : ''

    // Try to get difficulty-specific leading question first, fallback to default
    let leading = t(`${basePath}.questions.leading${suffix}`)
    if (leading.includes('.questions.')) {
      leading = t(`${basePath}.questions.leading`)
    }
    const hasLeading = leading && !leading.includes('.questions.')

    // Get difficulty-specific guided questions or fallback
    let guided = [
      t(`${basePath}.questions.guided${suffix}.0`),
      t(`${basePath}.questions.guided${suffix}.1`),
    ].filter(q => q && !q.includes('.questions.'))

    // Fallback to default if no difficulty-specific content
    if (guided.length === 0) {
      guided = [
        t(`${basePath}.questions.guided.0`),
        t(`${basePath}.questions.guided.1`),
      ].filter(q => q && !q.includes('.questions.'))
    }

    // Get difficulty-specific open-ended questions or fallback
    let openEnded = [
      t(`${basePath}.questions.openEnded${suffix}.0`),
      t(`${basePath}.questions.openEnded${suffix}.1`),
    ].filter(q => q && !q.includes('.questions.'))

    // Fallback to default if no difficulty-specific content
    if (openEnded.length === 0) {
      openEnded = [
        t(`${basePath}.questions.openEnded.0`),
        t(`${basePath}.questions.openEnded.1`),
      ].filter(q => q && !q.includes('.questions.'))
    }

    if (hasLeading || guided.length > 0 || openEnded.length > 0) {
      return {
        leading: hasLeading ? leading : undefined,
        guided,
        openEnded
      }
    }
  } catch {
    return undefined
  }
  return undefined
}

// Helper to get DIY data from translations
const getDiy = (t: (key: string) => string, basePath: string): DemoInfo['diy'] | undefined => {
  try {
    const title = t(`${basePath}.diy.title`)
    const hasTitle = title && !title.includes('.diy.')
    if (!hasTitle) return undefined

    const materials = [
      t(`${basePath}.diy.materials.0`),
      t(`${basePath}.diy.materials.1`),
      t(`${basePath}.diy.materials.2`),
      t(`${basePath}.diy.materials.3`),
    ].filter(m => m && !m.includes('.diy.'))

    const steps = [
      t(`${basePath}.diy.steps.0`),
      t(`${basePath}.diy.steps.1`),
      t(`${basePath}.diy.steps.2`),
      t(`${basePath}.diy.steps.3`),
    ].filter(s => s && !s.includes('.diy.'))

    const observation = t(`${basePath}.diy.observation`)

    return {
      title,
      materials,
      steps,
      observation: observation && !observation.includes('.diy.') ? observation : ''
    }
  } catch {
    return undefined
  }
}

// Demo info data - using i18n keys with optional difficulty level
const getDemoInfo = (t: (key: string) => string, difficultyLevel?: DifficultyLevel): Record<string, DemoInfo> => ({
  'light-wave': {
    questions: getQuestions(t, 'basics.demos.lightWave', difficultyLevel),
    physics: {
      principle: t('basics.demos.lightWave.physics.principle'),
      formula: t('basics.demos.lightWave.physics.formula'),
      details: [
        t('basics.demos.lightWave.physics.details.0'),
        t('basics.demos.lightWave.physics.details.1'),
        t('basics.demos.lightWave.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.lightWave.title'),
      example: t('basics.demos.lightWave.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.lightWave.title'),
      example: t('basics.demos.lightWave.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.lightWave'),
    diagram: <LightWaveDiagram />,
    visualType: '2D',
  },
  'polarization-intro': {
    questions: getQuestions(t, 'basics.demos.polarizationIntro', difficultyLevel),
    physics: {
      principle: t('basics.demos.polarizationIntro.physics.principle'),
      details: [
        t('basics.demos.polarizationIntro.physics.details.0'),
        t('basics.demos.polarizationIntro.physics.details.1'),
        t('basics.demos.polarizationIntro.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.polarizationIntro.title'),
      example: t('basics.demos.polarizationIntro.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.polarizationIntro.title'),
      example: t('basics.demos.polarizationIntro.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.polarizationIntro'),
    visualType: '2D',
  },
  'polarization-types': {
    questions: getQuestions(t, 'basics.demos.polarizationTypes', difficultyLevel),
    physics: {
      principle: t('basics.demos.polarizationTypes.physics.principle'),
      details: [
        t('basics.demos.polarizationTypes.physics.details.0'),
        t('basics.demos.polarizationTypes.physics.details.1'),
        t('basics.demos.polarizationTypes.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.polarizationTypes.title'),
      example: t('basics.demos.polarizationTypes.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.polarizationTypes.title'),
      example: t('basics.demos.polarizationTypes.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.polarizationTypes'),
    diagram: <PolarizationStateDiagram />,
    visualType: '2D',
  },
  'optical-bench': {
    questions: getQuestions(t, 'basics.demos.opticalBench', difficultyLevel),
    physics: {
      principle: t('basics.demos.opticalBench.physics.principle'),
      details: [
        t('basics.demos.opticalBench.physics.details.0'),
        t('basics.demos.opticalBench.physics.details.1'),
        t('basics.demos.opticalBench.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.opticalBench.title'),
      example: t('basics.demos.opticalBench.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.opticalBench.title'),
      example: t('basics.demos.opticalBench.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.opticalBench'),
    visualType: '2D',
  },
  'em-spectrum': {
    questions: getQuestions(t, 'basics.demos.emSpectrum', difficultyLevel),
    physics: {
      principle: t('basics.demos.emSpectrum.physics.principle'),
      formula: t('basics.demos.emSpectrum.physics.formula'),
      details: [
        t('basics.demos.emSpectrum.physics.details.0'),
        t('basics.demos.emSpectrum.physics.details.1'),
        t('basics.demos.emSpectrum.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.emSpectrum.title'),
      example: t('basics.demos.emSpectrum.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.emSpectrum.title'),
      example: t('basics.demos.emSpectrum.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.emSpectrum'),
    visualType: '2D',
  },
  'three-polarizers': {
    questions: getQuestions(t, 'basics.demos.threePolarizers', difficultyLevel),
    physics: {
      principle: t('basics.demos.threePolarizers.physics.principle'),
      formula: t('basics.demos.threePolarizers.physics.formula'),
      details: [
        t('basics.demos.threePolarizers.physics.details.0'),
        t('basics.demos.threePolarizers.physics.details.1'),
        t('basics.demos.threePolarizers.physics.details.2'),
      ],
    },
    experiment: {
      title: t('basics.demos.threePolarizers.title'),
      example: t('basics.demos.threePolarizers.description'),
      details: [],
    },
    frontier: {
      title: t('basics.demos.threePolarizers.title'),
      example: t('basics.demos.threePolarizers.description'),
      details: [],
    },
    diy: getDiy(t, 'basics.demos.threePolarizers'),
    visualType: '2D',
  },
  // Note: 'malus-graph' removed - functionality integrated into unit1/MalusLawDemo
  'polarization-state': {
    questions: getQuestions(t, 'demos.polarizationState', difficultyLevel),
    physics: {
      principle: t('demos.polarizationState.physics.principle'),
      formula: t('demos.polarizationState.physics.formula'),
      details: [
        t('demos.polarizationState.physics.details.0'),
        t('demos.polarizationState.physics.details.1'),
        t('demos.polarizationState.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.polarizationState.experiment.title'),
      example: t('demos.polarizationState.experiment.example'),
      details: [
        t('demos.polarizationState.experiment.details.0'),
        t('demos.polarizationState.experiment.details.1'),
        t('demos.polarizationState.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.polarizationState.frontier.title'),
      example: t('demos.polarizationState.frontier.example'),
      details: [
        t('demos.polarizationState.frontier.details.0'),
        t('demos.polarizationState.frontier.details.1'),
        t('demos.polarizationState.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.polarizationState'),
    diagram: <PolarizationStateDiagram />,
    visualType: '3D',
  },
  malus: {
    questions: getQuestions(t, 'demos.malus', difficultyLevel),
    physics: {
      principle: t('demos.malus.physics.principle'),
      formula: t('demos.malus.physics.formula'),
      details: [
        t('demos.malus.physics.details.0'),
        t('demos.malus.physics.details.1'),
        t('demos.malus.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.malus.experiment.title'),
      example: t('demos.malus.experiment.example'),
      details: [
        t('demos.malus.experiment.details.0'),
        t('demos.malus.experiment.details.1'),
        t('demos.malus.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.malus.frontier.title'),
      example: t('demos.malus.frontier.example'),
      details: [
        t('demos.malus.frontier.details.0'),
        t('demos.malus.frontier.details.1'),
        t('demos.malus.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.malus'),
    diagram: <MalusDiagram />,
    visualType: '2D',
  },
  birefringence: {
    questions: getQuestions(t, 'demos.birefringence', difficultyLevel),
    physics: {
      principle: t('demos.birefringence.physics.principle'),
      formula: t('demos.birefringence.physics.formula'),
      details: [
        t('demos.birefringence.physics.details.0'),
        t('demos.birefringence.physics.details.1'),
        t('demos.birefringence.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.birefringence.experiment.title'),
      example: t('demos.birefringence.experiment.example'),
      details: [
        t('demos.birefringence.experiment.details.0'),
        t('demos.birefringence.experiment.details.1'),
        t('demos.birefringence.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.birefringence.frontier.title'),
      example: t('demos.birefringence.frontier.example'),
      details: [
        t('demos.birefringence.frontier.details.0'),
        t('demos.birefringence.frontier.details.1'),
        t('demos.birefringence.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.birefringence'),
    diagram: <BirefringenceDiagram />,
    visualType: '3D',
  },
  waveplate: {
    questions: getQuestions(t, 'demos.waveplate', difficultyLevel),
    physics: {
      principle: t('demos.waveplate.physics.principle'),
      formula: t('demos.waveplate.physics.formula'),
      details: [
        t('demos.waveplate.physics.details.0'),
        t('demos.waveplate.physics.details.1'),
        t('demos.waveplate.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.waveplate.experiment.title'),
      example: t('demos.waveplate.experiment.example'),
      details: [
        t('demos.waveplate.experiment.details.0'),
        t('demos.waveplate.experiment.details.1'),
        t('demos.waveplate.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.waveplate.frontier.title'),
      example: t('demos.waveplate.frontier.example'),
      details: [
        t('demos.waveplate.frontier.details.0'),
        t('demos.waveplate.frontier.details.1'),
        t('demos.waveplate.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.waveplate'),
    diagram: <WaveplateDiagram />,
    visualType: '3D',
  },
  fresnel: {
    questions: getQuestions(t, 'demos.fresnel', difficultyLevel),
    physics: {
      principle: t('demos.fresnel.physics.principle'),
      formula: t('demos.fresnel.physics.formula'),
      details: [
        t('demos.fresnel.physics.details.0'),
        t('demos.fresnel.physics.details.1'),
        t('demos.fresnel.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.fresnel.experiment.title'),
      example: t('demos.fresnel.experiment.example'),
      details: [
        t('demos.fresnel.experiment.details.0'),
        t('demos.fresnel.experiment.details.1'),
        t('demos.fresnel.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.fresnel.frontier.title'),
      example: t('demos.fresnel.frontier.example'),
      details: [
        t('demos.fresnel.frontier.details.0'),
        t('demos.fresnel.frontier.details.1'),
        t('demos.fresnel.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.fresnel'),
    diagram: <FresnelDiagram />,
    visualType: '2D',
  },
  brewster: {
    questions: getQuestions(t, 'demos.brewster', difficultyLevel),
    physics: {
      principle: t('demos.brewster.physics.principle'),
      formula: t('demos.brewster.physics.formula'),
      details: [
        t('demos.brewster.physics.details.0'),
        t('demos.brewster.physics.details.1'),
        t('demos.brewster.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.brewster.experiment.title'),
      example: t('demos.brewster.experiment.example'),
      details: [
        t('demos.brewster.experiment.details.0'),
        t('demos.brewster.experiment.details.1'),
        t('demos.brewster.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.brewster.frontier.title'),
      example: t('demos.brewster.frontier.example'),
      details: [
        t('demos.brewster.frontier.details.0'),
        t('demos.brewster.frontier.details.1'),
        t('demos.brewster.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.brewster'),
    diagram: <BrewsterDiagram />,
    visualType: '2D',
  },
  chromatic: {
    questions: getQuestions(t, 'demos.chromatic', difficultyLevel),
    physics: {
      principle: t('demos.chromatic.physics.principle'),
      formula: t('demos.chromatic.physics.formula'),
      details: [
        t('demos.chromatic.physics.details.0'),
        t('demos.chromatic.physics.details.1'),
        t('demos.chromatic.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.chromatic.experiment.title'),
      example: t('demos.chromatic.experiment.example'),
      details: [
        t('demos.chromatic.experiment.details.0'),
        t('demos.chromatic.experiment.details.1'),
        t('demos.chromatic.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.chromatic.frontier.title'),
      example: t('demos.chromatic.frontier.example'),
      details: [
        t('demos.chromatic.frontier.details.0'),
        t('demos.chromatic.frontier.details.1'),
        t('demos.chromatic.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.chromatic'),
    visualType: '2D',
  },
  'optical-rotation': {
    questions: getQuestions(t, 'demos.opticalRotation', difficultyLevel),
    physics: {
      principle: t('demos.opticalRotation.physics.principle'),
      formula: t('demos.opticalRotation.physics.formula'),
      details: [
        t('demos.opticalRotation.physics.details.0'),
        t('demos.opticalRotation.physics.details.1'),
        t('demos.opticalRotation.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.opticalRotation.experiment.title'),
      example: t('demos.opticalRotation.experiment.example'),
      details: [
        t('demos.opticalRotation.experiment.details.0'),
        t('demos.opticalRotation.experiment.details.1'),
        t('demos.opticalRotation.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.opticalRotation.frontier.title'),
      example: t('demos.opticalRotation.frontier.example'),
      details: [
        t('demos.opticalRotation.frontier.details.0'),
        t('demos.opticalRotation.frontier.details.1'),
        t('demos.opticalRotation.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.opticalRotation'),
    visualType: '2D',
  },
  anisotropy: {
    questions: getQuestions(t, 'demos.anisotropy', difficultyLevel),
    physics: {
      principle: t('demos.anisotropy.physics.principle'),
      formula: t('demos.anisotropy.physics.formula'),
      details: [
        t('demos.anisotropy.physics.details.0'),
        t('demos.anisotropy.physics.details.1'),
        t('demos.anisotropy.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.anisotropy.experiment.title'),
      example: t('demos.anisotropy.experiment.example'),
      details: [
        t('demos.anisotropy.experiment.details.0'),
        t('demos.anisotropy.experiment.details.1'),
        t('demos.anisotropy.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.anisotropy.frontier.title'),
      example: t('demos.anisotropy.frontier.example'),
      details: [
        t('demos.anisotropy.frontier.details.0'),
        t('demos.anisotropy.frontier.details.1'),
        t('demos.anisotropy.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.anisotropy'),
    visualType: '2D',
  },
  'mie-scattering': {
    questions: getQuestions(t, 'demos.mieScattering', difficultyLevel),
    physics: {
      principle: t('demos.mieScattering.physics.principle'),
      formula: t('demos.mieScattering.physics.formula'),
      details: [
        t('demos.mieScattering.physics.details.0'),
        t('demos.mieScattering.physics.details.1'),
        t('demos.mieScattering.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.mieScattering.experiment.title'),
      example: t('demos.mieScattering.experiment.example'),
      details: [
        t('demos.mieScattering.experiment.details.0'),
        t('demos.mieScattering.experiment.details.1'),
        t('demos.mieScattering.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.mieScattering.frontier.title'),
      example: t('demos.mieScattering.frontier.example'),
      details: [
        t('demos.mieScattering.frontier.details.0'),
        t('demos.mieScattering.frontier.details.1'),
        t('demos.mieScattering.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.mieScattering'),
    diagram: <ScatteringDiagram />,
    visualType: '2D',
  },
  rayleigh: {
    questions: getQuestions(t, 'demos.rayleigh', difficultyLevel),
    physics: {
      principle: t('demos.rayleigh.physics.principle'),
      formula: t('demos.rayleigh.physics.formula'),
      details: [
        t('demos.rayleigh.physics.details.0'),
        t('demos.rayleigh.physics.details.1'),
        t('demos.rayleigh.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.rayleigh.experiment.title'),
      example: t('demos.rayleigh.experiment.example'),
      details: [
        t('demos.rayleigh.experiment.details.0'),
        t('demos.rayleigh.experiment.details.1'),
        t('demos.rayleigh.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.rayleigh.frontier.title'),
      example: t('demos.rayleigh.frontier.example'),
      details: [
        t('demos.rayleigh.frontier.details.0'),
        t('demos.rayleigh.frontier.details.1'),
        t('demos.rayleigh.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.rayleigh'),
    diagram: <ScatteringDiagram />,
    visualType: '2D',
  },
  stokes: {
    questions: getQuestions(t, 'demos.stokes', difficultyLevel),
    physics: {
      principle: t('demos.stokes.physics.principle'),
      formula: t('demos.stokes.physics.formula'),
      details: [
        t('demos.stokes.physics.details.0'),
        t('demos.stokes.physics.details.1'),
        t('demos.stokes.physics.details.2'),
        t('demos.stokes.physics.details.3'),
      ],
    },
    experiment: {
      title: t('demos.stokes.experiment.title'),
      example: t('demos.stokes.experiment.example'),
      details: [
        t('demos.stokes.experiment.details.0'),
        t('demos.stokes.experiment.details.1'),
        t('demos.stokes.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.stokes.frontier.title'),
      example: t('demos.stokes.frontier.example'),
      details: [
        t('demos.stokes.frontier.details.0'),
        t('demos.stokes.frontier.details.1'),
        t('demos.stokes.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.stokes'),
    diagram: <StokesDiagram />,
    visualType: '3D',
  },
  mueller: {
    questions: getQuestions(t, 'demos.mueller', difficultyLevel),
    physics: {
      principle: t('demos.mueller.physics.principle'),
      formula: t('demos.mueller.physics.formula'),
      details: [
        t('demos.mueller.physics.details.0'),
        t('demos.mueller.physics.details.1'),
        t('demos.mueller.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.mueller.experiment.title'),
      example: t('demos.mueller.experiment.example'),
      details: [
        t('demos.mueller.experiment.details.0'),
        t('demos.mueller.experiment.details.1'),
        t('demos.mueller.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.mueller.frontier.title'),
      example: t('demos.mueller.frontier.example'),
      details: [
        t('demos.mueller.frontier.details.0'),
        t('demos.mueller.frontier.details.1'),
        t('demos.mueller.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.mueller'),
    diagram: <MuellerDiagram />,
    visualType: '2D',
  },
  jones: {
    questions: getQuestions(t, 'demos.jones', difficultyLevel),
    physics: {
      principle: t('demos.jones.physics.principle'),
      formula: t('demos.jones.physics.formula'),
      details: [
        t('demos.jones.physics.details.0'),
        t('demos.jones.physics.details.1'),
        t('demos.jones.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.jones.experiment.title'),
      example: t('demos.jones.experiment.example'),
      details: [
        t('demos.jones.experiment.details.0'),
        t('demos.jones.experiment.details.1'),
        t('demos.jones.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.jones.frontier.title'),
      example: t('demos.jones.frontier.example'),
      details: [
        t('demos.jones.frontier.details.0'),
        t('demos.jones.frontier.details.1'),
        t('demos.jones.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.jones'),
    visualType: '2D',
  },
  calculator: {
    questions: getQuestions(t, 'demos.calculator', difficultyLevel),
    physics: {
      principle: t('demos.calculator.physics.principle'),
      formula: t('demos.calculator.physics.formula'),
      details: [
        t('demos.calculator.physics.details.0'),
        t('demos.calculator.physics.details.1'),
        t('demos.calculator.physics.details.2'),
      ],
    },
    experiment: {
      title: t('demos.calculator.experiment.title'),
      example: t('demos.calculator.experiment.example'),
      details: [
        t('demos.calculator.experiment.details.0'),
        t('demos.calculator.experiment.details.1'),
        t('demos.calculator.experiment.details.2'),
      ],
    },
    frontier: {
      title: t('demos.calculator.frontier.title'),
      example: t('demos.calculator.frontier.example'),
      details: [
        t('demos.calculator.frontier.details.0'),
        t('demos.calculator.frontier.details.1'),
        t('demos.calculator.frontier.details.2'),
      ],
    },
    diy: getDiy(t, 'demos.calculator'),
    visualType: '2D',
  },
})

// 课程难度层级类型
export type DifficultyLevel = 'foundation' | 'application' | 'research'

// Props interface for demo components that support difficulty levels
interface DemoComponentProps {
  difficultyLevel?: DifficultyLevel
}

interface DemoItem {
  id: string
  titleKey: string
  unit: number // 0 = basics
  component: React.ComponentType<DemoComponentProps>
  descriptionKey: string
  visualType: '2D' | '3D'
  difficulty: DifficultyLevel // 课程难度层级
}

// 搜索匹配结果接口 - 包含匹配位置信息
type SearchSection = 'title' | 'description' | 'physics' | 'experiment' | 'frontier' | 'diy' | 'questions'

interface SearchMatch {
  demo: DemoItem
  matches: Array<{
    section: SearchSection
    sectionLabel: string
    text: string
    highlightedText: string
  }>
}

// 搜索结果分区标签映射
const getSectionLabel = (section: SearchSection, t: (key: string) => string): string => {
  const labels: Record<SearchSection, string> = {
    title: t('gallery.search.section.title') || '标题',
    description: t('gallery.search.section.description') || '描述',
    physics: t('gallery.cards.physics') || '物理原理',
    experiment: t('gallery.cards.experiment') || '实验应用',
    frontier: t('gallery.cards.frontier') || '前沿应用',
    diy: t('gallery.cards.diy') || '动手试试',
    questions: t('gallery.questions.title') || '探索前的思考'
  }
  return labels[section]
}

// 高亮匹配文本
const highlightText = (text: string, query: string): string => {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '**$1**')
}

// 截取匹配上下文
const getMatchContext = (text: string, query: string, contextLength: number = 50): string => {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text.substring(0, contextLength * 2)

  const start = Math.max(0, index - contextLength)
  const end = Math.min(text.length, index + query.length + contextLength)

  let result = text.substring(start, end)
  if (start > 0) result = '...' + result
  if (end < text.length) result = result + '...'

  return result
}

// 难度级别配置 - 基于研究型学习模式的三层体系
const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  color: string
  icon: string
}> = {
  foundation: {
    color: 'green',
    icon: '🌱', // 基础层 - 发芽成长
  },
  application: {
    color: 'cyan',
    icon: '🔬', // 应用层 - 实验探索
  },
  research: {
    color: 'purple',
    icon: '🚀', // 研究层 - 前沿探索
  },
}

// 难度选择器组件 - 带悬停提示和动画
function DifficultySelector({
  value,
  onChange,
  theme,
  t,
}: {
  value: DifficultyLevel
  onChange: (level: DifficultyLevel) => void
  theme: string
  t: (key: string) => string
}) {
  const levels: DifficultyLevel[] = ['foundation', 'application', 'research']
  const [hoveredLevel, setHoveredLevel] = useState<DifficultyLevel | null>(null)

  return (
    <div className="relative">
      <div className={cn(
        'flex items-center gap-1 p-1 rounded-lg',
        theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'
      )}>
        {levels.map((level) => {
          const config = DIFFICULTY_CONFIG[level]
          const isActive = value === level

          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 relative',
                'hover:scale-105 active:scale-95',
                isActive
                  ? theme === 'dark'
                    ? `bg-${config.color}-400/20 text-${config.color}-400 border border-${config.color}-400/30`
                    : `bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-300`
                  : theme === 'dark'
                    ? 'text-gray-500 hover:text-gray-300 hover:bg-slate-700/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              )}
              style={isActive ? {
                backgroundColor: theme === 'dark'
                  ? config.color === 'green' ? 'rgba(74, 222, 128, 0.2)' : config.color === 'cyan' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                  : config.color === 'green' ? 'rgba(220, 252, 231, 1)' : config.color === 'cyan' ? 'rgba(207, 250, 254, 1)' : 'rgba(243, 232, 255, 1)',
                color: theme === 'dark'
                  ? config.color === 'green' ? '#4ade80' : config.color === 'cyan' ? '#22d3ee' : '#a78bfa'
                  : config.color === 'green' ? '#15803d' : config.color === 'cyan' ? '#0e7490' : '#7c3aed',
                borderColor: theme === 'dark'
                  ? config.color === 'green' ? 'rgba(74, 222, 128, 0.3)' : config.color === 'cyan' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(167, 139, 250, 0.3)'
                  : config.color === 'green' ? '#86efac' : config.color === 'cyan' ? '#67e8f9' : '#c4b5fd',
                borderWidth: '1px',
              } : {}}
              title={t(`gallery.difficulty.${level}Desc`)}
            >
              <span className="text-base">{config.icon}</span>
              <span className="hidden sm:inline">{t(`gallery.difficulty.${level}`)}</span>
              {/* 活动指示器 */}
              {isActive && (
                <span className={cn(
                  'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                  config.color === 'green' ? 'bg-green-400' : config.color === 'cyan' ? 'bg-cyan-400' : 'bg-purple-400'
                )} />
              )}
            </button>
          )
        })}
      </div>
      {/* 悬停提示气泡 */}
      {hoveredLevel && (
        <div className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap z-50',
          'animate-in fade-in slide-in-from-top-1 duration-200',
          theme === 'dark' ? 'bg-slate-700 text-gray-200' : 'bg-gray-800 text-white'
        )}>
          {t(`gallery.difficulty.${hoveredLevel}Desc`)}
          <div className={cn(
            'absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45',
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-800'
          )} />
        </div>
      )}
    </div>
  )
}

const DEMOS: DemoItem[] = [
  // Unit 0 - Optical Basics
  // Unified: 电磁波 + 电磁波谱 (merged into one comprehensive demo)
  {
    id: 'em-wave',
    titleKey: 'basics.demos.emWave.title',
    unit: 0,
    component: ElectromagneticWaveDemo,
    descriptionKey: 'basics.demos.emWave.description',
    visualType: '2D',
    difficulty: 'foundation', // 电磁波可视化 + 波谱（统一演示）
  },
  {
    id: 'polarization-intro',
    titleKey: 'basics.demos.polarizationIntro.title',
    unit: 0,
    component: PolarizationIntroDemo,
    descriptionKey: 'basics.demos.polarizationIntro.description',
    visualType: '2D',
    difficulty: 'foundation', // 初步认识偏振,生活场景引入
  },
  // Unified: 偏振类型 + 三偏振片悖论 (merged into one comprehensive demo)
  {
    id: 'polarization-types-unified',
    titleKey: 'basics.demos.polarizationTypesUnified.title',
    unit: 0,
    component: PolarizationTypesUnifiedDemo,
    descriptionKey: 'basics.demos.polarizationTypesUnified.description',
    visualType: '2D',
    difficulty: 'application', // 偏振类型 + 三偏振片悖论（统一演示）
  },
  {
    id: 'optical-bench',
    titleKey: 'basics.demos.opticalBench.title',
    unit: 0,
    component: InteractiveOpticalBenchDemo,
    descriptionKey: 'basics.demos.opticalBench.description',
    visualType: '2D',
    difficulty: 'application', // 交互式实验设计
  },
  // Note: 'polarization-lock' moved to Optical Design Studio (偏振光路模块)
  // Legacy demos kept for backward compatibility (can be accessed directly)
  // Note: These are now included in unified demos above
  // - light-wave → merged into em-wave
  // - em-spectrum → merged into em-wave
  // - polarization-types → merged into polarization-types-unified
  // - three-polarizers → merged into polarization-types-unified
  // - malus-graph → functionality exists in unit1/MalusLawDemo
  // Unit 1
  {
    id: 'polarization-state',
    titleKey: 'demos.polarizationState.title',
    unit: 1,
    component: PolarizationStateDemo,
    descriptionKey: 'demos.polarizationState.description',
    visualType: '3D',
    difficulty: 'foundation', // 3D可视化偏振态,直观理解
  },
  {
    id: 'malus',
    titleKey: 'demos.malus.title',
    unit: 1,
    component: MalusLawDemo,
    descriptionKey: 'demos.malus.description',
    visualType: '2D',
    difficulty: 'application', // 定量测量,cos²公式应用
  },
  {
    id: 'birefringence',
    titleKey: 'demos.birefringence.title',
    unit: 1,
    component: BirefringenceDemo,
    descriptionKey: 'demos.birefringence.description',
    visualType: '3D',
    difficulty: 'application', // 冰洲石实验现象和原理
  },
  {
    id: 'waveplate',
    titleKey: 'demos.waveplate.title',
    unit: 1,
    component: WaveplateDemo,
    descriptionKey: 'demos.waveplate.description',
    visualType: '3D',
    difficulty: 'research', // 波片调制原理,相位差计算
  },
  // Unit 2
  {
    id: 'fresnel',
    titleKey: 'demos.fresnel.title',
    unit: 2,
    component: FresnelDemo,
    descriptionKey: 'demos.fresnel.description',
    visualType: '2D',
    difficulty: 'research', // 复杂的菲涅尔公式推导
  },
  {
    id: 'brewster',
    titleKey: 'demos.brewster.title',
    unit: 2,
    component: BrewsterDemo,
    descriptionKey: 'demos.brewster.description',
    visualType: '2D',
    difficulty: 'application', // 布儒斯特角测量实验
  },
  // Unit 3
  {
    id: 'anisotropy',
    titleKey: 'demos.anisotropy.title',
    unit: 3,
    component: AnisotropyDemo,
    descriptionKey: 'demos.anisotropy.description',
    visualType: '2D',
    difficulty: 'foundation', // 色偏振生活应用(应力显示)
  },
  {
    id: 'chromatic',
    titleKey: 'demos.chromatic.title',
    unit: 3,
    component: ChromaticDemo,
    descriptionKey: 'demos.chromatic.description',
    visualType: '2D',
    difficulty: 'application', // 色偏振实验和测量
  },
  {
    id: 'optical-rotation',
    titleKey: 'demos.opticalRotation.title',
    unit: 3,
    component: OpticalRotationDemo,
    descriptionKey: 'demos.opticalRotation.description',
    visualType: '2D',
    difficulty: 'application', // 旋光实验和糖浓度测量
  },
  // Unit 4
  {
    id: 'mie-scattering',
    titleKey: 'demos.mieScattering.title',
    unit: 4,
    component: MieScatteringDemo,
    descriptionKey: 'demos.mieScattering.description',
    visualType: '2D',
    difficulty: 'research', // 复杂的米氏散射理论
  },
  {
    id: 'rayleigh',
    titleKey: 'demos.rayleigh.title',
    unit: 4,
    component: RayleighScatteringDemo,
    descriptionKey: 'demos.rayleigh.description',
    visualType: '2D',
    difficulty: 'foundation', // 蓝天白云的自然现象解释
  },
  {
    id: 'monte-carlo-scattering',
    titleKey: 'demos.monteCarloScattering.title',
    unit: 4,
    component: MonteCarloScatteringDemo,
    descriptionKey: 'demos.monteCarloScattering.description',
    visualType: '2D',
    difficulty: 'research', // 蒙特卡洛模拟方法
  },
  // Unit 5
  {
    id: 'stokes',
    titleKey: 'demos.stokes.title',
    unit: 5,
    component: StokesVectorDemo,
    descriptionKey: 'demos.stokes.description',
    visualType: '3D',
    difficulty: 'research', // 斯托克斯矢量的数学表示
  },
  {
    id: 'mueller',
    titleKey: 'demos.mueller.title',
    unit: 5,
    component: MuellerMatrixDemo,
    descriptionKey: 'demos.mueller.description',
    visualType: '2D',
    difficulty: 'research', // 缪勒矩阵的完备表征
  },
  {
    id: 'jones',
    titleKey: 'demos.jones.title',
    unit: 5,
    component: JonesMatrixDemo,
    descriptionKey: 'demos.jones.description',
    visualType: '2D',
    difficulty: 'research', // Jones矩阵的复数表示
  },
  {
    id: 'calculator',
    titleKey: 'demos.calculator.title',
    unit: 5,
    component: PolarizationCalculatorDemo,
    descriptionKey: 'demos.calculator.description',
    visualType: '2D',
    difficulty: 'application', // 综合计算工具
  },
  {
    id: 'polarimetric-microscopy',
    titleKey: 'demos.polarimetricMicroscopy.title',
    unit: 5,
    component: PolarimetricMicroscopyDemo,
    descriptionKey: 'demos.polarimetricMicroscopy.description',
    visualType: '2D',
    difficulty: 'research', // Mueller矩阵显微成像
  },
]

interface UnitInfo {
  num: number
  titleKey: string
  color: string
}

const UNITS: UnitInfo[] = [
  { num: 0, titleKey: 'course.units.basics.title', color: 'yellow' },
  { num: 1, titleKey: 'course.units.1.title', color: 'cyan' },
  { num: 2, titleKey: 'course.units.2.title', color: 'purple' },
  { num: 3, titleKey: 'course.units.3.title', color: 'green' },
  { num: 4, titleKey: 'course.units.4.title', color: 'orange' },
  { num: 5, titleKey: 'course.units.5.title', color: 'pink' },
]

function DemoLoading() {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in duration-300">
      {/* Skeleton placeholder for demo content */}
      <div className={cn(
        'w-full max-w-2xl rounded-xl p-6 mb-6',
        theme === 'dark' ? 'bg-slate-800/30' : 'bg-gray-100/50'
      )}>
        {/* Skeleton for demo visualization area */}
        <div className={cn(
          'w-full aspect-[16/9] rounded-lg mb-4 animate-pulse',
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
        )} />
        {/* Skeleton for controls */}
        <div className="flex gap-3 mb-3">
          <div className={cn(
            'h-8 w-24 rounded-lg animate-pulse',
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
          )} />
          <div className={cn(
            'h-8 w-32 rounded-lg animate-pulse',
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
          )} />
        </div>
        <div className={cn(
          'h-4 w-3/4 rounded animate-pulse',
          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
        )} />
      </div>

      {/* Loading indicator */}
      <div className="text-center">
        <div className={cn(
          'w-10 h-10 border-3 border-t-cyan-400 rounded-full mx-auto mb-3 animate-spin',
          theme === 'dark' ? 'border-cyan-400/20' : 'border-cyan-400/30'
        )} />
        <p className={cn(
          'text-sm',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          {t('common.loading')}
        </p>
      </div>
    </div>
  )
}

// Visual type badge component
function VisualTypeBadge({ type }: { type: '2D' | '3D' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        type === '3D'
          ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
          : 'bg-green-400/20 text-green-400 border border-green-400/30'
      )}
    >
      {type === '3D' ? <Box className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
      {type}
    </span>
  )
}

// Collapsible card component with enhanced interactions
function CollapsibleCard({
  title,
  icon,
  color,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  icon: ReactNode
  color: string
  isExpanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { theme } = useTheme()

  const colorClasses = {
    orange: {
      header: theme === 'dark'
        ? 'bg-orange-400/10 border-orange-400/30 hover:bg-orange-400/20 hover:shadow-[0_0_15px_rgba(251,146,60,0.15)]'
        : 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:shadow-md',
      icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      expandedBorder: theme === 'dark' ? 'border-orange-400/50' : 'border-orange-300',
    },
    cyan: {
      header: theme === 'dark'
        ? 'bg-cyan-400/10 border-cyan-400/30 hover:bg-cyan-400/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]'
        : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:shadow-md',
      icon: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600',
      expandedBorder: theme === 'dark' ? 'border-cyan-400/50' : 'border-cyan-300',
    },
    green: {
      header: theme === 'dark'
        ? 'bg-green-400/10 border-green-400/30 hover:bg-green-400/20 hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]'
        : 'bg-green-50 border-green-200 hover:bg-green-100 hover:shadow-md',
      icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      expandedBorder: theme === 'dark' ? 'border-green-400/50' : 'border-green-300',
    },
    purple: {
      header: theme === 'dark'
        ? 'bg-purple-400/10 border-purple-400/30 hover:bg-purple-400/20 hover:shadow-[0_0_15px_rgba(167,139,250,0.15)]'
        : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:shadow-md',
      icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      expandedBorder: theme === 'dark' ? 'border-purple-400/50' : 'border-purple-300',
    },
    yellow: {
      header: theme === 'dark'
        ? 'bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.15)]'
        : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:shadow-md',
      icon: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      expandedBorder: theme === 'dark' ? 'border-yellow-400/50' : 'border-yellow-300',
    },
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-all duration-300',
      theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-gray-200',
      isExpanded && colors.expandedBorder,
      isExpanded && (theme === 'dark' ? 'shadow-lg' : 'shadow-md')
    )}>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 border-b transition-all duration-200 cursor-pointer',
          'active:scale-[0.99]',
          colors.header
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn(colors.icon, 'transition-transform duration-200', isExpanded && 'scale-110')}>{icon}</span>
          <span className={cn(
            'font-semibold text-sm transition-colors',
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          )}>
            {title}
          </span>
        </div>
        <ChevronRight className={cn(
          'w-4 h-4 transition-transform duration-300',
          isExpanded && 'rotate-90',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        )} />
      </button>
      <div className={cn(
        'transition-all duration-300 ease-in-out overflow-hidden',
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export function DemosPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile, isTablet } = useIsMobile()
  const { demoId: urlDemoId } = useParams<{ demoId?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Determine initial demo from URL param or show museum homepage
  const getInitialDemo = (): string | null => {
    // First check path param (/demos/:demoId)
    if (urlDemoId && DEMOS.find(d => d.id === urlDemoId)) {
      return urlDemoId
    }
    // Fallback to query param for backwards compatibility
    const queryDemo = searchParams.get('demo')
    if (queryDemo && DEMOS.find(d => d.id === queryDemo)) {
      return queryDemo
    }
    // Check if unit param is specified (from museum hall navigation)
    const unitParam = searchParams.get('unit')
    if (unitParam !== null) {
      const unitNum = parseInt(unitParam)
      const firstDemoInUnit = DEMOS.find(d => d.unit === unitNum)
      if (firstDemoInUnit) {
        return firstDemoInUnit.id
      }
    }
    // Return null to show museum homepage
    return null
  }

  const [activeDemo, setActiveDemo] = useState<string | null>(getInitialDemo)
  const [showMuseumHomepage, setShowMuseumHomepage] = useState<boolean>(() => getInitialDemo() === null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [expandedUnit, setExpandedUnit] = useState<number | null>(() => {
    const initialDemoId = getInitialDemo()
    if (!initialDemoId) return null
    const demo = DEMOS.find(d => d.id === initialDemoId)
    return demo?.unit ?? 0
  })

  // Handle URL changes for deep linking
  // Supports both /demos/:demoId and /demos?demo=id (backwards compatible)
  useEffect(() => {
    // If using path param
    if (urlDemoId) {
      const targetDemo = DEMOS.find(d => d.id === urlDemoId)
      if (targetDemo && activeDemo !== urlDemoId) {
        setActiveDemo(urlDemoId)
        setExpandedUnit(targetDemo.unit)
      }
    }
    // Legacy query param support - redirect to new URL format
    const queryDemo = searchParams.get('demo')
    if (queryDemo) {
      const targetDemo = DEMOS.find(d => d.id === queryDemo)
      if (targetDemo) {
        // Redirect to new URL format, keeping other params
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('demo')
        const paramString = newParams.toString()
        navigate(`/demos/${queryDemo}${paramString ? `?${paramString}` : ''}`, { replace: true })
      }
    }
  }, [urlDemoId, searchParams, activeDemo, navigate])

  // Tab-based deep linking - allows /demos/chromatic?tab=diy
  const getInitialExpandedCards = (): Record<string, boolean> => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'diy') {
      return { diy: true }
    }
    return { diy: false }
  }

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(getInitialExpandedCards)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('application')
  const [showDifficultyChange, setShowDifficultyChange] = useState(false)

  // Show visual feedback when difficulty changes
  const handleDifficultyChange = (level: DifficultyLevel) => {
    setDifficultyLevel(level)
    setShowDifficultyChange(true)
    setTimeout(() => setShowDifficultyChange(false), 1500)
  }

  // Enhanced search function that returns demos with match location details
  const getSearchResults = (): { demos: DemoItem[], matches: Map<string, SearchMatch> } => {
    if (!searchQuery.trim()) {
      return { demos: DEMOS, matches: new Map() }
    }

    const query = searchQuery.toLowerCase().trim()
    const demoInfoMap = getDemoInfo(t)
    const matchesMap = new Map<string, SearchMatch>()

    const matchedDemos = DEMOS.filter(demo => {
      const matches: SearchMatch['matches'] = []

      // Search in title
      const title = t(demo.titleKey)
      if (title.toLowerCase().includes(query)) {
        matches.push({
          section: 'title',
          sectionLabel: getSectionLabel('title', t),
          text: getMatchContext(title, query),
          highlightedText: highlightText(getMatchContext(title, query), query)
        })
      }

      // Search in description
      const description = t(demo.descriptionKey)
      if (description.toLowerCase().includes(query)) {
        matches.push({
          section: 'description',
          sectionLabel: getSectionLabel('description', t),
          text: getMatchContext(description, query),
          highlightedText: highlightText(getMatchContext(description, query), query)
        })
      }

      // Search in demo info content
      const info = demoInfoMap[demo.id]
      if (info) {
        // Physics principle and formula
        if (info.physics.principle.toLowerCase().includes(query)) {
          matches.push({
            section: 'physics',
            sectionLabel: getSectionLabel('physics', t),
            text: getMatchContext(info.physics.principle, query),
            highlightedText: highlightText(getMatchContext(info.physics.principle, query), query)
          })
        }
        if (info.physics.formula?.toLowerCase().includes(query)) {
          matches.push({
            section: 'physics',
            sectionLabel: getSectionLabel('physics', t) + ' - 公式',
            text: info.physics.formula,
            highlightedText: highlightText(info.physics.formula, query)
          })
        }
        info.physics.details.forEach((d, i) => {
          if (d.toLowerCase().includes(query)) {
            matches.push({
              section: 'physics',
              sectionLabel: getSectionLabel('physics', t) + ` [${i + 1}]`,
              text: getMatchContext(d, query),
              highlightedText: highlightText(getMatchContext(d, query), query)
            })
          }
        })

        // Experiment
        if (info.experiment.title.toLowerCase().includes(query)) {
          matches.push({
            section: 'experiment',
            sectionLabel: getSectionLabel('experiment', t),
            text: getMatchContext(info.experiment.title, query),
            highlightedText: highlightText(getMatchContext(info.experiment.title, query), query)
          })
        }
        if (info.experiment.example.toLowerCase().includes(query)) {
          matches.push({
            section: 'experiment',
            sectionLabel: getSectionLabel('experiment', t) + ' - 示例',
            text: getMatchContext(info.experiment.example, query),
            highlightedText: highlightText(getMatchContext(info.experiment.example, query), query)
          })
        }

        // Frontier
        if (info.frontier.title.toLowerCase().includes(query)) {
          matches.push({
            section: 'frontier',
            sectionLabel: getSectionLabel('frontier', t),
            text: getMatchContext(info.frontier.title, query),
            highlightedText: highlightText(getMatchContext(info.frontier.title, query), query)
          })
        }
        if (info.frontier.example.toLowerCase().includes(query)) {
          matches.push({
            section: 'frontier',
            sectionLabel: getSectionLabel('frontier', t) + ' - 示例',
            text: getMatchContext(info.frontier.example, query),
            highlightedText: highlightText(getMatchContext(info.frontier.example, query), query)
          })
        }

        // DIY
        if (info.diy?.title.toLowerCase().includes(query)) {
          matches.push({
            section: 'diy',
            sectionLabel: getSectionLabel('diy', t),
            text: getMatchContext(info.diy.title, query),
            highlightedText: highlightText(getMatchContext(info.diy.title, query), query)
          })
        }
        info.diy?.materials.forEach((m, i) => {
          if (m.toLowerCase().includes(query)) {
            matches.push({
              section: 'diy',
              sectionLabel: getSectionLabel('diy', t) + ` - 材料${i + 1}`,
              text: getMatchContext(m, query),
              highlightedText: highlightText(getMatchContext(m, query), query)
            })
          }
        })

        // Questions
        if (info.questions?.leading?.toLowerCase().includes(query)) {
          matches.push({
            section: 'questions',
            sectionLabel: getSectionLabel('questions', t) + ' - 核心问题',
            text: getMatchContext(info.questions.leading, query),
            highlightedText: highlightText(getMatchContext(info.questions.leading, query), query)
          })
        }
        info.questions?.guided.forEach((q, i) => {
          if (q.toLowerCase().includes(query)) {
            matches.push({
              section: 'questions',
              sectionLabel: getSectionLabel('questions', t) + ` - 引导${i + 1}`,
              text: getMatchContext(q, query),
              highlightedText: highlightText(getMatchContext(q, query), query)
            })
          }
        })
        info.questions?.openEnded.forEach((q, i) => {
          if (q.toLowerCase().includes(query)) {
            matches.push({
              section: 'questions',
              sectionLabel: getSectionLabel('questions', t) + ` - 开放${i + 1}`,
              text: getMatchContext(q, query),
              highlightedText: highlightText(getMatchContext(q, query), query)
            })
          }
        })
      }

      if (matches.length > 0) {
        matchesMap.set(demo.id, { demo, matches })
        return true
      }
      return false
    })

    return { demos: matchedDemos, matches: matchesMap }
  }

  const searchResults = getSearchResults()
  const filteredDemos = searchResults.demos
  const searchMatches = searchResults.matches

  // Reset card states when switching demos - cards should be collapsed on first visit to each demo
  const [visitedDemos, setVisitedDemos] = useState<Set<string>>(new Set())

  const handleDemoChange = (demoId: string) => {
    setActiveDemo(demoId)
    setShowMuseumHomepage(false) // Hide museum homepage when a demo is selected
    // Update URL to reflect the selected demo (keep query params for tabs etc.)
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('unit') // Remove unit param when selecting a specific demo
    const paramString = newParams.toString()
    navigate(`/demos/${demoId}${paramString ? `?${paramString}` : ''}`, { replace: true })

    // Expand the unit containing this demo
    const demo = DEMOS.find(d => d.id === demoId)
    if (demo) {
      setExpandedUnit(demo.unit)
    }

    // Reset cards to collapsed when switching to a new (not previously visited) demo
    if (!visitedDemos.has(demoId)) {
      setExpandedCards({ diy: false })
      setVisitedDemos(prev => new Set(prev).add(demoId))
    }
  }

  // Navigate back to museum homepage, passing current unit for scroll targeting
  const handleShowMuseumHomepage = () => {
    setShowMuseumHomepage(true)
    const currentUnit = currentDemo?.unit ?? null
    setActiveDemo(null)
    navigate('/demos', { replace: true, state: { scrollToHalls: true, fromUnit: currentUnit } })
  }

  const toggleCard = (card: string) => {
    // Physics, experiment, frontier are linked - they expand/collapse together
    const linkedCards = ['physics', 'experiment', 'frontier']
    const isLinkedCard = linkedCards.includes(card)

    if (isLinkedCard) {
      // Toggle all three linked cards together
      const newState = !expandedCards[card]
      setExpandedCards(prev => ({
        ...prev,
        physics: newState,
        experiment: newState,
        frontier: newState,
      }))

      // Update URL with tab parameter for shareable links
      const newParams = new URLSearchParams(searchParams)
      if (newState) {
        newParams.set('tab', card)
      } else {
        newParams.delete('tab')
      }
      const paramString = newParams.toString()
      const demoPath = activeDemo ? `/demos/${activeDemo}` : '/demos'
      navigate(`${demoPath}${paramString ? `?${paramString}` : ''}`, { replace: true })
    } else {
      // Other cards (diy) toggle independently
      const newState = !expandedCards[card]
      setExpandedCards(prev => ({ ...prev, [card]: newState }))

      // Update URL with tab parameter for shareable links
      const newParams = new URLSearchParams(searchParams)
      if (newState) {
        newParams.set('tab', card)
      } else {
        newParams.delete('tab')
      }
      const paramString = newParams.toString()
      const demoPath = activeDemo ? `/demos/${activeDemo}` : '/demos'
      navigate(`${demoPath}${paramString ? `?${paramString}` : ''}`, { replace: true })
    }
  }

  const isCompact = isMobile || isTablet
  const currentDemo = activeDemo ? DEMOS.find((d) => d.id === activeDemo) : null
  const DemoComponent = currentDemo?.component
  // For Unit 0 (Optical Basics), don't apply difficulty-based content variations
  const effectiveDifficultyLevel = currentDemo?.unit === 0 ? undefined : difficultyLevel
  const demoInfo = activeDemo ? getDemoInfo(t, effectiveDifficultyLevel)[activeDemo] : null

  // When no demo is selected, show gallery hero in the main content area
  // instead of full-screen museum homepage - keeps left navigation visible

  return (
    <>
      <SEO
        title="Interactive Physics Demos - PolarCraft"
        titleZh="交互式物理演示 - PolarCraft"
        description="Explore 20+ interactive polarization physics demos covering Malus's Law, birefringence, Fresnel equations, and more."
        descriptionZh="探索20多个交互式偏振物理演示，涵盖马吕斯定律、双折射、菲涅尔方程等。"
      />
      <div
        className={cn(
          'min-h-screen',
          theme === 'dark' ? 'bg-[#0a0a0f] text-gray-200' : 'bg-[#f8fafc] text-gray-800'
        )}
      >
        {/* Navigation Header with Persistent Logo */}
        <PersistentHeader
        moduleKey="formulaLab"
        moduleNameKey="home.formulaLab.title"
        variant="glass"
        compact={isCompact}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          isCompact ? 'px-3 py-2' : 'px-6 py-3',
          theme === 'dark'
            ? 'bg-slate-900/95 border-b border-cyan-400/20'
            : 'bg-white/95 border-b border-cyan-500/20'
        )}
        showSettings={false}
        rightContent={
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back to Gallery button - only show when viewing a demo */}
            {currentDemo && !showMuseumHomepage && (
              <button
                onClick={handleShowMuseumHomepage}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200',
                  'text-sm font-medium',
                  theme === 'dark'
                    ? 'text-cyan-400 hover:bg-cyan-400/15 border border-cyan-400/30 hover:border-cyan-400/50'
                    : 'text-cyan-600 hover:bg-cyan-100 border border-cyan-500/30 hover:border-cyan-500/50'
                )}
                title={t('museum.backToGallery', '返回演示馆')}
              >
                <ArrowLeft className="w-4 h-4" />
                {!isCompact && <span>{t('museum.backToGallery', '返回演示馆')}</span>}
              </button>
            )}
            {/* Mobile menu button */}
            {isCompact && (
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  theme === 'dark'
                    ? 'text-cyan-400 hover:bg-cyan-400/10'
                    : 'text-cyan-600 hover:bg-cyan-100'
                )}
              >
                {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            {!isCompact && (
              <>
                <Link
                  to="/games"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-cyan-400/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-cyan-100'
                  )}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>{t('common.game')}</span>
                </Link>
                <Link
                  to="/course"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    theme === 'dark' ? 'text-cyan-400 bg-cyan-400/15' : 'text-cyan-600 bg-cyan-100'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('common.course')}</span>
                </Link>
              </>
            )}
            <LanguageThemeSwitcher />
          </div>
        }
      />

      {/* Main Container */}
      <div className={cn("flex", isCompact ? "pt-[52px]" : "pt-[60px]")}>
        {/* Sidebar - Desktop always visible, Mobile slide-in */}
        <aside
          className={cn(
            'fixed top-0 bottom-0 border-r overflow-y-auto transition-transform duration-300 z-40',
            isCompact
              ? cn(
                  'w-72 left-0',
                  showMobileSidebar ? 'translate-x-0' : '-translate-x-full',
                  'pt-14'
                )
              : 'w-64 left-0 top-[60px]',
            theme === 'dark'
              ? 'bg-slate-900/95 border-cyan-400/10'
              : 'bg-white/95 border-cyan-200'
          )}
        >
          {/* Search Input */}
          <div className={cn(
            'p-3 border-b',
            theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
          )}>
            <div className="relative">
              <Search className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('gallery.search.placeholder')}
                className={cn(
                  'w-full pl-9 pr-8 py-2 text-sm rounded-lg border transition-all duration-200',
                  'focus:outline-none focus:ring-2',
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/20'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors',
                    theme === 'dark'
                      ? 'text-gray-500 hover:text-gray-300 hover:bg-slate-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className={cn(
                'text-xs mt-2',
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              )}>
                {t('gallery.search.results', { count: filteredDemos.length })}
              </p>
            )}
          </div>

          <div className="p-4">
            {UNITS.map((unit) => {
              const unitDemos = searchQuery
                ? filteredDemos.filter((d) => d.unit === unit.num)
                : DEMOS.filter((d) => d.unit === unit.num)
              const isExpanded = !isCompact || expandedUnit === unit.num

              // Hide units with no matching demos when searching
              if (searchQuery && unitDemos.length === 0) return null

              return (
                <div key={unit.num} className="mb-3">
                  <button
                    onClick={() => isCompact && setExpandedUnit(expandedUnit === unit.num ? null : unit.num)}
                    className={cn(
                      'w-full text-[10px] uppercase tracking-wider mb-2 px-2 font-semibold flex items-center gap-2',
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
                      isCompact && (theme === 'dark' ? 'hover:text-cyan-400' : 'hover:text-cyan-600'),
                      'transition-colors'
                    )}
                  >
                    {unit.num === 0 ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className={`text-${unit.color}-400`}>●</span>
                    )}
                    <span className="flex-1 text-left">
                      {unit.num === 0
                        ? t('basics.title')  // 光学基础不重复显示
                        : `${t('game.level')} ${unit.num} · ${t(unit.titleKey)}`}
                    </span>
                    {isCompact && (
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    )}
                  </button>
                  {isExpanded && (
                    <ul className="space-y-0.5">
                      {unitDemos.map((demo) => {
                        const demoMatches = searchQuery ? searchMatches.get(demo.id) : null
                        return (
                          <li key={demo.id}>
                            <button
                              onClick={() => {
                                handleDemoChange(demo.id)
                                if (isCompact) setShowMobileSidebar(false)
                              }}
                              className={cn(
                                'w-full flex flex-col gap-1 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200',
                                'hover:translate-x-1 active:scale-[0.98]',
                                activeDemo === demo.id
                                  ? theme === 'dark'
                                    ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/10 text-cyan-400 border-l-2 border-cyan-400'
                                    : 'bg-gradient-to-r from-cyan-100 to-blue-50 text-cyan-700 border-l-2 border-cyan-500'
                                  : theme === 'dark'
                                    ? 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0',
                                    activeDemo === demo.id
                                      ? theme === 'dark'
                                        ? 'bg-cyan-400 text-black'
                                        : 'bg-cyan-500 text-white'
                                      : theme === 'dark'
                                        ? 'bg-slate-700 text-gray-400'
                                        : 'bg-gray-200 text-gray-500'
                                  )}
                                >
                                  {unitDemos.indexOf(demo) + 1}
                                </span>
                                <span className="truncate flex-1">{t(demo.titleKey)}</span>
                                <VisualTypeBadge type={demo.visualType} />
                              </div>
                              {/* Search match details */}
                              {demoMatches && demoMatches.matches.length > 0 && (
                                <div className={cn(
                                  'ml-7 mt-1 text-xs space-y-1 border-l-2 pl-2',
                                  theme === 'dark'
                                    ? 'border-amber-400/40 text-gray-500'
                                    : 'border-amber-500/40 text-gray-500'
                                )}>
                                  {demoMatches.matches.slice(0, 3).map((match, idx) => (
                                    <div key={idx} className="flex flex-col">
                                      <span className={cn(
                                        'text-[10px] font-medium',
                                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                                      )}>
                                        {match.sectionLabel}
                                      </span>
                                      <span
                                        className="truncate"
                                        dangerouslySetInnerHTML={{
                                          __html: match.highlightedText
                                            .replace(/\*\*([^*]+)\*\*/g,
                                              `<mark class="${theme === 'dark' ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-200 text-amber-900'} px-0.5 rounded">\$1</mark>`)
                                        }}
                                      />
                                    </div>
                                  ))}
                                  {demoMatches.matches.length > 3 && (
                                    <span className={cn(
                                      'text-[10px]',
                                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                    )}>
                                      +{demoMatches.matches.length - 3} {t('gallery.search.moreMatches') || '更多匹配'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {isCompact && showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1",
          isCompact ? "ml-0 p-3" : "ml-64 p-6"
        )}>
          {/* Show Gallery Hero when no demo is selected, otherwise show demo content */}
          {showMuseumHomepage || !currentDemo ? (
            <div className="max-w-[1400px] mx-auto space-y-8">
              <GalleryHero
                onSelectDemo={handleDemoChange}
                onSelectUnit={(unit) => setExpandedUnit(unit)}
                isCompact={isCompact}
              />
              {/* Optical Overview Diagram - 光学全景图 */}
              <OpticalOverviewDiagram />
            </div>
          ) : (
          <>
          {/* Sticky Difficulty Selector Bar - Only show for Units 1-5, not for Unit 0 (Optical Basics) */}
          {currentDemo?.unit !== 0 && (
            <div className={cn(
              'sticky z-30 mb-4 -mx-3 px-3 py-3 border-b backdrop-blur-md',
              isCompact ? 'top-[52px]' : 'top-[60px] -mx-6 px-6',
              theme === 'dark'
                ? 'bg-[#0a0a0f]/90 border-slate-800/50'
                : 'bg-[#f8fafc]/90 border-gray-200/50'
            )}>
              <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className={cn(
                    'w-5 h-5',
                    difficultyLevel === 'foundation' ? 'text-green-400' :
                    difficultyLevel === 'research' ? 'text-purple-400' : 'text-cyan-400'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    {t('gallery.difficulty.label') || '难度等级'}
                  </span>
                </div>
                <DifficultySelector
                  value={difficultyLevel}
                  onChange={handleDifficultyChange}
                  theme={theme}
                  t={t}
                />
                {/* Difficulty change notification */}
                {showDifficultyChange && (
                  <div className={cn(
                    'absolute right-4 top-full mt-2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50',
                    'animate-in fade-in slide-in-from-top-2 duration-300',
                    difficultyLevel === 'foundation'
                      ? 'bg-green-500/90 text-white'
                      : difficultyLevel === 'research'
                      ? 'bg-purple-500/90 text-white'
                      : 'bg-cyan-500/90 text-white'
                  )}>
                    {DIFFICULTY_CONFIG[difficultyLevel].icon} {t(`course.difficulty.${difficultyLevel}`)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="max-w-[1400px] mx-auto">
            {/* Title and description */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-lg border',
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20 text-cyan-400 border-cyan-400/30'
                      : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-300'
                  )}
                >
                  {currentDemo?.unit === 0
                    ? t('basics.title')
                    : `${t('game.level')} ${currentDemo?.unit}`}
                </span>
                <VisualTypeBadge type={currentDemo?.visualType || '2D'} />
                <h1
                  className={cn(
                    'text-2xl font-bold',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}
                >
                  {t(currentDemo?.titleKey || '')}
                </h1>
              </div>
              <p className={cn(
                theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-700 text-sm'
              )}>
                {MathText({text:t(currentDemo?.descriptionKey || '')})}
              </p>
            </div>

            {/* Thinking Questions Section - Before Demo */}
            {demoInfo?.questions && (demoInfo.questions.leading || demoInfo.questions.guided.length > 0 || demoInfo.questions.openEnded.length > 0) && (
              <div
                className={cn(
                  'mb-5 rounded-xl border p-4',
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-400/5 to-orange-400/5 border-amber-400/20'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className={cn(
                    'w-5 h-5',
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  )} />
                  <h3 className={cn(
                    'text-lg font-bold',
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                  )}>
                    {t('gallery.questions.title')}
                  </h3>
                </div>
                {/* Leading Question - Main engaging question */}
                {demoInfo.questions.leading && (
                  <div
                    className={cn(
                      'mb-4 p-4 rounded-lg border-2 border-dashed transition-all duration-300',
                      'hover:scale-[1.01] hover:shadow-lg cursor-default',
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-amber-400/10 to-orange-400/10 border-amber-400/40 hover:border-amber-400/60'
                        : 'bg-gradient-to-r from-amber-100/80 to-orange-100/80 border-amber-400 hover:border-amber-500'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'text-2xl flex-shrink-0 animate-pulse',
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      )}>?</span>
                      <p className={cn(
                        'text-base font-medium leading-relaxed',
                        theme === 'dark' ? 'text-amber-200' : 'text-amber-900'
                      )}>
                        {demoInfo.questions.leading}
                      </p>
                    </div>
                  </div>
                )}
                <div className={cn(
                  'grid gap-4',
                  isCompact ? 'grid-cols-1' : 'grid-cols-2'
                )}>
                  {/* Guided Questions */}
                  {demoInfo.questions.guided.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className={cn(
                          'w-4 h-4',
                          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                        )} />
                        <span className={cn(
                          'text-sm font-semibold',
                          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'
                        )}>
                          {t('gallery.questions.guided')}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {demoInfo.questions.guided.map((q, i) => (
                          <li
                            key={i}
                            className={cn(
                              'text-sm pl-3 border-l-2 py-1 transition-all duration-200',
                              'hover:pl-4 hover:border-l-4 cursor-default',
                              theme === 'dark'
                                ? 'text-gray-300 border-cyan-400/40 hover:border-cyan-400 hover:text-cyan-100'
                                : 'text-gray-800 border-cyan-500 hover:border-cyan-600 hover:bg-cyan-50/50'
                            )}
                          >
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Open-ended Questions */}
                  {demoInfo.questions.openEnded.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className={cn(
                          'w-4 h-4',
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        )} />
                        <span className={cn(
                          'text-sm font-semibold',
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                        )}>
                          {t('gallery.questions.openEnded')}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {demoInfo.questions.openEnded.map((q, i) => (
                          <li
                            key={i}
                            className={cn(
                              'text-sm pl-3 border-l-2 py-1 transition-all duration-200',
                              'hover:pl-4 hover:border-l-4 cursor-default',
                              theme === 'dark'
                                ? 'text-gray-300 border-purple-400/40 hover:border-purple-400 hover:text-purple-100'
                                : 'text-gray-800 border-purple-500 hover:border-purple-600 hover:bg-purple-50/50'
                            )}
                          >
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demo area */}
            <div
              className={cn(
                'rounded-2xl border overflow-hidden',
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.1)]'
                  : 'bg-gradient-to-br from-white to-gray-50 border-cyan-200 shadow-lg'
              )}
            >
              <div className="p-5 min-h-[550px]">
                <DemoErrorBoundary demoName={currentDemo?.titleKey ? t(currentDemo.titleKey) : undefined}>
                  <Suspense fallback={<DemoLoading />}>
                    {DemoComponent && <DemoComponent difficultyLevel={effectiveDifficultyLevel} />}
                  </Suspense>
                </DemoErrorBoundary>
              </div>
            </div>

            {/* Collapsible Info cards - responsive grid layout */}
            {demoInfo && (
              <div className="mt-5 space-y-4">
                {/* DIY card - full width, at bottom */}
                {demoInfo.diy && (
                  <CollapsibleCard
                    title={t('gallery.cards.diy')}
                    icon={<DIYIcon />}
                    color="yellow"
                    isExpanded={expandedCards.diy}
                    onToggle={() => toggleCard('diy')}
                  >
                    <div className="space-y-4">
                      {/* Materials list */}
                      <div
                        className={cn(
                          'rounded-lg px-4 py-3 border',
                          theme === 'dark'
                            ? 'bg-yellow-400/5 border-yellow-400/20'
                            : 'bg-yellow-50 border-yellow-200'
                        )}
                      >
                        <h5
                          className={cn(
                            'font-semibold text-sm mb-2 flex items-center gap-2',
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                          )}
                        >
                          📦 Materials
                        </h5>
                        <ul className="space-y-1">
                          {demoInfo.diy.materials.map((material, i) => (
                            <li
                              key={i}
                              className={cn(
                                'text-sm flex items-center gap-2',
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              )}
                            >
                              <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>•</span>
                              {material}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <h5
                          className={cn(
                            'font-semibold text-sm mb-2 flex items-center gap-2',
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                          )}
                        >
                          📝 Steps
                        </h5>
                        <ol className="space-y-2">
                          {demoInfo.diy.steps.map((step, i) => (
                            <li
                              key={i}
                              className={cn(
                                'text-sm flex items-start gap-3',
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                  theme === 'dark'
                                    ? 'bg-yellow-400/20 text-yellow-400'
                                    : 'bg-yellow-200 text-yellow-800'
                                )}
                              >
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Observation */}
                      <div
                        className={cn(
                          'rounded-lg px-4 py-3 border-2 border-dashed',
                          theme === 'dark'
                            ? 'bg-yellow-400/5 border-yellow-400/40'
                            : 'bg-yellow-100/50 border-yellow-400'
                        )}
                      >
                        <h5
                          className={cn(
                            'font-semibold text-sm mb-1 flex items-center gap-2',
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                          )}
                        >
                          💡 What you'll observe
                        </h5>
                        <p className={cn(
                          'text-sm',
                          theme === 'dark' ? 'text-yellow-200' : 'text-yellow-900'
                        )}>
                          {demoInfo.diy.observation}
                        </p>
                      </div>
                    </div>
                  </CollapsibleCard>
                )}
              </div>
            )}
          </div>
          </>
          )}
        </main>
        </div>
      </div>
    </>
  )
}

export default DemosPage
