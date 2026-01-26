/**
 * Experiments Page - Polarization Creation Bureau (偏振造物局)
 * 偏振造物局 - 艺术与DIY创作中心
 *
 * Sub-modules:
 * 1. DIY实验 - Hands-on experiments with everyday materials
 * 2. 偏振文创 - Polarization-themed creative products
 * 3. 作品展示 - Community gallery and works showcase
 * 4. 创作工坊 - Creative workshop and tutorials
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { Badge, Tabs, PersistentHeader } from '@/components/shared'
import { PolarizationArt, ArtGallery, MATERIAL_PRESETS } from '@/components/shared/PolarizationArt'
import type { PolarizationArtParams, CrystalAxisMode } from '@/data/types'
import { ExperimentTools, EXPERIMENT_TOOLS, CulturalShowcase } from '@/components/experiments'
import {
  getCompletedProjects,
  getSemesterLabel,
  getCategoryLabel,
  getStatusLabel,
  type StudentProject,
  type ProjectYearGroup,
} from '@/data/student-projects'
import {
  Beaker, Clock, DollarSign, AlertTriangle, ChevronRight,
  CheckCircle2, Star, Lightbulb, Camera, X,
  ShoppingBag, Eye, GraduationCap,
  Palette, ImageIcon, Sparkles, Package, Heart,
  Scissors, Brush, Layers, Wrench, BookOpen, Film,
  Wand2, Download, RefreshCw, Play, Pause, Image, FileVideo
} from 'lucide-react'

// Tab type definition
type TabId = 'diy' | 'showcase' | 'gallery' | 'workshop' | 'generator' | 'projects'

// Valid tab IDs for route matching
const VALID_TABS: TabId[] = ['diy', 'showcase', 'gallery', 'workshop', 'generator', 'projects']

// Experiment difficulty and cost levels
type Difficulty = 'easy' | 'medium' | 'hard'
type CostLevel = 'free' | 'low' | 'medium'

// Experiment data interface
interface Experiment {
  id: string
  nameEn: string
  nameZh: string
  descriptionEn: string
  descriptionZh: string
  difficulty: Difficulty
  duration: number // minutes
  cost: CostLevel
  materials: {
    en: string[]
    zh: string[]
  }
  steps: {
    en: string[]
    zh: string[]
  }
  scienceEn: string
  scienceZh: string
  tips?: {
    en: string[]
    zh: string[]
  }
  safetyNotes?: {
    en: string[]
    zh: string[]
  }
  tags: string[]
  relatedDemo?: string
  photoIdeas?: {
    en: string[]
    zh: string[]
  }
}

// Experiments catalog
const EXPERIMENTS: Experiment[] = [
  {
    id: 'phone-polarizer',
    nameEn: 'Phone Screen Polarizer Magic',
    nameZh: '手机屏幕偏振魔法',
    descriptionEn: 'Discover polarization using your smartphone screen and a polarizing filter.',
    descriptionZh: '使用智能手机屏幕和偏振片发现偏振光。',
    difficulty: 'easy',
    duration: 10,
    cost: 'low',
    materials: {
      en: [
        'Smartphone with LCD screen',
        'Polarizing film or sunglasses (polarized)',
        'Optional: Second polarizing film',
      ],
      zh: [
        '带LCD屏幕的智能手机',
        '偏振片薄膜或偏振太阳镜',
        '可选：第二片偏振薄膜',
      ],
    },
    steps: {
      en: [
        'Turn on your phone\'s flashlight or display a white screen',
        'Hold the polarizing filter in front of the screen',
        'Slowly rotate the filter while watching the screen',
        'Notice how the screen darkens and brightens as you rotate',
        'At 90° rotation, the screen should appear nearly black',
        'Try looking at other LCD screens (monitors, watches) through the polarizer',
      ],
      zh: [
        '打开手机的手电筒或显示白色屏幕',
        '将偏振片放在屏幕前面',
        '缓慢旋转滤片同时观察屏幕',
        '注意随着旋转屏幕如何变暗和变亮',
        '旋转到90°时，屏幕应该几乎变黑',
        '尝试通过偏振片观看其他LCD屏幕（显示器、手表）',
      ],
    },
    scienceEn: 'LCD screens emit polarized light. The front polarizer of an LCD is oriented to transmit this light to your eyes. When you add an external polarizer and rotate it, you\'re applying Malus\'s Law: I = I₀ cos²θ. At 90°, almost no light passes through.',
    scienceZh: 'LCD屏幕发出偏振光。LCD的前偏振片定向以将此光传输到你的眼睛。当你添加外部偏振片并旋转它时，你正在应用马吕斯定律：I = I₀ cos²θ。在90°时，几乎没有光通过。',
    tips: {
      en: [
        'OLED screens work differently - try both types!',
        'The effect is more dramatic in a dark room',
        'Try tilting your head while wearing polarized sunglasses to see car dashboard screens dim',
      ],
      zh: [
        'OLED屏幕工作原理不同 - 两种都试试！',
        '在暗室中效果更明显',
        '戴着偏振太阳镜歪头试试看汽车仪表盘屏幕变暗',
      ],
    },
    tags: ['malus-law', 'lcd', 'beginner-friendly'],
    relatedDemo: 'malus',
    photoIdeas: {
      en: [
        'Capture the screen at different rotation angles',
        'Show a "split" view with half bright, half dark',
      ],
      zh: [
        '在不同旋转角度拍摄屏幕',
        '展示一半亮一半暗的"分割"视图',
      ],
    },
  },
  {
    id: 'tape-art',
    nameEn: 'Tape Birefringence Art',
    nameZh: '胶带双折射艺术',
    descriptionEn: 'Create stunning colorful patterns using transparent tape between polarizers.',
    descriptionZh: '使用透明胶带在偏振片之间创造令人惊叹的彩色图案。',
    difficulty: 'easy',
    duration: 20,
    cost: 'low',
    materials: {
      en: [
        'Clear cellophane tape (Scotch tape)',
        'Two polarizing films',
        'Glass slide or clear plastic sheet',
        'Light source (phone screen or lamp)',
        'Scissors',
      ],
      zh: [
        '透明玻璃纸胶带（透明胶带）',
        '两片偏振薄膜',
        '玻璃片或透明塑料片',
        '光源（手机屏幕或台灯）',
        '剪刀',
      ],
    },
    steps: {
      en: [
        'Cut and layer pieces of tape on the glass slide in patterns',
        'Overlap tape pieces at different angles for variety',
        'Place one polarizer under the slide, one above',
        'Illuminate from below (phone screen works great)',
        'Rotate the top polarizer to see colors change',
        'Add more tape layers to create new colors',
      ],
      zh: [
        '将胶带剪成片并以图案形式层叠在玻璃片上',
        '以不同角度重叠胶带片以增加变化',
        '在玻璃片下放一个偏振片，上面放另一个',
        '从下方照明（手机屏幕效果很好）',
        '旋转顶部偏振片观看颜色变化',
        '添加更多胶带层以创造新颜色',
      ],
    },
    scienceEn: 'Cellophane tape is birefringent - it has different refractive indices for different polarization directions. When polarized light passes through, the two components travel at different speeds, creating a phase difference. Between crossed polarizers, this phase difference converts to visible colors depending on tape thickness and orientation.',
    scienceZh: '玻璃纸胶带具有双折射性 - 对不同偏振方向有不同的折射率。当偏振光通过时，两个分量以不同速度传播，产生相位差。在正交偏振片之间，这种相位差根据胶带厚度和取向转换为可见颜色。',
    tips: {
      en: [
        'Different tape brands have different birefringence - experiment!',
        'Multiple layers create different colors',
        'Try stretching tape for different effects',
        'This makes great wall art when backlit',
      ],
      zh: [
        '不同品牌的胶带有不同的双折射性 - 多试试！',
        '多层产生不同颜色',
        '试试拉伸胶带获得不同效果',
        '背光照射时可以做成很棒的墙面艺术',
      ],
    },
    tags: ['birefringence', 'art', 'beginner-friendly'],
    relatedDemo: 'chromatic',
    photoIdeas: {
      en: [
        'Create abstract geometric patterns',
        'Make a "stained glass" window effect',
        'Document color changes as you rotate the analyzer',
      ],
      zh: [
        '创建抽象几何图案',
        '制作"彩色玻璃"窗效果',
        '记录旋转检偏器时的颜色变化',
      ],
    },
  },
  {
    id: 'sugar-rotation',
    nameEn: 'Sugar Solution Optical Rotation',
    nameZh: '糖溶液旋光实验',
    descriptionEn: 'Watch polarization rotate as light passes through sugar water.',
    descriptionZh: '观察光通过糖水时偏振方向的旋转。',
    difficulty: 'medium',
    duration: 30,
    cost: 'low',
    materials: {
      en: [
        'Clear container (glass or plastic tube/jar)',
        'Sugar (table sugar or corn syrup works best)',
        'Water',
        'Two polarizing films',
        'Bright light source',
        'Measuring spoons',
      ],
      zh: [
        '透明容器（玻璃或塑料管/罐）',
        '糖（食用糖或玉米糖浆效果最佳）',
        '水',
        '两片偏振薄膜',
        '明亮光源',
        '量匙',
      ],
    },
    steps: {
      en: [
        'Dissolve sugar in water to make a concentrated solution (more is better)',
        'Pour into clear container',
        'Set up polarizer - container - analyzer arrangement',
        'Shine light through and observe through the analyzer',
        'Rotate the analyzer to find the extinction position',
        'Note how much rotation is needed compared to pure water',
        'Try different sugar concentrations and compare',
      ],
      zh: [
        '将糖溶于水制成浓溶液（越浓越好）',
        '倒入透明容器',
        '设置起偏器 - 容器 - 检偏器排列',
        '让光通过并通过检偏器观察',
        '旋转检偏器找到消光位置',
        '注意与纯水相比需要旋转多少',
        '尝试不同糖浓度并比较',
      ],
    },
    scienceEn: 'Sugar molecules are chiral (asymmetric). When polarized light passes through, the electric field interacts differently with left and right-handed molecular orientations, causing the polarization plane to rotate. The rotation angle is proportional to concentration and path length: α = [α]·c·l.',
    scienceZh: '糖分子是手性的（不对称的）。当偏振光通过时，电场与左旋和右旋分子取向的相互作用不同，导致偏振平面旋转。旋转角度与浓度和光程成正比：α = [α]·c·l。',
    tips: {
      en: [
        'Corn syrup is more concentrated and shows stronger rotation',
        'Use a longer container for more noticeable effect',
        'This is exactly how polarimeters measure sugar content in industry',
        'Try honey - it also rotates polarization!',
      ],
      zh: [
        '玉米糖浆浓度更高，显示更强的旋转',
        '使用更长的容器以获得更明显的效果',
        '这正是工业中偏振计测量糖含量的原理',
        '试试蜂蜜 - 它也能旋转偏振！',
      ],
    },
    tags: ['optical-activity', 'chemistry'],
    relatedDemo: 'optical-rotation',
    photoIdeas: {
      en: [
        'Show side-by-side comparison of water vs sugar solution',
        'Demonstrate color changes with white light source',
      ],
      zh: [
        '展示水与糖溶液的并排比较',
        '用白光光源演示颜色变化',
      ],
    },
  },
  {
    id: 'plastic-stress',
    nameEn: 'Stress Patterns in Plastics',
    nameZh: '塑料应力图案',
    descriptionEn: 'Reveal hidden stress in everyday plastic objects using crossed polarizers.',
    descriptionZh: '使用正交偏振片揭示日常塑料物品中的隐藏应力。',
    difficulty: 'easy',
    duration: 15,
    cost: 'low',
    materials: {
      en: [
        'Clear plastic objects (CD cases, rulers, utensils, bottles)',
        'Two polarizing films',
        'Light source',
        'Optional: Clear plastic items you can bend',
      ],
      zh: [
        '透明塑料物品（CD盒、尺子、餐具、瓶子）',
        '两片偏振薄膜',
        '光源',
        '可选：可以弯曲的透明塑料物品',
      ],
    },
    steps: {
      en: [
        'Set up crossed polarizers (rotate until nearly black)',
        'Place plastic object between the polarizers',
        'Look for colorful patterns - these show internal stress',
        'Try bending the plastic and watch stress patterns change',
        'Compare injection molded items vs extruded items',
        'Look at plastic forks - the tines often show stress',
      ],
      zh: [
        '设置正交偏振片（旋转直到几乎变黑）',
        '将塑料物品放在偏振片之间',
        '寻找彩色图案 - 这些显示内部应力',
        '尝试弯曲塑料并观察应力图案变化',
        '比较注塑成型与挤出成型的物品',
        '看看塑料叉子 - 叉齿通常显示应力',
      ],
    },
    scienceEn: 'When plastic is stressed (during manufacturing or bending), it becomes birefringent. Different stress levels create different amounts of phase retardation, which appears as different colors between crossed polarizers. The color sequence follows the Michel-Lévy chart.',
    scienceZh: '当塑料受力（在制造或弯曲过程中）时，它变得具有双折射性。不同的应力水平产生不同量的相位延迟，在正交偏振片之间显示为不同颜色。颜色序列遵循米歇尔-列维图表。',
    tips: {
      en: [
        'CD jewel cases are great - they have complex molding patterns',
        'Try warming and cooling plastic to see stress changes',
        'This technique is used by engineers to design stronger parts',
        'Car windshields show stress patterns too!',
      ],
      zh: [
        'CD盒效果很好 - 它们有复杂的成型图案',
        '尝试加热和冷却塑料以观察应力变化',
        '工程师使用这种技术来设计更强的部件',
        '汽车挡风玻璃也会显示应力图案！',
      ],
    },
    safetyNotes: {
      en: ['Be careful not to break plastic items while bending'],
      zh: ['弯曲时注意不要折断塑料物品'],
    },
    tags: ['stress', 'birefringence', 'engineering'],
    relatedDemo: 'anisotropy',
    photoIdeas: {
      en: [
        'Document stress rainbow in CD cases',
        'Show real-time stress as you bend a ruler',
      ],
      zh: [
        '记录CD盒中的应力彩虹',
        '展示弯曲尺子时的实时应力',
      ],
    },
  },
  {
    id: 'sky-polarization',
    nameEn: 'Sky Polarization Mapping',
    nameZh: '天空偏振观测',
    descriptionEn: 'Observe and map the polarization pattern in the sky.',
    descriptionZh: '观察并绘制天空中的偏振图案。',
    difficulty: 'medium',
    duration: 30,
    cost: 'free',
    materials: {
      en: [
        'Polarizing sunglasses or polarizing film',
        'Clear sky day (best at sunrise/sunset)',
        'Notebook for recording observations',
        'Compass (optional, for orientation)',
      ],
      zh: [
        '偏振太阳镜或偏振薄膜',
        '晴朗的天气（日出/日落时最佳）',
        '记录观察的笔记本',
        '指南针（可选，用于定向）',
      ],
    },
    steps: {
      en: [
        'Go outside on a clear day, preferably morning or evening',
        'Look at different parts of the sky through the polarizer',
        'Rotate the polarizer while looking at each direction',
        'Note where the sky darkens most (90° from sun)',
        'Map out the polarization pattern across the sky',
        'Try looking at clouds - they depolarize the light',
        'Compare polarization at different times of day',
      ],
      zh: [
        '在晴朗的日子外出，最好是早晨或傍晚',
        '通过偏振片观察天空的不同部分',
        '在观察每个方向时旋转偏振片',
        '注意天空在哪里变暗最多（距太阳90°）',
        '绘制整个天空的偏振图案',
        '尝试观察云层 - 它们使光去偏振',
        '比较一天中不同时间的偏振',
      ],
    },
    scienceEn: 'Sunlight scattered by air molecules (Rayleigh scattering) becomes polarized perpendicular to the scattering plane. Maximum polarization occurs at 90° from the sun. This pattern is how bees and many other animals navigate!',
    scienceZh: '被空气分子散射的阳光（瑞利散射）变成垂直于散射平面的偏振光。最大偏振度出现在距太阳90°处。这个图案就是蜜蜂和许多其他动物导航的方式！',
    tips: {
      en: [
        'The effect is strongest in a direction 90° from the sun',
        'Clouds and haze reduce polarization',
        'Try this at the beach - reflected light is also polarized',
        'Photographers use this effect to darken blue skies',
      ],
      zh: [
        '在距太阳90°的方向效果最强',
        '云和雾霾会减少偏振',
        '在海滩试试 - 反射光也是偏振的',
        '摄影师利用这一效果使蓝天更深沉',
      ],
    },
    tags: ['rayleigh', 'nature', 'navigation'],
    relatedDemo: 'rayleigh',
    photoIdeas: {
      en: [
        'Take photos of sky with and without polarizer',
        'Create a panorama showing polarization gradient',
      ],
      zh: [
        '拍摄有无偏振片的天空照片',
        '创建显示偏振梯度的全景图',
      ],
    },
  },
  {
    id: 'reflection-angle',
    nameEn: 'Brewster\'s Angle Discovery',
    nameZh: '布儒斯特角发现',
    descriptionEn: 'Find the angle where reflected light becomes perfectly polarized.',
    descriptionZh: '找到反射光变成完全偏振的角度。',
    difficulty: 'medium',
    duration: 25,
    cost: 'low',
    materials: {
      en: [
        'Flat glass surface (window, glass table, mirror)',
        'Polarizing film',
        'Light source (flashlight)',
        'Protractor (optional)',
        'Dark background',
      ],
      zh: [
        '平坦玻璃表面（窗户、玻璃桌、镜子）',
        '偏振薄膜',
        '光源（手电筒）',
        '量角器（可选）',
        '深色背景',
      ],
    },
    steps: {
      en: [
        'Shine light onto glass surface at various angles',
        'View the reflected light through the polarizer',
        'Rotate the polarizer while adjusting the viewing angle',
        'Find the angle where rotating the polarizer makes reflection disappear',
        'This is Brewster\'s angle (about 56° for glass)',
        'The reflected light at this angle is completely polarized',
        'Measure the angle with a protractor if possible',
      ],
      zh: [
        '以各种角度将光照射到玻璃表面',
        '通过偏振片观察反射光',
        '在调整观察角度的同时旋转偏振片',
        '找到旋转偏振片可使反射消失的角度',
        '这就是布儒斯特角（玻璃约为56°）',
        '在此角度反射光完全偏振',
        '如果可能，用量角器测量角度',
      ],
    },
    scienceEn: 'At Brewster\'s angle, the reflected and refracted rays are perpendicular. At this angle, the p-polarized light (in the plane of incidence) cannot be reflected because dipoles cannot radiate along their axis. Only s-polarized light reflects, making it 100% polarized.',
    scienceZh: '在布儒斯特角，反射光线和折射光线垂直。在此角度，p偏振光（在入射平面内）无法反射，因为偶极子无法沿其轴向辐射。只有s偏振光反射，使其100%偏振。',
    tips: {
      en: [
        'A calm water surface works too - Brewster\'s angle for water is about 53°',
        'This is why polarizing sunglasses reduce glare from roads and water',
        'Try finding Brewster\'s angle for different materials',
        'The angle reveals the refractive index: tan(θ_B) = n',
      ],
      zh: [
        '平静的水面也可以 - 水的布儒斯特角约为53°',
        '这就是偏振太阳镜减少路面和水面眩光的原因',
        '尝试找到不同材料的布儒斯特角',
        '角度揭示折射率：tan(θ_B) = n',
      ],
    },
    tags: ['brewster', 'reflection', 'optics'],
    relatedDemo: 'brewster',
    photoIdeas: {
      en: [
        'Show reflection before and after at Brewster\'s angle',
        'Compare polarization of reflections at different angles',
      ],
      zh: [
        '展示布儒斯特角前后的反射',
        '比较不同角度反射的偏振',
      ],
    },
  },
  {
    id: 'lcd-teardown',
    nameEn: 'LCD Screen Teardown',
    nameZh: 'LCD屏幕拆解',
    descriptionEn: 'Understand how LCD displays work by extracting polarizers from old screens.',
    descriptionZh: '通过从旧屏幕中提取偏振片来了解LCD显示器的工作原理。',
    difficulty: 'hard',
    duration: 45,
    cost: 'free',
    materials: {
      en: [
        'Old/broken LCD device (calculator, phone, monitor)',
        'Small screwdriver set',
        'Tweezers',
        'Heat gun or hair dryer (optional)',
        'Safety glasses',
        'Work gloves',
      ],
      zh: [
        '旧/坏的LCD设备（计算器、手机、显示器）',
        '小型螺丝刀套装',
        '镊子',
        '热风枪或吹风机（可选）',
        '安全眼镜',
        '工作手套',
      ],
    },
    steps: {
      en: [
        'Disassemble the device carefully to expose the LCD panel',
        'Locate the polarizing films (front and back of LCD)',
        'Carefully peel off the polarizing films (heat helps loosen adhesive)',
        'You now have two polarizers you can use for experiments!',
        'Look at the LCD without polarizers - you\'ll see it looks gray',
        'Place one polarizer back and watch the display work partially',
        'Examine the liquid crystal layer if visible',
      ],
      zh: [
        '小心拆卸设备以露出LCD面板',
        '找到偏振薄膜（LCD的前后两面）',
        '小心剥离偏振薄膜（加热有助于松开粘合剂）',
        '现在你有两个可用于实验的偏振片了！',
        '观察没有偏振片的LCD - 你会看到它呈灰色',
        '放回一个偏振片，观察显示屏部分工作',
        '如果可见，检查液晶层',
      ],
    },
    scienceEn: 'LCDs use two polarizers at 90° (crossed). The liquid crystal layer rotates polarization when no voltage is applied, allowing light through. Voltage straightens the crystals, blocking light. Each pixel is a tiny polarization modulator!',
    scienceZh: 'LCD使用两个90°（正交）的偏振片。无电压时液晶层旋转偏振，允许光通过。电压使晶体伸直，阻挡光线。每个像素都是一个微小的偏振调制器！',
    tips: {
      en: [
        'Old calculators are easiest to start with',
        'Polarizers from monitors are larger and better quality',
        'The extracted polarizers are great for other experiments',
        'Handle carefully - the films can tear easily',
      ],
      zh: [
        '旧计算器最容易开始',
        '显示器的偏振片更大质量更好',
        '提取的偏振片非常适合其他实验',
        '小心处理 - 薄膜容易撕裂',
      ],
    },
    safetyNotes: {
      en: [
        'Wear safety glasses when disassembling',
        'Be careful of sharp edges and broken glass',
        'Some displays contain hazardous materials - research first',
        'Unplug and discharge devices before disassembly',
      ],
      zh: [
        '拆卸时佩戴安全眼镜',
        '小心锋利边缘和碎玻璃',
        '某些显示器含有有害物质 - 先研究',
        '拆卸前拔掉电源并放电',
      ],
    },
    tags: ['lcd', 'electronics', 'recycling'],
    photoIdeas: {
      en: [
        'Document each layer as you disassemble',
        'Show the LCD with and without polarizers',
      ],
      zh: [
        '记录拆卸时的每一层',
        '展示有无偏振片的LCD',
      ],
    },
  },
]

const DIFFICULTY_CONFIG = {
  easy: { labelEn: 'Easy', labelZh: '简单', color: 'green' as const, icon: '🌱' },
  medium: { labelEn: 'Medium', labelZh: '中等', color: 'yellow' as const, icon: '🌿' },
  hard: { labelEn: 'Hard', labelZh: '困难', color: 'red' as const, icon: '🌳' },
}

const COST_CONFIG = {
  free: { labelEn: 'Free', labelZh: '免费', icon: '✓' },
  low: { labelEn: '$', labelZh: '低成本', icon: '$' },
  medium: { labelEn: '$$', labelZh: '中等成本', icon: '$$' },
}

const SUB_MODULE_TABS = [
  { id: 'projects', labelEn: 'Student Projects', labelZh: '学生课题', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'diy', labelEn: 'DIY Experiments', labelZh: 'DIY实验', icon: <Beaker className="w-4 h-4" /> },
  { id: 'showcase', labelEn: 'Art & Creations', labelZh: '作品与创意', icon: <Film className="w-4 h-4" /> },
  { id: 'gallery', labelEn: 'Community Gallery', labelZh: '社区展示', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'workshop', labelEn: 'Creative Workshop', labelZh: '创作工坊', icon: <Scissors className="w-4 h-4" /> },
  { id: 'generator', labelEn: 'Art Generator', labelZh: '艺术生成器', icon: <Wand2 className="w-4 h-4" /> },
]

// ===== Art Generator Component (偏振艺术生成器) =====
const ART_TYPES: { value: PolarizationArtParams['type']; labelEn: string; labelZh: string }[] = [
  { value: 'interference', labelEn: 'Interference', labelZh: '干涉图案' },
  { value: 'birefringence', labelEn: 'Birefringence', labelZh: '双折射' },
  { value: 'stress', labelEn: 'Stress Pattern', labelZh: '应力条纹' },
  { value: 'rotation', labelEn: 'Optical Rotation', labelZh: '旋光效应' },
  { value: 'abstract', labelEn: 'Abstract', labelZh: '抽象艺术' },
]

const COLOR_PRESETS = [
  { name: 'Neon', colors: ['#ff00ff', '#00ffff', '#ffff00'] },
  { name: 'RGB', colors: ['#ff4444', '#44ff44', '#4444ff'] },
  { name: 'Sunset', colors: ['#fbbf24', '#f97316', '#ef4444'] },
  { name: 'Ocean', colors: ['#22d3ee', '#0891b2', '#0e7490'] },
  { name: 'Aurora', colors: ['#a78bfa', '#8b5cf6', '#4ade80'] },
  { name: 'Fire', colors: ['#ff6b6b', '#feca57', '#ff9ff3'] },
]

// Crystal axis modes for interference patterns
const CRYSTAL_AXIS_MODES: { value: CrystalAxisMode; labelEn: string; labelZh: string; icon: string }[] = [
  { value: 'random', labelEn: 'Organic', labelZh: '自然有机', icon: '🌿' },
  { value: 'uniaxial', labelEn: 'Uniaxial', labelZh: '单轴晶体', icon: '✚' },
  { value: 'biaxial', labelEn: 'Biaxial', labelZh: '双轴晶体', icon: '👁️‍🗨️' },
]

function ArtGenerator() {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'

  // Basic state
  const [artType, setArtType] = useState<PolarizationArtParams['type']>('interference')
  const [complexity, setComplexity] = useState(6)
  const [colorPresetIdx, setColorPresetIdx] = useState(0)
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000))
  const [analyzerAngle, setAnalyzerAngle] = useState(90)

  // New state for enhanced features
  const [crystalAxisMode, setCrystalAxisMode] = useState<CrystalAxisMode>('uniaxial')
  const [materialPreset, setMaterialPreset] = useState('quartz')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isExportingGif, setIsExportingGif] = useState(false)

  // Refs for animation and canvas
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; angle: number } | null>(null)

  const params: PolarizationArtParams = useMemo(() => ({
    type: artType,
    colors: COLOR_PRESETS[colorPresetIdx].colors,
    complexity,
    analyzerAngle,
    crystalAxisMode: artType === 'interference' ? crystalAxisMode : undefined,
    materialPreset: artType === 'interference' ? materialPreset : undefined
  }), [artType, complexity, colorPresetIdx, analyzerAngle, crystalAxisMode, materialPreset])

  // Animation loop for auto-rotation
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Sinusoidal oscillation between 0° and 90° over 4 seconds
      const t = (elapsed % 4000) / 4000
      const angle = Math.round(45 + 45 * Math.sin(t * Math.PI * 2 - Math.PI / 2))
      setAnalyzerAngle(angle)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating])

  // Canvas drag handlers for direct manipulation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isAnimating) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, angle: analyzerAngle }
  }, [isAnimating, analyzerAngle])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    // 2 pixels = 1 degree of rotation
    const newAngle = Math.max(0, Math.min(90, dragStartRef.current.angle + dx / 2))
    setAnalyzerAngle(Math.round(newAngle))
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
    }
  }, [isDragging])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return
    setIsDragging(true)
    dragStartRef.current = { x: e.touches[0].clientX, angle: analyzerAngle }
  }, [isAnimating, analyzerAngle])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const newAngle = Math.max(0, Math.min(90, dragStartRef.current.angle + dx / 2))
    setAnalyzerAngle(Math.round(newAngle))
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  const regenerate = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000))
  }, [])

  const downloadSVG = useCallback(() => {
    const svg = document.getElementById('generated-art-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `polarization-art-${seed}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [seed])

  // PNG export using canvas
  const downloadPNG = useCallback(() => {
    const svg = document.getElementById('generated-art-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new window.Image()
    img.onload = () => {
      // High resolution: 2048x2048
      const canvas = document.createElement('canvas')
      canvas.width = 2048
      canvas.height = 2048
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw background
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (!blob) return
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `polarization-art-${seed}-2048x2048.png`
        a.click()
        URL.revokeObjectURL(pngUrl)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.src = url
  }, [seed])

  // Animated GIF export (simple frame capture approach)
  const exportAnimatedGif = useCallback(async () => {
    setIsExportingGif(true)

    try {
      // Capture frames by rendering SVG at different angles
      const frames: string[] = []
      const frameCount = 36 // 36 frames for smooth 90° rotation
      const originalAngle = analyzerAngle

      for (let i = 0; i < frameCount; i++) {
        const angle = Math.round((i / frameCount) * 90)
        setAnalyzerAngle(angle)
        await new Promise(resolve => setTimeout(resolve, 50)) // Wait for render

        const svg = document.getElementById('generated-art-svg')
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg)
          frames.push(svgData)
        }
      }

      // Restore original angle
      setAnalyzerAngle(originalAngle)

      // Create a simple animated preview (download as multi-frame data)
      // Note: Full GIF encoding would require a library like gif.js
      // For now, we'll create a JSON with frame data that can be processed
      const blob = new Blob([JSON.stringify({
        frames: frames.length,
        seed,
        description: 'Polarization Art Animation Frames - Convert to GIF using external tools',
        data: frames
      })], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `polarization-art-${seed}-animation.json`
      a.click()
      URL.revokeObjectURL(url)

      // Alternative: Download as PNG sequence in a zip-like format message
      alert(isZh
        ? '已导出动画帧数据！您可以使用在线工具（如 ezgif.com）将PNG序列转换为GIF。'
        : 'Animation frame data exported! Use online tools (like ezgif.com) to convert PNG sequences to GIF.')
    } catch (error) {
      logger.error('GIF export error:', error)
    } finally {
      setIsExportingGif(false)
    }
  }, [seed, analyzerAngle, isZh])

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Preview Panel with Interactive Canvas */}
      <div className="space-y-3">
        <div
          ref={canvasRef}
          className={cn(
            'aspect-square rounded-xl overflow-hidden border-2 relative select-none',
            theme === 'dark' ? 'border-pink-500/30 bg-slate-900' : 'border-pink-400/50 bg-gray-50',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            isAnimating && 'cursor-default'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <PolarizationArt
            params={params}
            seed={seed}
            width={600}
            height={600}
            className="w-full h-full pointer-events-none"
          />

          {/* Drag hint overlay */}
          {!isAnimating && (
            <div className={cn(
              'absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs',
              'bg-black/50 text-white backdrop-blur-sm transition-opacity',
              isDragging ? 'opacity-100' : 'opacity-60'
            )}>
              {isDragging
                ? `${isZh ? '检偏器' : 'Analyzer'}: ${analyzerAngle}°`
                : (isZh ? '← 拖拽旋转检偏器 →' : '← Drag to rotate analyzer →')}
            </div>
          )}

          {/* Animation indicator */}
          {isAnimating && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/80 text-white text-xs">
              <span className="animate-pulse">●</span>
              {isZh ? '动画中' : 'Animating'}
            </div>
          )}

          {/* Hidden SVG for download */}
          <div className="hidden">
            <svg id="generated-art-svg" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="600" fill="#1a1a2e" />
              <PolarizationArt params={params} seed={seed} width={600} height={600} />
            </svg>
          </div>
        </div>

        {/* Animation Control */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all',
              isAnimating
                ? 'bg-pink-500 text-white'
                : theme === 'dark'
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {isAnimating ? (
              <>
                <Pause className="w-4 h-4" />
                {isZh ? '暂停动画' : 'Pause Animation'}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {isZh ? '播放动画' : 'Animate'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        {/* Art Type */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '艺术类型' : 'Art Type'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ART_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setArtType(type.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  artType === type.value
                    ? 'bg-pink-500 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {isZh ? type.labelZh : type.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Crystal Axis Mode (only for interference type) */}
        {artType === 'interference' && (
          <div>
            <label className={cn(
              'block text-sm font-medium mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {isZh ? '晶轴模式' : 'Crystal Axis Mode'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CRYSTAL_AXIS_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setCrystalAxisMode(mode.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1',
                    crystalAxisMode === mode.value
                      ? 'bg-pink-500 text-white'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <span>{mode.icon}</span>
                  <span>{isZh ? mode.labelZh : mode.labelEn}</span>
                </button>
              ))}
            </div>
            <p className={cn(
              'text-xs mt-1',
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            )}>
              {crystalAxisMode === 'uniaxial'
                ? (isZh ? '单轴晶体：黑十字等色环（石英、方解石）' : 'Uniaxial: Black cross isogyre (Quartz, Calcite)')
                : crystalAxisMode === 'biaxial'
                  ? (isZh ? '双轴晶体：双光轴干涉图（云母、石膏）' : 'Biaxial: Two optical axes pattern (Mica, Gypsum)')
                  : (isZh ? '有机风格：自然不规则波纹' : 'Organic style: Natural irregular waviness')}
            </p>
          </div>
        )}

        {/* Material Preset (only for interference type) */}
        {artType === 'interference' && (
          <div>
            <label className={cn(
              'block text-sm font-medium mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {isZh ? '材料预设' : 'Material Preset'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {MATERIAL_PRESETS.map(material => (
                <button
                  key={material.id}
                  onClick={() => setMaterialPreset(material.id)}
                  className={cn(
                    'px-2 py-2 rounded-lg text-xs font-medium transition-all',
                    materialPreset === material.id
                      ? 'bg-pink-500 text-white'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <div className="text-center">
                    {isZh ? material.nameZh : material.name}
                  </div>
                  <div className={cn(
                    'text-[10px] mt-0.5',
                    materialPreset === material.id
                      ? 'text-pink-200'
                      : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    Δn={material.birefringence}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complexity Slider */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '复杂度' : 'Complexity'}: {complexity}
          </label>
          <input
            type="range"
            min={3}
            max={12}
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Analyzer Angle Slider */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '检偏器角度' : 'Analyzer Angle'}: {analyzerAngle}°
          </label>
          <div className="flex items-center gap-3">
            <span className={cn(
              'text-xs',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {isZh ? '平行' : 'Parallel'}
            </span>
            <input
              type="range"
              min={0}
              max={90}
              value={analyzerAngle}
              onChange={(e) => setAnalyzerAngle(Number(e.target.value))}
              className="flex-1 accent-pink-500"
            />
            <span className={cn(
              'text-xs',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {isZh ? '交叉' : 'Crossed'}
            </span>
          </div>
          <p className={cn(
            'text-xs mt-1',
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )}>
            {isZh
              ? '旋转虚拟检偏器以改变干涉颜色'
              : 'Rotate the virtual analyzer to change interference colors'}
          </p>
        </div>

        {/* Color Preset */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '配色方案' : 'Color Preset'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                onClick={() => setColorPresetIdx(idx)}
                className={cn(
                  'p-2 rounded-lg border-2 transition-all',
                  colorPresetIdx === idx
                    ? 'border-pink-500'
                    : theme === 'dark' ? 'border-slate-600' : 'border-gray-200'
                )}
              >
                <div className="flex gap-1 mb-1">
                  {preset.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className={cn(
                  'text-xs',
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                )}>
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary actions */}
          <div className="flex gap-3">
            <button
              onClick={regenerate}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
                theme === 'dark'
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              {isZh ? '重新生成' : 'Regenerate'}
            </button>
            <button
              onClick={downloadSVG}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
                theme === 'dark'
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              <Download className="w-4 h-4" />
              SVG
            </button>
          </div>

          {/* Export options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={downloadPNG}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
              )}
            >
              <Image className="w-4 h-4" />
              PNG 2K
            </button>
            <button
              onClick={exportAnimatedGif}
              disabled={isExportingGif}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
                isExportingGif && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FileVideo className="w-4 h-4" />
              {isExportingGif
                ? (isZh ? '导出中...' : 'Exporting...')
                : (isZh ? '动画帧' : 'Animation')}
            </button>
            <button
              onClick={() => {
                // Copy current settings as shareable link concept
                const shareData = {
                  type: artType,
                  mode: crystalAxisMode,
                  material: materialPreset,
                  complexity,
                  seed
                }
                navigator.clipboard.writeText(JSON.stringify(shareData))
                alert(isZh ? '参数已复制到剪贴板!' : 'Settings copied to clipboard!')
              }}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                theme === 'dark'
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {isZh ? '分享' : 'Share'}
            </button>
          </div>

          {/* Export hints */}
          <p className={cn(
            'text-xs text-center',
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )}>
            {isZh
              ? 'PNG 2K: 2048×2048 高清壁纸 | 动画帧: 可转换为GIF'
              : 'PNG 2K: 2048×2048 HD wallpaper | Animation: Convert to GIF'}
          </p>
        </div>

        {/* Info Box */}
        <div className={cn(
          'p-4 rounded-lg',
          theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
        )}>
          <h4 className={cn(
            'font-semibold text-sm mb-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '关于偏振艺术' : 'About Polarization Art'}
          </h4>
          <p className={cn(
            'text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {isZh
              ? '每种图案都基于真实的偏振光学效应：干涉图案模拟光波叠加，双折射展示晶体分光，应力条纹来自光弹性效应，旋光效应则展示偏振面的旋转。'
              : 'Each pattern is based on real polarization optics: interference simulates wave superposition, birefringence shows crystal splitting, stress patterns come from photoelasticity, and rotation shows polarization plane rotation.'}
          </p>
        </div>
      </div>
    </div>
  )
}

// Creative products data - 产品创意概念（不含价格）
interface CreativeProduct {
  id: string
  nameEn: string
  nameZh: string
  descriptionEn: string
  descriptionZh: string
  category: 'art' | 'accessory' | 'decor' | 'kit'
  imageUrl?: string
  featured?: boolean
}

const CREATIVE_PRODUCTS: CreativeProduct[] = [
  {
    id: 'tape-art-kit',
    nameEn: 'Tape Birefringence Art Kit',
    nameZh: '胶带双折射艺术套装',
    descriptionEn: 'Create stunning colorful art using tape and polarizers. Includes polarizing films and cellophane tape.',
    descriptionZh: '使用胶带和偏振片创作绚丽的彩色艺术作品。包含偏振膜和玻璃纸胶带。',
    category: 'kit',
    featured: true,
  },
  {
    id: 'polarized-coaster',
    nameEn: 'Polarization Color Coaster Set',
    nameZh: '偏振变色杯垫套装',
    descriptionEn: 'Coasters that change colors when rotated - physics you can use every day!',
    descriptionZh: '旋转时变色的杯垫 - 每天都能使用的物理学！',
    category: 'decor',
  },
  {
    id: 'stress-viewer',
    nameEn: 'Stress Visualization Frame',
    nameZh: '应力可视化相框',
    descriptionEn: 'A decorative frame with crossed polarizers - perfect for displaying stress patterns in plastic items.',
    descriptionZh: '带有正交偏振片的装饰相框 - 完美展示塑料物品中的应力图案。',
    category: 'decor',
    featured: true,
  },
  {
    id: 'polarizer-earrings',
    nameEn: 'Polarizer Earrings',
    nameZh: '偏振片耳环',
    descriptionEn: 'Wearable physics! Mini polarizers that show color changes with rotation.',
    descriptionZh: '可穿戴的物理学！迷你偏振片，旋转时显示颜色变化。',
    category: 'accessory',
  },
  {
    id: 'lcd-rescue-kit',
    nameEn: 'LCD Teardown Education Kit',
    nameZh: 'LCD拆解教学套装',
    descriptionEn: 'Learn how LCD screens work by safely disassembling and exploring old calculators.',
    descriptionZh: '通过安全拆解和探索旧计算器，学习LCD屏幕的工作原理。',
    category: 'kit',
  },
  {
    id: 'rainbow-window',
    nameEn: 'Rainbow Window Film',
    nameZh: '彩虹窗贴膜',
    descriptionEn: 'Birefringent window film that creates rainbow patterns with sunlight.',
    descriptionZh: '双折射窗户贴膜，在阳光下创造彩虹图案。',
    category: 'art',
  },
  {
    id: 'polarimeter-diy',
    nameEn: 'DIY Polarimeter Kit',
    nameZh: 'DIY旋光仪套装',
    descriptionEn: 'Build your own polarimeter to measure optical rotation of sugar solutions.',
    descriptionZh: '制作你自己的旋光仪，测量糖溶液的旋光度。',
    category: 'kit',
    featured: true,
  },
  {
    id: 'sky-mapper',
    nameEn: 'Sky Polarization Mapper',
    nameZh: '天空偏振测绘器',
    descriptionEn: 'A simple tool for mapping sky polarization patterns - like a bee!',
    descriptionZh: '一个简单的工具，用于绘制天空偏振图案 - 像蜜蜂一样！',
    category: 'kit',
  },
]

const CATEGORY_CONFIG = {
  art: { labelEn: 'Art', labelZh: '艺术', color: 'purple' as const, icon: '🎨' },
  accessory: { labelEn: 'Accessory', labelZh: '配饰', color: 'pink' as const, icon: '💫' },
  decor: { labelEn: 'Decor', labelZh: '装饰', color: 'orange' as const, icon: '🏠' },
  kit: { labelEn: 'Kit', labelZh: '套装', color: 'green' as const, icon: '📦' },
}

// Gallery works data
interface GalleryWork {
  id: string
  titleEn: string
  titleZh: string
  authorEn: string
  authorZh: string
  descriptionEn: string
  descriptionZh: string
  category: 'tape-art' | 'photography' | 'installation' | 'science' | 'student'
  likes: number
  featured?: boolean
}

const GALLERY_WORKS: GalleryWork[] = [
  {
    id: 'galaxy-tape',
    titleEn: 'Galaxy in Tape',
    titleZh: '胶带中的星系',
    authorEn: 'Zhang Wei',
    authorZh: '张伟',
    descriptionEn: 'A spiral galaxy pattern created with multiple layers of transparent tape.',
    descriptionZh: '使用多层透明胶带创作的螺旋星系图案。',
    category: 'tape-art',
    likes: 234,
    featured: true,
  },
  {
    id: 'sunset-polarizer',
    titleEn: 'Polarized Sunset',
    titleZh: '偏振日落',
    authorEn: 'Li Ming',
    authorZh: '李明',
    descriptionEn: 'Photograph of sunset captured with rotating polarizer, showing sky polarization.',
    descriptionZh: '使用旋转偏振片拍摄的日落照片，显示天空偏振。',
    category: 'photography',
    likes: 189,
    featured: true,
  },
  {
    id: 'stress-butterfly',
    titleEn: 'Butterfly Under Stress',
    titleZh: '应力蝴蝶',
    authorEn: 'Wang Fang',
    authorZh: '王芳',
    descriptionEn: 'A transparent plastic butterfly showing beautiful stress patterns.',
    descriptionZh: '透明塑料蝴蝶展示美丽的应力图案。',
    category: 'science',
    likes: 156,
  },
  {
    id: 'rainbow-sculpture',
    titleEn: 'Rainbow Light Installation',
    titleZh: '彩虹光装置',
    authorEn: 'Chen Xin',
    authorZh: '陈欣',
    descriptionEn: 'An interactive sculpture using birefringent materials and LED light.',
    descriptionZh: '使用双折射材料和LED灯的互动雕塑。',
    category: 'installation',
    likes: 312,
    featured: true,
  },
  {
    id: 'malus-demo',
    titleEn: 'Malus\'s Law Demonstration',
    titleZh: '马吕斯定律演示',
    authorEn: 'Liu Yang',
    authorZh: '刘阳',
    descriptionEn: 'A student project demonstrating Malus\'s law with Arduino-controlled rotation.',
    descriptionZh: '使用Arduino控制旋转演示马吕斯定律的学生项目。',
    category: 'student',
    likes: 87,
  },
  {
    id: 'ice-crystal',
    titleEn: 'Ice Crystal Polarimetry',
    titleZh: '冰晶偏振显微术',
    authorEn: 'Zhao Lin',
    authorZh: '赵琳',
    descriptionEn: 'Microscope images of ice crystals between crossed polarizers.',
    descriptionZh: '冰晶在正交偏振片之间的显微镜图像。',
    category: 'science',
    likes: 201,
  },
  {
    id: 'lcd-mosaic',
    titleEn: 'LCD Recycling Mosaic',
    titleZh: 'LCD回收马赛克',
    authorEn: 'Huang Yu',
    authorZh: '黄宇',
    descriptionEn: 'A mosaic artwork made from recycled LCD polarizers.',
    descriptionZh: '用回收的LCD偏振片制作的马赛克艺术品。',
    category: 'tape-art',
    likes: 145,
  },
  {
    id: 'bee-vision',
    titleEn: 'Simulating Bee Vision',
    titleZh: '模拟蜜蜂视觉',
    authorEn: 'Sun Chen',
    authorZh: '孙晨',
    descriptionEn: 'A wearable device that visualizes sky polarization patterns like bees see.',
    descriptionZh: '一种可穿戴设备，像蜜蜂一样可视化天空偏振图案。',
    category: 'science',
    likes: 278,
    featured: true,
  },
]

const GALLERY_CATEGORY_CONFIG = {
  'tape-art': { labelEn: 'Tape Art', labelZh: '胶带艺术', color: 'purple' as const },
  'photography': { labelEn: 'Photography', labelZh: '摄影', color: 'cyan' as const },
  'installation': { labelEn: 'Installation', labelZh: '装置', color: 'orange' as const },
  'science': { labelEn: 'Science', labelZh: '科学', color: 'green' as const },
  'student': { labelEn: 'Student Work', labelZh: '学生作品', color: 'blue' as const },
}

// Workshop tutorials
interface Tutorial {
  id: string
  titleEn: string
  titleZh: string
  descriptionEn: string
  descriptionZh: string
  duration: number // minutes
  difficulty: Difficulty
  materials: { en: string[]; zh: string[] }
  steps: number
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'basic-tape-art',
    titleEn: 'Basic Tape Art Techniques',
    titleZh: '基础胶带艺术技法',
    descriptionEn: 'Learn the fundamentals of creating colorful patterns with cellophane tape.',
    descriptionZh: '学习使用玻璃纸胶带创作彩色图案的基础技法。',
    duration: 30,
    difficulty: 'easy',
    materials: {
      en: ['Cellophane tape', 'Polarizing films (2)', 'Glass slide', 'Scissors'],
      zh: ['玻璃纸胶带', '偏振膜（2片）', '玻璃片', '剪刀'],
    },
    steps: 5,
  },
  {
    id: 'stress-art',
    titleEn: 'Photoelastic Art Creation',
    titleZh: '光弹艺术创作',
    descriptionEn: 'Create artistic patterns using stressed transparent materials.',
    descriptionZh: '使用受力透明材料创作艺术图案。',
    duration: 45,
    difficulty: 'medium',
    materials: {
      en: ['Clear acrylic sheet', 'Heat gun', 'Polarizing films', 'Clamps'],
      zh: ['透明亚克力板', '热风枪', '偏振膜', '夹具'],
    },
    steps: 7,
  },
  {
    id: 'polarization-photo',
    titleEn: 'Polarization Photography Guide',
    titleZh: '偏振摄影指南',
    descriptionEn: 'Master the art of using polarizing filters for stunning photography.',
    descriptionZh: '掌握使用偏振滤镜拍摄惊艳照片的艺术。',
    duration: 60,
    difficulty: 'medium',
    materials: {
      en: ['Camera', 'Circular polarizing filter', 'Tripod', 'Various subjects'],
      zh: ['相机', '圆偏振滤镜', '三脚架', '各种拍摄对象'],
    },
    steps: 8,
  },
  {
    id: 'light-box',
    titleEn: 'Build a Polarization Light Box',
    titleZh: '制作偏振光盒',
    descriptionEn: 'Create a professional-looking light box for displaying birefringent art.',
    descriptionZh: '制作一个专业外观的光盒，用于展示双折射艺术。',
    duration: 90,
    difficulty: 'hard',
    materials: {
      en: ['LED strip', 'Diffuser panel', 'Polarizing films', 'Wooden frame'],
      zh: ['LED灯条', '扩散板', '偏振膜', '木框'],
    },
    steps: 10,
  },
]

// Experiment card component
function ExperimentCard({
  experiment,
  onClick,
}: {
  experiment: Experiment
  onClick: () => void
}) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const difficulty = DIFFICULTY_CONFIG[experiment.difficulty]
  const cost = COST_CONFIG[experiment.cost]

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 cursor-pointer transition-all',
        'hover:-translate-y-1 hover:shadow-lg',
        theme === 'dark'
          ? 'bg-slate-800/50 border-slate-700 hover:border-teal-500/50'
          : 'bg-white border-gray-200 hover:border-teal-400'
      )}
    >
      {/* Title and badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={cn(
          'font-semibold flex-1',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {isZh ? experiment.nameZh : experiment.nameEn}
        </h3>
        <Badge color={difficulty.color} size="sm">
          {difficulty.icon}
        </Badge>
      </div>

      {/* Description */}
      <p className={cn(
        'text-sm line-clamp-2 mb-3',
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      )}>
        {isZh ? experiment.descriptionZh : experiment.descriptionEn}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs">
        <span className={cn(
          'flex items-center gap-1',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          <Clock className="w-3.5 h-3.5" />
          {experiment.duration} min
        </span>
        <span className={cn(
          'flex items-center gap-1',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          <DollarSign className="w-3.5 h-3.5" />
          {cost.icon}
        </span>
      </div>

      {/* View button */}
      <div className={cn(
        'mt-3 flex items-center gap-1 text-sm font-medium',
        theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
      )}>
        <span>{isZh ? '查看实验' : 'View Experiment'}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}

// Experiment detail modal
function ExperimentDetailModal({
  experiment,
  onClose,
}: {
  experiment: Experiment
  onClose: () => void
}) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const difficulty = DIFFICULTY_CONFIG[experiment.difficulty]
  const cost = COST_CONFIG[experiment.cost]

  // Tab state for Info/Tools
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'tools'>('info')

  // Check if this experiment has tools available
  const hasTools = EXPERIMENT_TOOLS[experiment.id]?.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={cn(
        'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl',
        theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white'
      )}>
        {/* Header */}
        <div className={cn(
          'sticky top-0 p-6 pb-0 border-b z-10',
          theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <button
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4 p-2 rounded-lg transition-colors',
              theme === 'dark' ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className={cn(
            'text-2xl font-bold mb-2 pr-8',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? experiment.nameZh : experiment.nameEn}
          </h2>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge color={difficulty.color}>
              {isZh ? difficulty.labelZh : difficulty.labelEn}
            </Badge>
            <span className={cn(
              'flex items-center gap-1 text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              <Clock className="w-4 h-4" />
              {experiment.duration} {isZh ? '分钟' : 'min'}
            </span>
            <span className={cn(
              'flex items-center gap-1 text-sm',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              <ShoppingBag className="w-4 h-4" />
              {isZh ? cost.labelZh : cost.labelEn}
            </span>
          </div>

          {/* Modal Tabs */}
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveModalTab('info')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
                activeModalTab === 'info'
                  ? theme === 'dark'
                    ? 'border-teal-500 text-teal-400 bg-slate-800/50'
                    : 'border-teal-500 text-teal-600 bg-teal-50'
                  : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <BookOpen className="w-4 h-4" />
              {isZh ? '实验指南' : 'Guide'}
            </button>
            <button
              onClick={() => setActiveModalTab('tools')}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
                activeModalTab === 'tools'
                  ? theme === 'dark'
                    ? 'border-teal-500 text-teal-400 bg-slate-800/50'
                    : 'border-teal-500 text-teal-600 bg-teal-50'
                  : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Wrench className="w-4 h-4" />
              {isZh ? '数字工具' : 'Tools'}
              {hasTools && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 text-[10px] rounded-full',
                  theme === 'dark' ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'
                )}>
                  {EXPERIMENT_TOOLS[experiment.id].length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeModalTab === 'tools' ? (
          <div className="p-6">
            <ExperimentTools experimentId={experiment.id} />
          </div>
        ) : (
        <div className="p-6 space-y-6">
          {/* Materials */}
          <div>
            <h3 className={cn(
              'text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2',
              theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
            )}>
              <ShoppingBag className="w-4 h-4" />
              {isZh ? '所需材料' : 'Materials Needed'}
            </h3>
            <ul className="space-y-2">
              {(isZh ? experiment.materials.zh : experiment.materials.en).map((material, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className={cn(
                    'w-4 h-4 mt-0.5 flex-shrink-0',
                    theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                  )} />
                  <span className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    {material}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Notes */}
          {experiment.safetyNotes && (
            <div className={cn(
              'p-4 rounded-lg border-l-4',
              theme === 'dark'
                ? 'bg-red-500/10 border-red-500'
                : 'bg-red-50 border-red-400'
            )}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn(
                  'w-5 h-5 flex-shrink-0',
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                )} />
                <div>
                  <h4 className={cn(
                    'text-sm font-semibold mb-1',
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  )}>
                    {isZh ? '安全注意事项' : 'Safety Notes'}
                  </h4>
                  <ul className="space-y-1">
                    {(isZh ? experiment.safetyNotes.zh : experiment.safetyNotes.en).map((note, index) => (
                      <li key={index} className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-red-300' : 'text-red-800'
                      )}>
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Steps */}
          <div>
            <h3 className={cn(
              'text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2',
              theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
            )}>
              <Beaker className="w-4 h-4" />
              {isZh ? '实验步骤' : 'Steps'}
            </h3>
            <ol className="space-y-3">
              {(isZh ? experiment.steps.zh : experiment.steps.en).map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    theme === 'dark'
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-teal-100 text-teal-700'
                  )}>
                    {index + 1}
                  </span>
                  <span className={cn(
                    'text-sm pt-0.5',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Science */}
          <div className={cn(
            'p-4 rounded-lg',
            theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
          )}>
            <h3 className={cn(
              'text-sm font-semibold mb-2 flex items-center gap-2',
              theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
            )}>
              <GraduationCap className="w-4 h-4" />
              {isZh ? '科学原理' : 'The Science'}
            </h3>
            <p className={cn(
              'text-sm leading-relaxed',
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              {isZh ? experiment.scienceZh : experiment.scienceEn}
            </p>
          </div>

          {/* Tips */}
          {experiment.tips && (
            <div>
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2',
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              )}>
                <Lightbulb className="w-4 h-4" />
                {isZh ? '小贴士' : 'Tips & Tricks'}
              </h3>
              <ul className="space-y-2">
                {(isZh ? experiment.tips.zh : experiment.tips.en).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Star className={cn(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                    )} />
                    <span className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    )}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Photo Ideas */}
          {experiment.photoIdeas && (
            <div>
              <h3 className={cn(
                'text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2',
                theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
              )}>
                <Camera className="w-4 h-4" />
                {isZh ? '拍照创意' : 'Photo Ideas'}
              </h3>
              <ul className="space-y-1">
                {(isZh ? experiment.photoIdeas.zh : experiment.photoIdeas.en).map((idea, index) => (
                  <li key={index} className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    📸 {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Demo */}
          {experiment.relatedDemo && (
            <Link
              to={`/demos?demo=${experiment.relatedDemo}`}
              className={cn(
                'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-colors',
                theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
              )}
            >
              <Eye className="w-5 h-5" />
              {isZh ? '查看相关演示' : 'View Related Demo'}
            </Link>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

// Creative product card
function ProductCard({ product }: { product: CreativeProduct }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const category = CATEGORY_CONFIG[product.category]

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg',
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
        : 'bg-white border-gray-200 hover:border-violet-400'
    )}>
      {/* Product image placeholder */}
      <div className={cn(
        'aspect-square rounded-lg mb-3 flex items-center justify-center text-4xl',
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
      )}>
        {category.icon}
      </div>

      {/* Title and badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={cn(
          'font-semibold text-sm flex-1',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {isZh ? product.nameZh : product.nameEn}
        </h3>
        {product.featured && (
          <Sparkles className={cn('w-4 h-4 flex-shrink-0', theme === 'dark' ? 'text-amber-400' : 'text-amber-500')} />
        )}
      </div>

      {/* Description */}
      <p className={cn(
        'text-xs line-clamp-2 mb-3',
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      )}>
        {isZh ? product.descriptionZh : product.descriptionEn}
      </p>

      {/* Category badge */}
      <div className="flex items-center">
        <Badge color={category.color} size="sm">
          {isZh ? category.labelZh : category.labelEn}
        </Badge>
      </div>
    </div>
  )
}

// Gallery work card
function GalleryCard({ work }: { work: GalleryWork }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const category = GALLERY_CATEGORY_CONFIG[work.category]

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg group',
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50'
        : 'bg-white border-gray-200 hover:border-cyan-400'
    )}>
      {/* Image placeholder */}
      <div className={cn(
        'aspect-video flex items-center justify-center relative',
        theme === 'dark' ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-gray-100 to-gray-200'
      )}>
        <ImageIcon className={cn('w-12 h-12', theme === 'dark' ? 'text-slate-600' : 'text-gray-400')} />
        {work.featured && (
          <span className={cn(
            'absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium',
            theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
          )}>
            ✦ {isZh ? '精选' : 'Featured'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className={cn(
            'font-semibold text-sm',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? work.titleZh : work.titleEn}
          </h3>
          <Badge color={category.color} size="sm">
            {isZh ? category.labelZh : category.labelEn}
          </Badge>
        </div>

        <p className={cn(
          'text-xs mb-2',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          {isZh ? work.authorZh : work.authorEn}
        </p>

        <p className={cn(
          'text-xs line-clamp-2 mb-2',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          {isZh ? work.descriptionZh : work.descriptionEn}
        </p>

        <div className="flex items-center gap-1">
          <Heart className={cn('w-3.5 h-3.5', theme === 'dark' ? 'text-rose-400' : 'text-rose-500')} />
          <span className={cn('text-xs', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>
            {work.likes}
          </span>
        </div>
      </div>
    </div>
  )
}

// Tutorial card
function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const { theme } = useTheme()
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh'
  const difficulty = DIFFICULTY_CONFIG[tutorial.difficulty]

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg',
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700 hover:border-pink-500/50'
        : 'bg-white border-gray-200 hover:border-pink-400'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Brush className={cn('w-5 h-5', theme === 'dark' ? 'text-pink-400' : 'text-pink-500')} />
          <h3 className={cn(
            'font-semibold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? tutorial.titleZh : tutorial.titleEn}
          </h3>
        </div>
        <Badge color={difficulty.color} size="sm">
          {difficulty.icon}
        </Badge>
      </div>

      {/* Description */}
      <p className={cn(
        'text-sm mb-3',
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      )}>
        {isZh ? tutorial.descriptionZh : tutorial.descriptionEn}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <span className={cn(
          'flex items-center gap-1',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          <Clock className="w-3.5 h-3.5" />
          {tutorial.duration} {isZh ? '分钟' : 'min'}
        </span>
        <span className={cn(
          'flex items-center gap-1',
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        )}>
          <Layers className="w-3.5 h-3.5" />
          {tutorial.steps} {isZh ? '步骤' : 'steps'}
        </span>
      </div>

      {/* Materials preview */}
      <div className={cn(
        'text-xs p-2 rounded-lg',
        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
      )}>
        <span className={cn('font-medium', theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}>
          {isZh ? '材料：' : 'Materials: '}
        </span>
        <span className={cn(theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
          {(isZh ? tutorial.materials.zh : tutorial.materials.en).slice(0, 3).join('、')}
          {tutorial.materials.en.length > 3 && '...'}
        </span>
      </div>
    </div>
  )
}

// ===== Student Project Card Component =====
interface ProjectCardProps {
  project: StudentProject
  isZh: boolean
  theme: 'dark' | 'light'
}

function ProjectCard({ project, isZh, theme }: ProjectCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 transition-all hover:shadow-lg',
      theme === 'dark'
        ? 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
        : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-violet-100/50'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-base mb-1',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? project.titleZh : project.title}
          </h3>
          <p className={cn(
            'text-sm line-clamp-2',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {isZh ? project.descriptionZh : project.description}
          </p>
        </div>
        {project.featured && (
          <Star className={cn('w-4 h-4 flex-shrink-0 ml-2', theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500')} />
        )}
      </div>

      {/* Students */}
      {project.students.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className={cn('w-3.5 h-3.5', theme === 'dark' ? 'text-violet-400' : 'text-violet-600')} />
          <span className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
            {isZh && project.studentsZh
              ? project.studentsZh.join('、')
              : project.students.join(', ')}
          </span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category */}
        <span className={cn(
          'text-xs px-2 py-1 rounded-full font-medium',
          theme === 'dark'
            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
            : 'bg-violet-100 text-violet-700 border border-violet-300'
        )}>
          {getCategoryLabel(project.category, isZh ? 'zh' : 'en')}
        </span>

        {/* Status */}
        <span className={cn(
          'text-xs px-2 py-1 rounded-full font-medium',
          project.status === 'completed'
            ? theme === 'dark'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-green-100 text-green-700 border border-green-300'
            : project.status === 'in-progress'
              ? theme === 'dark'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
              : theme === 'dark'
                ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
        )}>
          {getStatusLabel(project.status, isZh ? 'zh' : 'en')}
        </span>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <>
            {(isZh ? project.keywordsZh : project.keywords)?.slice(0, 2).map((keyword, idx) => (
              <span key={idx} className={cn(
                'text-xs px-2 py-1 rounded-full',
                theme === 'dark'
                  ? 'bg-slate-700 text-gray-300'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {keyword}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Abstract (if available) */}
      {project.abstract && (
        <details className="mt-3">
          <summary className={cn(
            'text-xs cursor-pointer hover:underline',
            theme === 'dark' ? 'text-violet-400' : 'text-violet-600'
          )}>
            {isZh ? '查看摘要' : 'View Abstract'}
          </summary>
          <p className={cn(
            'mt-2 text-xs p-3 rounded-lg',
            theme === 'dark'
              ? 'bg-slate-900/50 text-gray-300'
              : 'bg-gray-50 text-gray-600'
          )}>
            {isZh && project.abstractZh ? project.abstractZh : project.abstract}
          </p>
        </details>
      )}

      {/* Links */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t">
        {project.poster && (
          <a
            href={project.poster}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 text-xs hover:underline',
              theme === 'dark' ? 'text-violet-400' : 'text-violet-600'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {isZh ? '海报' : 'Poster'}
          </a>
        )}
        {project.report && (
          <a
            href={project.report}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 text-xs hover:underline',
              theme === 'dark' ? 'text-violet-400' : 'text-violet-600'
            )}
          >
            <FileVideo className="w-3.5 h-3.5" />
            {isZh ? '报告' : 'Report'}
          </a>
        )}
        {project.demoLink && (
          <Link
            to={project.demoLink}
            className={cn(
              'flex items-center gap-1 text-xs hover:underline',
              theme === 'dark' ? 'text-violet-400' : 'text-violet-600'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            {isZh ? '相关演示' : 'Demo'}
          </Link>
        )}
      </div>
    </div>
  )
}

export function ExperimentsPage() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const isZh = i18n.language === 'zh'
  const { tabId } = useParams<{ tabId?: string }>()
  const navigate = useNavigate()

  // Determine active tab from URL param or default to 'diy'
  const getActiveTab = (): TabId => {
    if (tabId && VALID_TABS.includes(tabId as TabId)) {
      return tabId as TabId
    }
    return 'projects'
  }

  const [activeTab, setActiveTab] = useState<TabId>(getActiveTab())
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Sync active tab with URL
  useEffect(() => {
    const newTab = getActiveTab()
    if (newTab !== activeTab) {
      setActiveTab(newTab)
      setFilterCategory('all')
      setFilterDifficulty('all')
    }
  }, [tabId])

  // Handle tab change - navigate to new route
  const handleTabChange = (newTabId: string) => {
    const tab = newTabId as TabId
    setActiveTab(tab)
    setFilterCategory('all')
    setFilterDifficulty('all')
    navigate(`/gallery/${tab}`)
  }

  // Filter experiments
  const filteredExperiments = filterDifficulty === 'all'
    ? EXPERIMENTS
    : EXPERIMENTS.filter(exp => exp.difficulty === filterDifficulty)

  // Filter products by category
  const filteredProducts = filterCategory === 'all'
    ? CREATIVE_PRODUCTS
    : CREATIVE_PRODUCTS.filter(p => p.category === filterCategory)

  // Filter gallery works by category
  const filteredWorks = filterCategory === 'all'
    ? GALLERY_WORKS
    : GALLERY_WORKS.filter(w => w.category === filterCategory)

  return (
    <div className={cn(
      'min-h-screen',
      theme === 'dark'
        ? 'bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a2a]'
        : 'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0f9ff]'
    )}>
      {/* Header with Persistent Logo */}
      <PersistentHeader
        moduleKey="creativeLab"
        moduleNameKey="home.creativeLab.title"
        variant="glass"
        className={cn(
          'sticky top-0 z-40',
          theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'
        )}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Sub-module Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={SUB_MODULE_TABS.map(tab => ({
              ...tab,
              label: isZh ? tab.labelZh : tab.labelEn,
            }))}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>

        {/* Tab-specific content */}
        {activeTab === 'diy' && (
          <>
            {/* Intro Banner */}
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              theme === 'dark'
                ? 'bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-teal-700/30'
                : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200'
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  theme === 'dark' ? 'bg-teal-500/20' : 'bg-teal-100'
                )}>
                  <Beaker className={cn('w-7 h-7', theme === 'dark' ? 'text-teal-400' : 'text-teal-600')} />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    'text-lg font-semibold mb-1',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '用身边材料探索偏振光的奥秘' : 'Explore Polarization with Everyday Materials'}
                  </h2>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh
                      ? '这些实验使用手机、胶带、塑料等日常物品，无需昂贵设备即可在家体验偏振光的魅力。'
                      : 'These experiments use phones, tape, plastic and other household items. No expensive equipment needed!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterDifficulty('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filterDifficulty === 'all'
                ? theme === 'dark'
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                  : 'bg-teal-100 text-teal-700 border border-teal-300'
                : theme === 'dark'
                  ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            )}
          >
            {isZh ? '全部' : 'All'}
          </button>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => {
            const config = DIFFICULTY_CONFIG[diff]
            return (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1',
                  filterDifficulty === diff
                    ? theme === 'dark'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                      : 'bg-teal-100 text-teal-700 border border-teal-300'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                )}
              >
                <span>{config.icon}</span>
                {isZh ? config.labelZh : config.labelEn}
              </button>
            )
          })}
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map(experiment => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onClick={() => setSelectedExperiment(experiment)}
            />
          ))}
        </div>

        {/* Getting Started Section */}
        <div className={cn(
          'mt-12 rounded-2xl border p-6',
          theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isZh ? '如何获取偏振片？' : 'Where to Get Polarizers?'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
            )}>
              <span className="text-2xl mb-2 block">🕶️</span>
              <h4 className={cn('font-medium mb-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {isZh ? '偏振太阳镜' : 'Polarized Sunglasses'}
              </h4>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                {isZh ? '便宜的偏振太阳镜可以直接使用' : 'Cheap polarized sunglasses work great'}
              </p>
            </div>
            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
            )}>
              <span className="text-2xl mb-2 block">🖥️</span>
              <h4 className={cn('font-medium mb-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {isZh ? '旧LCD屏幕' : 'Old LCD Screens'}
              </h4>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                {isZh ? '从废旧计算器或显示器中取出' : 'Extract from old calculators or monitors'}
              </p>
            </div>
            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
            )}>
              <span className="text-2xl mb-2 block">🛒</span>
              <h4 className={cn('font-medium mb-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {isZh ? '网上购买' : 'Buy Online'}
              </h4>
              <p className={cn('text-sm', theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>
                {isZh ? '淘宝搜索"偏振片"，价格很便宜' : 'Search for "polarizing film" - very affordable'}
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Art & Creations Tab - 作品与创意：合并展示真实作品和产品创意 */}
        {activeTab === 'showcase' && (
          <>
            {/* Real Artworks from CulturalShowcase */}
            <CulturalShowcase />

            {/* Product Ideas Section - 产品创意概念（无价格） */}
            <div className="mt-12">
              <div className={cn(
                'flex items-center gap-3 mb-6 pb-4 border-b',
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  theme === 'dark' ? 'bg-violet-500/20' : 'bg-violet-100'
                )}>
                  <Palette className={cn('w-5 h-5', theme === 'dark' ? 'text-violet-400' : 'text-violet-600')} />
                </div>
                <div>
                  <h3 className={cn(
                    'text-lg font-semibold',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '产品创意灵感' : 'Product Ideas & Inspiration'}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh ? '偏振光艺术产品创意概念，激发你的创作灵感' : 'Creative concepts for polarization art products'}
                  </p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    filterCategory === 'all'
                      ? theme === 'dark'
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'bg-violet-100 text-violet-700 border border-violet-300'
                      : theme === 'dark'
                        ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  )}
                >
                  {isZh ? '全部' : 'All'}
                </button>
                {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map(cat => {
                  const config = CATEGORY_CONFIG[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1',
                        filterCategory === cat
                          ? theme === 'dark'
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                            : 'bg-violet-100 text-violet-700 border border-violet-300'
                          : theme === 'dark'
                            ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                      )}
                    >
                      <span>{config.icon}</span>
                      {isZh ? config.labelZh : config.labelEn}
                    </button>
                  )
                })}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <>
            {/* Intro Banner */}
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-700/30'
                : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200'
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-100'
                )}>
                  <ImageIcon className={cn('w-7 h-7', theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600')} />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    'text-lg font-semibold mb-1',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '偏振艺术作品展示' : 'Polarization Art Gallery'}
                  </h2>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh
                      ? '来自社区的精彩偏振光艺术作品，包括胶带艺术、摄影和科学项目。'
                      : 'Amazing polarization art from our community - tape art, photography, and science projects.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  filterCategory === 'all'
                    ? theme === 'dark'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                )}
              >
                {isZh ? '全部' : 'All'}
              </button>
              {(Object.keys(GALLERY_CATEGORY_CONFIG) as Array<keyof typeof GALLERY_CATEGORY_CONFIG>).map(cat => {
                const config = GALLERY_CATEGORY_CONFIG[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      filterCategory === cat
                        ? theme === 'dark'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : theme === 'dark'
                          ? 'bg-slate-800 text-gray-400 hover:text-gray-200'
                          : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {isZh ? config.labelZh : config.labelEn}
                  </button>
                )
              })}
            </div>

            {/* Works Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorks.map(work => (
                <GalleryCard key={work.id} work={work} />
              ))}
            </div>

            {/* Submit Your Work CTA */}
            <div className={cn(
              'mt-12 rounded-2xl border p-6 text-center',
              theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
            )}>
              <Sparkles className={cn(
                'w-10 h-10 mx-auto mb-3',
                theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
              )} />
              <h3 className={cn(
                'text-lg font-semibold mb-2',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {isZh ? '分享你的作品' : 'Share Your Work'}
              </h3>
              <p className={cn(
                'text-sm mb-4 max-w-md mx-auto',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {isZh
                  ? '创作了偏振光艺术作品？提交给我们，有机会在这里展示！'
                  : 'Created a polarization art piece? Submit it and get featured in our gallery!'}
              </p>
              <button
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-colors',
                  theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                )}
              >
                {isZh ? '提交作品' : 'Submit Work'}
              </button>
            </div>
          </>
        )}

        {/* Workshop Tab */}
        {activeTab === 'workshop' && (
          <>
            {/* Intro Banner */}
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              theme === 'dark'
                ? 'bg-gradient-to-r from-pink-900/30 to-rose-900/30 border-pink-700/30'
                : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100'
                )}>
                  <Scissors className={cn('w-7 h-7', theme === 'dark' ? 'text-pink-400' : 'text-pink-600')} />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    'text-lg font-semibold mb-1',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '创作工坊教程' : 'Creative Workshop Tutorials'}
                  </h2>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh
                      ? '从基础到进阶的偏振艺术创作教程，学习制作属于你的偏振光艺术品。'
                      : 'Step-by-step tutorials from basics to advanced polarization art creation.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tutorials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {TUTORIALS.map(tutorial => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>

            {/* More resources section */}
            <div className={cn(
              'rounded-2xl border p-6',
              theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn(
                'text-lg font-semibold mb-4',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {isZh ? '更多创作资源' : 'More Resources'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to="/demos"
                  className={cn(
                    'p-4 rounded-lg flex items-start gap-3 transition-colors',
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <Eye className={cn('w-5 h-5 mt-0.5', theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600')} />
                  <div>
                    <h4 className={cn('font-medium mb-0.5', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {isZh ? '偏振演示馆' : 'Demo Gallery'}
                    </h4>
                    <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                      {isZh ? '了解偏振原理' : 'Learn polarization principles'}
                    </p>
                  </div>
                </Link>
                <Link
                  to="/devices"
                  className={cn(
                    'p-4 rounded-lg flex items-start gap-3 transition-colors',
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <Package className={cn('w-5 h-5 mt-0.5', theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600')} />
                  <div>
                    <h4 className={cn('font-medium mb-0.5', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {isZh ? '器件图鉴' : 'Device Library'}
                    </h4>
                    <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                      {isZh ? '认识光学器件' : 'Learn optical devices'}
                    </p>
                  </div>
                </Link>
                <Link
                  to="/bench"
                  className={cn(
                    'p-4 rounded-lg flex items-start gap-3 transition-colors',
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <Layers className={cn('w-5 h-5 mt-0.5', theme === 'dark' ? 'text-violet-400' : 'text-violet-600')} />
                  <div>
                    <h4 className={cn('font-medium mb-0.5', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {isZh ? '光路设计室' : 'Optical Bench'}
                    </h4>
                    <p className={cn('text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                      {isZh ? '设计光路实验' : 'Design optical experiments'}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Art Generator Tab - 偏振艺术生成器 */}
        {activeTab === 'generator' && (
          <>
            {/* Intro Banner */}
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              theme === 'dark'
                ? 'bg-gradient-to-r from-pink-900/30 to-rose-900/30 border-pink-700/30'
                : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-100'
                )}>
                  <Wand2 className={cn('w-7 h-7', theme === 'dark' ? 'text-pink-400' : 'text-pink-600')} />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    'text-lg font-semibold mb-1',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '偏振艺术生成器' : 'Polarization Art Generator'}
                  </h2>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  )}>
                    {isZh
                      ? '基于真实偏振光学原理，生成独特的抽象艺术作品。选择不同的物理效应类型、调整复杂度和配色，创造属于你的偏振艺术。'
                      : 'Generate unique abstract artworks based on real polarization optics principles. Choose different physics effect types, adjust complexity and colors to create your own polarization art.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Art Generator Component */}
            <div className={cn(
              'rounded-2xl border p-6',
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white border-gray-200'
            )}>
              <ArtGenerator />
            </div>

            {/* Art Gallery Section */}
            <div className={cn(
              'rounded-2xl border p-6 mt-8',
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white border-gray-200'
            )}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={cn('w-5 h-5', theme === 'dark' ? 'text-pink-400' : 'text-pink-600')} />
                <h3 className={cn(
                  'text-lg font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {isZh ? '灵感画廊' : 'Inspiration Gallery'}
                </h3>
              </div>
              <p className={cn(
                'text-sm mb-6',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {isZh
                  ? '浏览程序生成的偏振艺术样例，获取创作灵感。'
                  : 'Browse programmatically generated polarization art samples for inspiration.'}
              </p>
              <ArtGallery count={6} />
            </div>
          </>
        )}

        {/* Student Projects Tab - 学生课题 */}
        {activeTab === 'projects' && (
          <>
            {/* Intro Banner */}
            <div className={cn(
              'rounded-2xl p-6 mb-8 border',
              theme === 'dark'
                ? 'bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-violet-700/30'
                : 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
            )}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  theme === 'dark' ? 'bg-violet-500/20' : 'bg-violet-100'
                )}>
                  <GraduationCap className={cn('w-7 h-7', theme === 'dark' ? 'text-violet-400' : 'text-violet-600')} />
                </div>
                <div className="flex-1">
                  <h2 className={cn(
                    'text-lg font-semibold mb-1',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {isZh ? '学生课题展示' : 'Student Projects Showcase'}
                  </h2>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isZh
                      ? '历届学生在偏振光学研究中的课题成果与探索。'
                      : 'Research projects and achievements from past students in polarization optics.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Projects by Year - 按年份展示课题（仅已完成） */}
            {(() => {
              const yearGroups = getCompletedProjects()

              if (yearGroups.length === 0) {
                return (
                  <div className={cn(
                    'rounded-2xl border p-8',
                    theme === 'dark'
                      ? 'bg-slate-800/30 border-slate-700'
                      : 'bg-white border-gray-200'
                  )}>
                    <div className="text-center py-12">
                      <GraduationCap className={cn(
                        'w-16 h-16 mx-auto mb-4',
                        theme === 'dark' ? 'text-slate-600' : 'text-gray-300'
                      )} />
                      <h3 className={cn(
                        'text-xl font-semibold mb-2',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {isZh ? '暂无已完成的课题' : 'No Completed Projects Yet'}
                      </h3>
                      <p className={cn(
                        'text-sm max-w-md mx-auto',
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        {isZh
                          ? '学生课题完成后将在此展示。'
                          : 'Completed student projects will be displayed here.'}
                      </p>
                    </div>
                  </div>
                )
              }

              return yearGroups.map((yearGroup: ProjectYearGroup) => (
                <div key={yearGroup.year} className="mb-12">
                  {/* Year Header */}
                  <div className={cn(
                    'flex items-center gap-3 mb-6',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    <GraduationCap className={cn('w-6 h-6', theme === 'dark' ? 'text-violet-400' : 'text-violet-600')} />
                    <h2 className="text-2xl font-bold">{yearGroup.year}</h2>
                  </div>

                  {/* Summer Semester */}
                  {yearGroup.semesters.summer.length > 0 && (
                    <div className="mb-8">
                      <div className={cn(
                        'flex items-center gap-2 mb-4 px-4 py-2 rounded-lg',
                        theme === 'dark'
                          ? 'bg-orange-500/10 border border-orange-500/30'
                          : 'bg-orange-50 border border-orange-200'
                      )}>
                        <span className={cn(
                          'text-sm font-medium',
                          theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        )}>
                          {yearGroup.year}-{getSemesterLabel('summer', isZh ? 'zh' : 'en')}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          theme === 'dark'
                            ? 'bg-slate-700 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        )}>
                          {yearGroup.semesters.summer.length} {isZh ? '个项目' : 'projects'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yearGroup.semesters.summer.map((project: StudentProject) => (
                          <ProjectCard key={project.id} project={project} isZh={isZh} theme={theme} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Winter Semester */}
                  {yearGroup.semesters.winter.length > 0 && (
                    <div className="mb-8">
                      <div className={cn(
                        'flex items-center gap-2 mb-4 px-4 py-2 rounded-lg',
                        theme === 'dark'
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : 'bg-cyan-50 border border-cyan-200'
                      )}>
                        <span className={cn(
                          'text-sm font-medium',
                          theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                        )}>
                          {yearGroup.year}-{getSemesterLabel('winter', isZh ? 'zh' : 'en')}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          theme === 'dark'
                            ? 'bg-slate-700 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                        )}>
                          {yearGroup.semesters.winter.length} {isZh ? '个项目' : 'projects'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yearGroup.semesters.winter.map((project: StudentProject) => (
                          <ProjectCard key={project.id} project={project} isZh={isZh} theme={theme} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            })()}
          </>
        )}
      </main>

      {/* Experiment Detail Modal */}
      {selectedExperiment && (
        <ExperimentDetailModal
          experiment={selectedExperiment}
          onClose={() => setSelectedExperiment(null)}
        />
      )}
    </div>
  )
}

export default ExperimentsPage
