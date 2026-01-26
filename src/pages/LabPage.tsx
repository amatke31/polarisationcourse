/**
 * Lab Page - Virtual Research Lab Group
 * 课题组页面 - 虚拟研究实验室
 *
 * Simulated graduate research experience with real research challenges,
 * guided tasks, collaboration space, and achievement showcase.
 *
 * 四大模块：开放挑战、引导任务、协作空间、成果展示
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { Tabs, Badge, PersistentHeader, SEO } from '@/components/shared'
import { ResearchTaskModal } from '@/components/lab'
import { useLabStore } from '@/stores/labStore'
import {
  FlaskConical, Users, Target, Award,
  BookOpen, CheckCircle2,
  Clock, Lock, ChevronRight, Lightbulb,
  GraduationCap, Beaker, Microscope,
  PlayCircle, Rocket, ExternalLink, Brain,
  Dna, Waves, FileText, Github
} from 'lucide-react'

// Research tasks data
interface ResearchTask {
  id: string
  titleEn: string
  titleZh: string
  descriptionEn: string
  descriptionZh: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'experiment' | 'simulation' | 'analysis' | 'literature'
  estimatedHours: number
  status: 'available' | 'locked' | 'coming-soon'
  prerequisites?: string[]
  skills: string[]
}

const RESEARCH_TASKS: ResearchTask[] = [
  {
    id: 'polarizer-basics',
    titleEn: 'Polarizer Characterization',
    titleZh: '偏振片特性测定',
    descriptionEn: 'Measure the extinction ratio and transmission axis of polarizers using Malus\'s Law.',
    descriptionZh: '使用马吕斯定律测量偏振片的消光比和透光轴。',
    difficulty: 'beginner',
    category: 'experiment',
    estimatedHours: 2,
    status: 'available',
    skills: ['Malus\'s Law', 'Data fitting', 'Error analysis']
  },
  {
    id: 'brewster-angle',
    titleEn: 'Brewster\'s Angle Measurement',
    titleZh: '布儒斯特角测量',
    descriptionEn: 'Determine Brewster\'s angle for glass and calculate its refractive index.',
    descriptionZh: '测定玻璃的布儒斯特角并计算其折射率。',
    difficulty: 'beginner',
    category: 'experiment',
    estimatedHours: 3,
    status: 'available',
    prerequisites: ['polarizer-basics'],
    skills: ['Brewster\'s angle', 'Reflection measurement', 'Refractive index']
  },
  {
    id: 'waveplate-retardation',
    titleEn: 'Waveplate Retardation Analysis',
    titleZh: '波片相位延迟分析',
    descriptionEn: 'Characterize quarter-wave and half-wave plates by analyzing output polarization states.',
    descriptionZh: '通过分析输出偏振态来表征四分之一波片和半波片。',
    difficulty: 'intermediate',
    category: 'experiment',
    estimatedHours: 4,
    status: 'available',
    prerequisites: ['polarizer-basics'],
    skills: ['Phase retardation', 'Polarization ellipse', 'Jones calculus']
  },
  {
    id: 'stokes-measurement',
    titleEn: 'Stokes Parameter Measurement',
    titleZh: '斯托克斯参数测量',
    descriptionEn: 'Build a polarimeter and measure Stokes parameters for various light sources.',
    descriptionZh: '搭建偏振计并测量各种光源的斯托克斯参数。',
    difficulty: 'intermediate',
    category: 'experiment',
    estimatedHours: 6,
    status: 'locked',
    prerequisites: ['waveplate-retardation'],
    skills: ['Stokes vector', 'Polarimetry', 'Instrument design']
  },
  {
    id: 'stress-birefringence',
    titleEn: 'Photoelastic Stress Analysis',
    titleZh: '光弹应力分析',
    descriptionEn: 'Visualize stress patterns in transparent materials using crossed polarizers.',
    descriptionZh: '使用正交偏振器观察透明材料中的应力图案。',
    difficulty: 'intermediate',
    category: 'analysis',
    estimatedHours: 4,
    status: 'available',
    prerequisites: ['polarizer-basics'],
    skills: ['Birefringence', 'Stress optics', 'Image analysis']
  },
  {
    id: 'mueller-matrix',
    titleEn: 'Mueller Matrix Polarimetry',
    titleZh: '穆勒矩阵偏振测量',
    descriptionEn: 'Implement dual-rotating retarder method for complete Mueller matrix measurement.',
    descriptionZh: '实现双旋转延迟器方法进行完整的穆勒矩阵测量。',
    difficulty: 'advanced',
    category: 'experiment',
    estimatedHours: 10,
    status: 'coming-soon',
    prerequisites: ['stokes-measurement'],
    skills: ['Mueller matrix', 'Polarimetric imaging', 'Advanced optics']
  },
  {
    id: 'lcd-simulation',
    titleEn: 'LCD Display Simulation',
    titleZh: 'LCD显示器仿真',
    descriptionEn: 'Simulate twisted nematic LCD pixel operation using Jones matrix formalism.',
    descriptionZh: '使用琼斯矩阵形式仿真扭曲向列LCD像素工作原理。',
    difficulty: 'advanced',
    category: 'simulation',
    estimatedHours: 8,
    status: 'coming-soon',
    skills: ['Jones calculus', 'Liquid crystals', 'Numerical simulation']
  },
  {
    id: 'literature-review',
    titleEn: 'Literature Review: Polarimetric Remote Sensing',
    titleZh: '文献综述：偏振遥感',
    descriptionEn: 'Review recent advances in polarimetric imaging for atmospheric and Earth observation.',
    descriptionZh: '综述偏振成像在大气和地球观测中的最新进展。',
    difficulty: 'advanced',
    category: 'literature',
    estimatedHours: 12,
    status: 'coming-soon',
    skills: ['Literature search', 'Scientific writing', 'Remote sensing']
  },
]

const DIFFICULTY_LABELS = {
  beginner: { en: 'Beginner', zh: '入门', color: 'green' as const },
  intermediate: { en: 'Intermediate', zh: '进阶', color: 'yellow' as const },
  advanced: { en: 'Advanced', zh: '高级', color: 'red' as const },
}

// ============================================================================
// 开放挑战 - Real Research Projects from Wenzhou University
// ============================================================================

interface OpenChallenge {
  id: string
  titleEn: string
  titleZh: string
  subtitleEn: string
  subtitleZh: string
  coreQuestionEn: string
  coreQuestionZh: string
  backgroundEn: string
  backgroundZh: string
  significanceEn: string[]
  significanceZh: string[]
  objectivesEn: string[]
  objectivesZh: string[]
  tasks: {
    id: string
    titleEn: string
    titleZh: string
    descriptionEn: string
    descriptionZh: string
  }[]
  methodsEn: string[]
  methodsZh: string[]
  expectedOutcomesEn: string[]
  expectedOutcomesZh: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'biomedical' | 'environmental' | 'materials' | 'industrial'
  estimatedWeeks: number
  status: 'active' | 'planning' | 'completed'
  tags: string[]
  sourceCodeUrl?: string
  dataSourceEn?: string
  dataSourceZh?: string
}

const OPEN_CHALLENGES: OpenChallenge[] = [
  {
    id: 'cell-apoptosis-mueller',
    titleEn: 'Label-Free Live Cell Apoptosis Monitoring',
    titleZh: '无标记活细胞凋亡监测',
    subtitleEn: 'Observe cell life and death with "invisible light information"',
    subtitleZh: '用眼睛"看不见的光信息"观测细胞的生与死',
    coreQuestionEn: 'Can we determine whether cells are undergoing apoptosis using Mueller imaging and data analysis without staining?',
    coreQuestionZh: '能否在不对细胞进行染色的情况下，利用缪勒成像和数据分析判断细胞是否正在发生凋亡？',
    backgroundEn: 'Traditional cell apoptosis detection uses fluorescent dyes that can alter cell states and interfere with long-term observation. This research explores label-free detection using Mueller microscopy and polarization analysis to identify dying cells without interference.',
    backgroundZh: '传统细胞凋亡检测使用荧光染料，会改变细胞状态并干扰长期观察。本研究探索使用穆勒显微镜和偏振分析进行无标记检测，在不干扰的情况下识别凋亡细胞。',
    significanceEn: [
      'Enables long-term live-cell imaging without dye interference',
      'Reduces experimental costs and simplifies protocols',
      'Provides non-invasive analysis of cellular death processes',
      'Potential clinical applications in cancer research'
    ],
    significanceZh: [
      '实现无染料干扰的长期活细胞成像',
      '降低实验成本，简化实验流程',
      '提供细胞死亡过程的无创分析',
      '在癌症研究中具有潜在临床应用'
    ],
    objectivesEn: [
      'Understand cell apoptosis vs. necrosis',
      'Learn Mueller imaging vs. fluorescence imaging applications',
      'Master experimental design with proper controls',
      'Perform Mueller data processing and polarization feature extraction',
      'Experience real research uncertainty and evidence-based reasoning'
    ],
    objectivesZh: [
      '理解细胞凋亡与坏死的区别',
      '学习穆勒成像与荧光成像的应用',
      '掌握带有适当对照的实验设计',
      '进行穆勒数据处理和偏振特征提取',
      '体验真实研究的不确定性和证据推理'
    ],
    tasks: [
      {
        id: 'task-1',
        titleEn: 'Task 1: Know Your Experimental Objects & Data Collection',
        titleZh: '任务一：认识实验对象与数据采集',
        descriptionEn: 'Learn cell scale and microscopy imaging methods. Observe normal vs. stimulated cells. Compare brightfield, fluorescence, and Mueller imaging.',
        descriptionZh: '学习细胞尺度和显微成像方法。观察正常细胞与刺激后细胞。比较明场、荧光和穆勒成像。'
      },
      {
        id: 'task-2',
        titleEn: 'Task 2: Data Processing & Image Analysis (Core)',
        titleZh: '任务二：数据处理与图像分析（核心）',
        descriptionEn: 'Convert images to digital signals, extract features, compute Mueller matrices and polarization parameters. Apply machine learning for cell segmentation and virtual staining.',
        descriptionZh: '将图像转换为数字信号，提取特征，计算穆勒矩阵和偏振参数。应用机器学习进行细胞分割和虚拟染色。'
      },
      {
        id: 'task-3',
        titleEn: 'Task 3: Scientific Discussion & Report Formation',
        titleZh: '任务三：科研讨论与报告形成',
        descriptionEn: 'Discuss findings, understand scientific reasoning as evidence-based inference, learn about research uncertainty and limitations.',
        descriptionZh: '讨论发现，理解科学推理作为基于证据的推断，了解研究的不确定性和局限性。'
      }
    ],
    methodsEn: [
      'Manual observation-based analysis',
      'Rule-based analysis (threshold, edge detection)',
      'Data-driven computational analysis with K-Means clustering',
      'Mueller SuperPixel feature extraction'
    ],
    methodsZh: [
      '基于人工观察的分析',
      '基于规则的分析（阈值、边缘检测）',
      '基于K-Means聚类的数据驱动计算分析',
      '穆勒超像素特征提取'
    ],
    expectedOutcomesEn: [
      'Apoptotic cell identification from polarization features',
      'Temporal trend statistics',
      'Research report with visualizations',
      'Understanding of evidence-based reasoning in science'
    ],
    expectedOutcomesZh: [
      '从偏振特征识别凋亡细胞',
      '时间趋势统计',
      '带有可视化的研究报告',
      '理解科学中的证据推理'
    ],
    difficulty: 'intermediate',
    category: 'biomedical',
    estimatedWeeks: 4,
    status: 'active',
    tags: ['Mueller Microscopy', 'Cell Biology', 'Machine Learning', 'Medical Imaging', 'Label-free'],
    sourceCodeUrl: 'https://github.com/Weijinfu/Muller-SuperPixel',
    dataSourceEn: 'Mueller microscopy images from Wenzhou University Bio-Optics Lab',
    dataSourceZh: '温州大学生物光学实验室的穆勒显微图像'
  },
  {
    id: 'microalgae-polarization-id',
    titleEn: 'Microalgae Identification Using Polarization "ID Photos"',
    titleZh: '微藻偏振"证件照"识别',
    subtitleEn: 'Take a "polarization ID photo" for microalgae using "invisible light"',
    subtitleZh: '使用"看不见的光"给微藻拍张"偏振证件照"',
    coreQuestionEn: 'How can we use polarization information of different microalgae, combined with AI algorithms, to find unique polarization features for each species?',
    coreQuestionZh: '如何充分利用不同微藻的偏振信息，结合人工智能算法，寻找出每种微藻的独特偏振特征，以区分不同微藻实现自动准确识别？',
    backgroundEn: 'Microalgae identification is critical for harmful algal bloom (HAB) prevention. Traditional methods rely on manual expert identification under microscopes, which is slow and often misses warning windows. This research develops AI-based identification using polarization imaging.',
    backgroundZh: '微藻识别对于有害藻华（HAB）预防至关重要。传统方法依赖专家在显微镜下手动识别，速度慢且经常错过预警窗口。本研究利用偏振成像开发基于AI的识别方法。',
    significanceEn: [
      'Rapid, non-invasive microalgae identification',
      'Enables early warning for harmful algal blooms',
      'Protects ocean ecosystems and aquaculture',
      'Combines polarization optics with machine learning'
    ],
    significanceZh: [
      '快速、无创的微藻识别',
      '实现有害藻华的早期预警',
      '保护海洋生态系统和水产养殖',
      '结合偏振光学与机器学习'
    ],
    objectivesEn: [
      'Learn microalgae sample preparation',
      'Master image processing and information extraction',
      'Understand polarization feature template methods',
      'Validate with real aquatic environment samples'
    ],
    objectivesZh: [
      '学习微藻样品制备',
      '掌握图像处理和信息提取',
      '理解偏振特征模板方法',
      '用真实水体样本验证'
    ],
    tasks: [
      {
        id: 'task-1',
        titleEn: 'Task 1: Know Your Experimental Objects',
        titleZh: '任务一：认识实验对象——不同微藻细胞的显微成像',
        descriptionEn: 'Sample preparation for microalgae. Acquire polarization images of different species, focusing on Pseudo-nitzschia pungens and Skeletonema costatum.',
        descriptionZh: '微藻样品制备。获取不同物种的偏振图像，重点关注尖刺拟菱形藻和中肋骨条藻。'
      },
      {
        id: 'task-2',
        titleEn: 'Task 2: Data Analysis (Project Core)',
        titleZh: '任务二：数据分析（项目核心）',
        descriptionEn: 'Data preprocessing with Mueller matrices, polarization parameters, and cell segmentation. Apply K-Means clustering to identify unique polarization signatures.',
        descriptionZh: '使用穆勒矩阵、偏振参数和细胞分割进行数据预处理。应用K-Means聚类识别独特的偏振特征。'
      },
      {
        id: 'task-3',
        titleEn: 'Task 3: Real Water Sample Validation',
        titleZh: '任务三：真实水体验证',
        descriptionEn: 'Validate using real water samples from Wenzhou Marine Center. Continuous model improvement and accuracy verification.',
        descriptionZh: '使用温州海洋中心的真实水样进行验证。持续模型改进和准确性验证。'
      }
    ],
    methodsEn: [
      'K-Means clustering for superpixel analysis',
      'Mueller matrix decomposition',
      'Polarization feature template (PFT) extraction',
      'Statistical classification with 3-sigma outlier detection'
    ],
    methodsZh: [
      'K-Means聚类进行超像素分析',
      '穆勒矩阵分解',
      '偏振特征模板（PFT）提取',
      '带有3-sigma异常值检测的统计分类'
    ],
    expectedOutcomesEn: [
      'Polarization feature templates for target species',
      'Automated identification model with validation',
      'Real water sample performance metrics',
      'Research report with statistical analysis'
    ],
    expectedOutcomesZh: [
      '目标物种的偏振特征模板',
      '带有验证的自动识别模型',
      '真实水样性能指标',
      '带有统计分析的研究报告'
    ],
    difficulty: 'intermediate',
    category: 'environmental',
    estimatedWeeks: 6,
    status: 'active',
    tags: ['Environmental Monitoring', 'Mueller Microscopy', 'Machine Learning', 'Marine Biology', 'HAB Prevention'],
    dataSourceEn: 'Microalgae samples and Mueller images from Wenzhou Marine Center',
    dataSourceZh: '温州海洋中心的微藻样本和穆勒图像'
  }
]

const CATEGORY_ICONS = {
  experiment: FlaskConical,
  simulation: Beaker,
  analysis: Microscope,
  literature: BookOpen,
}

const COLLABORATION_SPACES: CollaborationSpace[] = [
  {
    id: 'cell-apoptosis-team',
    nameEn: 'Cell Apoptosis Research Team',
    nameZh: '细胞凋亡研究小组',
    descriptionEn: 'Collaborate on label-free cell apoptosis detection using Mueller microscopy. Share data analysis methods and discuss findings.',
    descriptionZh: '协作进行基于穆勒显微镜的无标记细胞凋亡检测。分享数据分析方法，讨论研究发现。',
    members: 8,
    focus: ['Mueller Microscopy', 'Machine Learning', 'Cell Biology', 'Data Analysis'],
    status: 'active',
    relatedChallengeId: 'cell-apoptosis-mueller',
  },
  {
    id: 'microalgae-team',
    nameEn: 'Microalgae Identification Team',
    nameZh: '微藻识别研究小组',
    descriptionEn: 'Work together on microalgae polarization identification. Share algorithms, validate models with real water samples.',
    descriptionZh: '共同进行微藻偏振识别研究。分享算法，用真实水样验证模型。',
    members: 6,
    focus: ['Environmental Monitoring', 'AI Classification', 'Marine Biology', 'Feature Extraction'],
    status: 'active',
    relatedChallengeId: 'microalgae-polarization-id',
  },
  {
    id: 'general-discussion',
    nameEn: 'General Discussion Forum',
    nameZh: '综合讨论区',
    descriptionEn: 'Open forum for discussing polarization optics, sharing resources, and helping each other with research challenges.',
    descriptionZh: '开放论坛，讨论偏振光学，分享资源，互相帮助解决研究难题。',
    members: 25,
    focus: ['Questions & Answers', 'Resource Sharing', 'Peer Support'],
    status: 'active',
  },
]

// Tabs configuration - 四大模块
const TABS = [
  { id: 'challenges', label: 'Open Challenges', labelZh: '开放挑战', icon: <Rocket className="w-4 h-4" /> },
  { id: 'tasks', label: 'Guided Tasks', labelZh: '引导任务', icon: <Target className="w-4 h-4" /> },
  { id: 'collaboration', label: 'Collaboration', labelZh: '协作空间', icon: <Users className="w-4 h-4" /> },
  { id: 'showcase', label: 'Showcase', labelZh: '成果展示', icon: <Award className="w-4 h-4" /> },
]

// Collaboration space data (协作空间)
interface CollaborationSpace {
  id: string
  nameEn: string
  nameZh: string
  descriptionEn: string
  descriptionZh: string
  members: number
  focus: string[]
  status: 'active' | 'forming' | 'coming-soon'
  relatedChallengeId?: string
}

// Task card component
function TaskCard({ task, onStart }: { task: ResearchTask; onStart?: (taskId: string) => void }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const difficulty = DIFFICULTY_LABELS[task.difficulty]
  const CategoryIcon = CATEGORY_ICONS[task.category]
  const isLocked = task.status === 'locked'
  const isComingSoon = task.status === 'coming-soon'

  // Get task progress from store
  const taskProgress = useLabStore(state => state.taskProgress[task.id])
  const taskStatus = taskProgress?.status

  const handleClick = () => {
    if (!isLocked && !isComingSoon && onStart) {
      onStart(task.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'rounded-xl border p-4 transition-all',
        isLocked || isComingSoon
          ? cn(
              'opacity-60',
              theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-200'
            )
          : cn(
              'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/50'
                : 'bg-white border-gray-200 hover:border-yellow-400'
            )
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          isLocked || isComingSoon
            ? theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
            : taskStatus === 'submitted' || taskStatus === 'published'
              ? theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              : taskStatus === 'in-progress'
                ? theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'
                : theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
        )}>
          {isLocked ? (
            <Lock className={cn('w-5 h-5', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')} />
          ) : taskStatus === 'submitted' || taskStatus === 'published' ? (
            <CheckCircle2 className={cn('w-5 h-5', theme === 'dark' ? 'text-green-400' : 'text-green-600')} />
          ) : taskStatus === 'in-progress' ? (
            <PlayCircle className={cn('w-5 h-5', theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600')} />
          ) : (
            <CategoryIcon className={cn(
              'w-5 h-5',
              isComingSoon
                ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                : theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            )} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge color={difficulty.color} size="sm">
              {isZh ? difficulty.zh : difficulty.en}
            </Badge>
            <div className={cn(
              'flex items-center gap-1 text-xs',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            )}>
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h
            </div>
            {isComingSoon && (
              <Badge color="gray" size="sm">
                {isZh ? '即将推出' : 'Coming Soon'}
              </Badge>
            )}
            {taskStatus === 'in-progress' && (
              <Badge color="cyan" size="sm">
                {isZh ? '进行中' : 'In Progress'}
              </Badge>
            )}
            {taskStatus === 'submitted' && (
              <Badge color="green" size="sm">
                {isZh ? '已提交' : 'Submitted'}
              </Badge>
            )}
            {taskStatus === 'published' && (
              <Badge color="purple" size="sm">
                {isZh ? '已发表' : 'Published'}
              </Badge>
            )}
          </div>
          <h3 className={cn(
            'font-semibold mb-1',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? task.titleZh : task.titleEn}
          </h3>
          <p className={cn(
            'text-sm line-clamp-2',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {isZh ? task.descriptionZh : task.descriptionEn}
          </p>
          {!isLocked && !isComingSoon && (
            <div className={cn(
              'mt-3 flex items-center gap-1 text-sm font-medium',
              taskStatus === 'in-progress'
                ? theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                : taskStatus === 'submitted' || taskStatus === 'published'
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
            )}>
              <span>
                {taskStatus === 'in-progress'
                  ? (isZh ? '继续任务' : 'Continue')
                  : taskStatus === 'submitted' || taskStatus === 'published'
                    ? (isZh ? '查看结果' : 'View Results')
                    : (isZh ? '开始任务' : 'Start Task')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
          {isLocked && task.prerequisites && (
            <div className={cn(
              'mt-2 text-xs',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            )}>
              {isZh ? '前置任务: ' : 'Prerequisites: '}
              {task.prerequisites.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Collaboration space card component
function CollaborationCard({ space }: { space: CollaborationSpace }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const isComingSoon = space.status === 'coming-soon'
  const isActive = space.status === 'active'

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all',
      isComingSoon
        ? cn(
            'opacity-60 border-dashed',
            theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-300'
          )
        : cn(
            'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer',
            theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50' : 'bg-white border-gray-200 hover:border-cyan-400'
          )
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn(
          'font-semibold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {isZh ? space.nameZh : space.nameEn}
        </h3>
        <div className="flex items-center gap-2">
          {isActive && (
            <Badge color="green" size="sm">
              {isZh ? '活跃' : 'Active'}
            </Badge>
          )}
          {isComingSoon ? (
            <Badge color="gray" size="sm">
              {isZh ? '即将开放' : 'Coming Soon'}
            </Badge>
          ) : (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              <Users className="w-4 h-4" />
              {space.members}
            </div>
          )}
        </div>
      </div>
      <p className={cn(
        'text-sm mb-3',
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      )}>
        {isZh ? space.descriptionZh : space.descriptionEn}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {space.focus.map((topic, i) => (
          <span
            key={i}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            )}
          >
            {topic}
          </span>
        ))}
      </div>
      {!isComingSoon && (
        <div className={cn(
          'mt-3 flex items-center gap-1 text-sm font-medium',
          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
        )}>
          <span>{isZh ? '加入讨论' : 'Join Discussion'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}

// Open challenge card component
function OpenChallengeCard({ challenge, onSelect }: { challenge: OpenChallenge; onSelect?: (id: string) => void }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const difficulty = DIFFICULTY_LABELS[challenge.difficulty]
  const isActive = challenge.status === 'active'

  const categoryIcons = {
    biomedical: Dna,
    environmental: Waves,
    materials: Beaker,
    industrial: FlaskConical,
  }
  const CategoryIcon = categoryIcons[challenge.category]

  return (
    <div
      onClick={() => onSelect?.(challenge.id)}
      className={cn(
        'rounded-xl border p-5 transition-all cursor-pointer',
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-yellow-400 hover:shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          challenge.category === 'biomedical' && (theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100'),
          challenge.category === 'environmental' && (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'),
        )}>
          <CategoryIcon className={cn(
            'w-6 h-6',
            challenge.category === 'biomedical' && (theme === 'dark' ? 'text-pink-400' : 'text-pink-600'),
            challenge.category === 'environmental' && (theme === 'dark' ? 'text-green-400' : 'text-green-600'),
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge color={difficulty.color} size="sm">
              {isZh ? difficulty.zh : difficulty.en}
            </Badge>
            {isActive && (
              <Badge color="green" size="sm">
                {isZh ? '进行中' : 'Active'}
              </Badge>
            )}
            <div className={cn(
              'flex items-center gap-1 text-xs',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            )}>
              <Clock className="w-3 h-3" />
              {challenge.estimatedWeeks} {isZh ? '周' : 'weeks'}
            </div>
          </div>
          <h3 className={cn(
            'text-lg font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? challenge.titleZh : challenge.titleEn}
          </h3>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-yellow-400/80' : 'text-yellow-600'
          )}>
            {isZh ? challenge.subtitleZh : challenge.subtitleEn}
          </p>
        </div>
      </div>

      {/* Core Question */}
      <div className={cn(
        'p-3 rounded-lg mb-4',
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
      )}>
        <div className="flex items-start gap-2">
          <Brain className={cn(
            'w-4 h-4 mt-0.5 flex-shrink-0',
            theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
          )} />
          <p className={cn(
            'text-sm',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          )}>
            {isZh ? challenge.coreQuestionZh : challenge.coreQuestionEn}
          </p>
        </div>
      </div>

      {/* Tasks Preview */}
      <div className="mb-4">
        <h4 className={cn(
          'text-xs font-semibold uppercase tracking-wider mb-2',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          {isZh ? '研究任务' : 'Research Tasks'}
        </h4>
        <div className="space-y-1.5">
          {challenge.tasks.map((task, idx) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-2 text-sm',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium',
                theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              )}>
                {idx + 1}
              </span>
              <span className="truncate">{isZh ? task.titleZh.replace(/任务[一二三]：/, '') : task.titleEn.replace(/Task \d: /, '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {challenge.tags.slice(0, 4).map(tag => (
          <span
            key={tag}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            )}
          >
            {tag}
          </span>
        ))}
        {challenge.tags.length > 4 && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            theme === 'dark' ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          )}>
            +{challenge.tags.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {challenge.sourceCodeUrl && (
            <a
              href={challenge.sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'flex items-center gap-1 text-xs',
                theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Github className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          )}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
        )}>
          <span>{isZh ? '查看详情' : 'View Details'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

export function LabPage() {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const [activeTab, setActiveTab] = useState('challenges')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)

  // Lab store
  const { openTask, taskProgress, publications } = useLabStore()

  // Calculate progress statistics
  const stats = useMemo(() => {
    const progressEntries = Object.values(taskProgress)
    const completedCount = progressEntries.filter(
      p => p.status === 'submitted' || p.status === 'published'
    ).length
    const availableTasks = RESEARCH_TASKS.filter(t => t.status === 'available').length

    return {
      openChallenges: OPEN_CHALLENGES.filter(c => c.status === 'active').length,
      guidedTasks: availableTasks,
      completed: completedCount,
      publications: publications.length,
    }
  }, [taskProgress, publications])

  // Filter tasks
  const filteredTasks = difficultyFilter
    ? RESEARCH_TASKS.filter(t => t.difficulty === difficultyFilter)
    : RESEARCH_TASKS

  // Handle starting a task
  const handleStartTask = (taskId: string) => {
    openTask(taskId)
  }

  // Handle selecting a challenge
  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId)
  }

  // Get selected challenge details
  const selectedChallengeData = selectedChallenge
    ? OPEN_CHALLENGES.find(c => c.id === selectedChallenge)
    : null

  return (
    <>
      <SEO
        title="Virtual Lab Group - PolarCraft"
        titleZh="虚拟课题组 - PolarCraft"
        description="Experience graduate-level research simulation with real research challenges, guided tasks, and collaboration."
        descriptionZh="体验研究生级别的研究模拟，包括真实研究挑战、引导任务和协作空间。"
      />
      <div className={cn(
        'min-h-screen',
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a2a]'
          : 'bg-gradient-to-br from-[#fefce8] via-[#fef9c3] to-[#fefce8]'
      )}>
        {/* Header with Persistent Logo */}
        <PersistentHeader
          moduleKey="labGroup"
          moduleName={isZh ? '虚拟课题组' : 'Virtual Lab Group'}
          variant="glass"
          className={cn(
            'sticky top-0 z-40',
            theme === 'dark'
              ? 'bg-slate-900/80 border-b border-slate-700'
              : 'bg-white/80 border-b border-gray-200'
          )}
        />

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Hero section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>{isZh ? '像研究生一样学习' : 'Learn Like a Graduate Student'}</span>
            </div>
            <h2 className={cn(
              'text-2xl sm:text-3xl font-bold mb-3',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {isZh ? '欢迎加入偏振光课题组' : 'Welcome to the Polarization Lab'}
            </h2>
            <p className={cn(
              'text-base max-w-2xl mx-auto',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {isZh
                ? '探索真实研究课题，完成引导任务，与同学协作讨论，展示研究成果。'
                : 'Explore real research challenges, complete guided tasks, collaborate with peers, and showcase your results.'}
            </p>
          </div>

          {/* Progress overview */}
          <div className={cn(
            'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 rounded-xl',
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-white border border-gray-200'
          )}>
            {[
              { icon: Rocket, label: isZh ? '开放挑战' : 'Challenges', value: stats.openChallenges, color: 'yellow' },
              { icon: Target, label: isZh ? '引导任务' : 'Guided Tasks', value: stats.guidedTasks, color: 'cyan' },
              { icon: CheckCircle2, label: isZh ? '已完成' : 'Completed', value: stats.completed, color: 'green' },
              { icon: Award, label: isZh ? '发表成果' : 'Published', value: stats.publications, color: 'purple' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="text-center">
                  <Icon className={cn(
                    'w-6 h-6 mx-auto mb-1',
                    stat.color === 'yellow' && (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'),
                    stat.color === 'green' && (theme === 'dark' ? 'text-green-400' : 'text-green-600'),
                    stat.color === 'cyan' && (theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'),
                    stat.color === 'purple' && (theme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                  )} />
                  <div className={cn(
                    'text-2xl font-bold',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {stat.value}
                  </div>
                  <div className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Content */}
          {/* Open Challenges Tab - 开放挑战 */}
          {activeTab === 'challenges' && !selectedChallenge && (
            <div className="space-y-6">
              {/* Intro */}
              <div className={cn(
                'p-4 rounded-xl border',
                theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
              )}>
                <div className="flex items-start gap-3">
                  <Rocket className={cn(
                    'w-5 h-5 mt-0.5',
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  )} />
                  <div>
                    <h4 className={cn(
                      'font-semibold',
                      theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                    )}>
                      {isZh ? '真实研究课题：体验科研全流程' : 'Real Research Projects: Experience the Full Research Workflow'}
                    </h4>
                    <p className={cn(
                      'text-sm mt-1',
                      theme === 'dark' ? 'text-yellow-200/70' : 'text-yellow-700'
                    )}>
                      {isZh
                        ? '这些是来自温州大学的真实研究课题。你将使用真实数据，学习科学方法，体验从问题提出到结论形成的完整研究过程。'
                        : 'These are real research projects from Wenzhou University. You will work with real data, learn scientific methods, and experience the complete research process from problem formulation to conclusion.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {OPEN_CHALLENGES.map(challenge => (
                  <OpenChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onSelect={handleSelectChallenge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Challenge Detail View */}
          {activeTab === 'challenges' && selectedChallenge && selectedChallengeData && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setSelectedChallenge(null)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium',
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {isZh ? '返回挑战列表' : 'Back to Challenges'}
              </button>

              {/* Challenge Header */}
              <div className={cn(
                'p-6 rounded-xl border',
                theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'
              )}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                    selectedChallengeData.category === 'biomedical' && (theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100'),
                    selectedChallengeData.category === 'environmental' && (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'),
                  )}>
                    {selectedChallengeData.category === 'biomedical' ? (
                      <Dna className={cn('w-7 h-7', theme === 'dark' ? 'text-pink-400' : 'text-pink-600')} />
                    ) : (
                      <Waves className={cn('w-7 h-7', theme === 'dark' ? 'text-green-400' : 'text-green-600')} />
                    )}
                  </div>
                  <div>
                    <h2 className={cn(
                      'text-xl font-bold mb-1',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {isZh ? selectedChallengeData.titleZh : selectedChallengeData.titleEn}
                    </h2>
                    <p className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-yellow-400/80' : 'text-yellow-600'
                    )}>
                      {isZh ? selectedChallengeData.subtitleZh : selectedChallengeData.subtitleEn}
                    </p>
                  </div>
                </div>

                {/* Core Question */}
                <div className={cn(
                  'p-4 rounded-lg mb-4',
                  theme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-50'
                )}>
                  <div className="flex items-start gap-3">
                    <Brain className={cn(
                      'w-5 h-5 mt-0.5 flex-shrink-0',
                      theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                    )} />
                    <div>
                      <h4 className={cn(
                        'font-semibold mb-1',
                        theme === 'dark' ? 'text-cyan-300' : 'text-cyan-800'
                      )}>
                        {isZh ? '核心问题' : 'Core Question'}
                      </h4>
                      <p className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-cyan-100/80' : 'text-cyan-700'
                      )}>
                        {isZh ? selectedChallengeData.coreQuestionZh : selectedChallengeData.coreQuestionEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="mb-4">
                  <h4 className={cn(
                    'font-semibold mb-2',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '研究背景' : 'Background'}
                  </h4>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh ? selectedChallengeData.backgroundZh : selectedChallengeData.backgroundEn}
                  </p>
                </div>

                {/* Significance */}
                <div className="mb-4">
                  <h4 className={cn(
                    'font-semibold mb-2',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '研究意义' : 'Significance'}
                  </h4>
                  <ul className="space-y-1">
                    {(isZh ? selectedChallengeData.significanceZh : selectedChallengeData.significanceEn).map((item, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-start gap-2 text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tasks */}
              <div className={cn(
                'p-6 rounded-xl border',
                theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'
              )}>
                <h3 className={cn(
                  'text-lg font-bold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {isZh ? '研究任务' : 'Research Tasks'}
                </h3>
                <div className="space-y-4">
                  {selectedChallengeData.tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                          theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className={cn(
                            'font-semibold mb-1',
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          )}>
                            {isZh ? task.titleZh : task.titleEn}
                          </h4>
                          <p className={cn(
                            'text-sm',
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          )}>
                            {isZh ? task.descriptionZh : task.descriptionEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods & Expected Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn(
                  'p-5 rounded-xl border',
                  theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'
                )}>
                  <h4 className={cn(
                    'font-semibold mb-3',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '研究方法' : 'Methods'}
                  </h4>
                  <ul className="space-y-2">
                    {(isZh ? selectedChallengeData.methodsZh : selectedChallengeData.methodsEn).map((method, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        <Beaker className="w-4 h-4 flex-shrink-0 text-cyan-500" />
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn(
                  'p-5 rounded-xl border',
                  theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'
                )}>
                  <h4 className={cn(
                    'font-semibold mb-3',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '预期成果' : 'Expected Outcomes'}
                  </h4>
                  <ul className="space-y-2">
                    {(isZh ? selectedChallengeData.expectedOutcomesZh : selectedChallengeData.expectedOutcomesEn).map((outcome, i) => (
                      <li
                        key={i}
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0 text-green-500" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Source Code & Data Source */}
              {(selectedChallengeData.sourceCodeUrl || selectedChallengeData.dataSourceZh) && (
                <div className={cn(
                  'p-5 rounded-xl border',
                  theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-gray-200'
                )}>
                  <h4 className={cn(
                    'font-semibold mb-3',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '资源链接' : 'Resources'}
                  </h4>
                  <div className="space-y-2">
                    {selectedChallengeData.sourceCodeUrl && (
                      <a
                        href={selectedChallengeData.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                        )}
                      >
                        <Github className="w-4 h-4" />
                        {isZh ? '源代码仓库' : 'Source Code Repository'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedChallengeData.dataSourceZh && (
                      <p className={cn(
                        'flex items-center gap-2 text-sm',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        <Microscope className="w-4 h-4" />
                        {isZh ? selectedChallengeData.dataSourceZh : selectedChallengeData.dataSourceEn}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guided Tasks Tab - 引导任务 */}
          {activeTab === 'tasks' && (
            <>
              {/* Difficulty filter */}
              <div className={cn(
                'flex flex-wrap gap-2 mb-6 p-3 rounded-lg',
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
              )}>
                <button
                  onClick={() => setDifficultyFilter('')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    !difficultyFilter
                      ? 'bg-yellow-500 text-white'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  )}
                >
                  {isZh ? '全部' : 'All'}
                </button>
                {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setDifficultyFilter(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      difficultyFilter === key
                        ? 'bg-yellow-500 text-white'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    )}
                  >
                    {isZh ? val.zh : val.en}
                  </button>
                ))}
              </div>

              {/* Tasks grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard key={task.id} task={task} onStart={handleStartTask} />
                ))}
              </div>
            </>
          )}

          {/* Collaboration Tab - 协作空间 */}
          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className={cn(
                'p-4 rounded-xl border',
                theme === 'dark' ? 'bg-cyan-900/20 border-cyan-700/30' : 'bg-cyan-50 border-cyan-200'
              )}>
                <div className="flex items-start gap-3">
                  <Users className={cn(
                    'w-5 h-5 mt-0.5',
                    theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                  )} />
                  <div>
                    <h4 className={cn(
                      'font-semibold',
                      theme === 'dark' ? 'text-cyan-300' : 'text-cyan-800'
                    )}>
                      {isZh ? '协作空间：与同学一起探索' : 'Collaboration Space: Explore Together'}
                    </h4>
                    <p className={cn(
                      'text-sm mt-1',
                      theme === 'dark' ? 'text-cyan-200/70' : 'text-cyan-700'
                    )}>
                      {isZh
                        ? '加入研究小组，分享你的发现，讨论分析方法，互相帮助解决研究难题。'
                        : 'Join research groups, share your findings, discuss analysis methods, and help each other solve research challenges.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collaboration Spaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLLABORATION_SPACES.map(space => (
                  <CollaborationCard key={space.id} space={space} />
                ))}
              </div>
            </div>
          )}

          {/* Showcase Tab - 成果展示 */}
          {activeTab === 'showcase' && (
            <div className={cn(
              'text-center py-12 rounded-xl border',
              theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            )}>
              <Award className={cn(
                'w-12 h-12 mx-auto mb-4',
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              )} />
              <h3 className={cn(
                'text-xl font-semibold mb-2',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {isZh ? '成果展示' : 'Research Showcase'}
              </h3>
              <p className={cn(
                'text-sm mb-4 max-w-md mx-auto',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {isZh
                  ? '完成开放挑战或引导任务后，你的研究成果将在这里展示。其他学员可以查看、学习和评论。'
                  : 'After completing open challenges or guided tasks, your research results will be displayed here. Other learners can view, learn from, and comment on your work.'}
              </p>
              <div className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm',
                theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              )}>
                <Lightbulb className="w-4 h-4" />
                {isZh ? '完成任务以解锁' : 'Complete tasks to unlock'}
              </div>
            </div>
          )}
        </main>

        {/* Research Task Modal */}
        <ResearchTaskModal />
      </div>
    </>
  )
}

export default LabPage
