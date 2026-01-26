/**
 * Student Projects Data (学生课题数据)
 * Structured data for student research projects in polarization optics
 *
 * Format: 年份-寒暑假 (Year-Summer/Winter)
 * e.g., "2024-暑假" (2024 Summer), "2024-寒假" (2024 Winter)
 */

// ===== Types =====
export type ProjectSemester = 'summer' | 'winter'
export type ProjectStatus = 'completed' | 'in-progress' | 'planned'
export type ProjectCategory =
  | 'art'
  | 'experiment'
  | 'theory'
  | 'application'
  | 'education'

export interface StudentProject {
  id: string

  // Basic info
  title: string
  titleZh: string
  description: string
  descriptionZh: string

  // Students
  students: string[]  // Student names
  studentsZh?: string[]  // Chinese names (if different)

  // Classification
  year: number
  semester: ProjectSemester
  category: ProjectCategory
  status: ProjectStatus

  // Content
  abstract?: string
  abstractZh?: string
  keywords?: string[]
  keywordsZh?: string[]

  // Media
  images?: string[]  // Image paths
  videos?: string[]  // Video paths
  poster?: string   // Poster image path
  report?: string   // Report PDF path

  // Links
  demoLink?: string  // Link to related demo
  externalLink?: string  // External project link

  // Display
  featured?: boolean
  order?: number
}

export interface ProjectYearGroup {
  year: number
  semesters: {
    summer: StudentProject[]
    winter: StudentProject[]
  }
}

// ===== Student Projects Data =====
export const STUDENT_PROJECTS: StudentProject[] = [
  // ===== 2024 Summer Projects (已完成) =====
  {
    id: '2024-summer-001',
    title: 'Polarization Art Installation',
    titleZh: '偏振艺术装置设计',
    description: 'Creating interactive polarization art installations for public spaces.',
    descriptionZh: '为公共空间创建互动式偏振艺术装置。',
    students: ['Zhang San', 'Li Si'],
    studentsZh: ['张三', '李四'],
    year: 2024,
    semester: 'summer',
    category: 'art',
    status: 'completed',
    abstract: 'This project explores the intersection of polarization optics and public art, creating an interactive installation that responds to viewer movement through polarized light filters.',
    abstractZh: '本项目探索偏振光学与公共艺术的结合，创建了一个通过偏振光滤波器响应观众运动的互动装置。',
    keywords: ['polarization', 'art', 'installation', 'interactive'],
    keywordsZh: ['偏振', '艺术', '装置', '互动'],
    poster: '/images/student-projects/2024-summer-001/poster.jpg',
    report: '/docs/student-projects/2024-summer-001/report.pdf',
    featured: true,
    order: 1,
  },
  {
    id: '2024-summer-002',
    title: 'Birefringence in Everyday Materials',
    titleZh: '日常材料双折射研究',
    description: 'Investigating birefringent properties of common plastic and household items.',
    descriptionZh: '研究常见塑料和家居用品的双折射特性。',
    students: ['Wang Wu', 'Zhao Liu'],
    studentsZh: ['王五', '赵六'],
    year: 2024,
    semester: 'summer',
    category: 'experiment',
    status: 'completed',
    abstract: 'A systematic study of birefringence in transparent plastic items using crossed polarizers. Quantitative measurements of stress-induced birefringence were performed.',
    abstractZh: '使用正交偏振片系统研究透明塑料物品的双折射特性。对应力引起的双折射进行了定量测量。',
    keywords: ['birefringence', 'stress analysis', 'photoelasticity'],
    keywordsZh: ['双折射', '应力分析', '光弹'],
    poster: '/images/student-projects/2024-summer-002/poster.jpg',
    demoLink: '/demos/birefringence',
    featured: true,
    order: 2,
  },
  {
    id: '2024-summer-003',
    title: 'Polarization-Based 3D Display',
    titleZh: '基于偏振的3D显示系统',
    description: 'Design and implementation of a passive 3D display using polarized glasses.',
    descriptionZh: '使用偏振眼镜设计和实现被动式3D显示系统。',
    students: ['Chen Qi', 'Zhou Ba'],
    studentsZh: ['陈七', '周八'],
    year: 2024,
    semester: 'summer',
    category: 'application',
    status: 'completed',
    abstract: 'Developed a low-cost 3D display system using modified LCD panels and polarized glasses. Optimized for classroom demonstrations.',
    abstractZh: '开发了一种使用改装LCD面板和偏振眼镜的低成本3D显示系统。针对课堂教学演示进行了优化。',
    keywords: ['3D display', 'LCD', 'polarized glasses'],
    keywordsZh: ['3D显示', '液晶', '偏振眼镜'],
    poster: '/images/student-projects/2024-summer-003/poster.jpg',
    featured: false,
    order: 3,
  },

  // ===== 2024 Winter Projects (进行中) =====
  {
    id: '2024-winter-001',
    title: 'Stokes Parameter Imaging System',
    titleZh: '斯托克斯参数成像系统',
    description: 'Building a real-time Stokes parameter imaging setup for polarization analysis.',
    descriptionZh: '搭建实时斯托克斯参数成像装置用于偏振分析。',
    students: ['Liu Jiu', 'Wang Shi'],
    studentsZh: ['刘九', '王十'],
    year: 2024,
    semester: 'winter',
    category: 'experiment',
    status: 'in-progress',
    abstract: 'Designing a four-camera system with different polarizers to capture full Stokes parameters in real-time.',
    abstractZh: '设计一个带有不同偏振片的四相机系统，实时捕获完整的斯托克斯参数。',
    keywords: ['Stokes parameters', 'polarimetry', 'imaging'],
    keywordsZh: ['斯托克斯参数', '偏振测量', '成像'],
    order: 1,
  },
  {
    id: '2024-winter-002',
    title: 'Educational Polarization Game Design',
    titleZh: '偏振光教育游戏设计',
    description: 'Creating a game to teach polarization concepts through interactive puzzles.',
    descriptionZh: '创建一个通过互动谜题教授偏振概念的游戏。',
    students: ['Sun Yi', 'Qian Er'],
    studentsZh: ['孙一', '钱二'],
    year: 2024,
    semester: 'winter',
    category: 'education',
    status: 'in-progress',
    abstract: 'Developing an educational game that uses polarization mechanics as core gameplay elements.',
    abstractZh: '开发一款将偏振机制作为核心游戏元素的教育游戏。',
    keywords: ['game design', 'education', 'interactive'],
    keywordsZh: ['游戏设计', '教育', '互动'],
    demoLink: '/games',
    order: 2,
  },
  {
    id: '2024-winter-003',
    title: 'Polarization in Nature Documentary',
    titleZh: '自然界中的偏振现象纪录片',
    description: 'Documenting polarization effects in nature: sky, water, insects, and more.',
    descriptionZh: '记录自然界中的偏振效应：天空、水面、昆虫等。',
    students: ['Wu San', 'Zheng Si'],
    studentsZh: ['吴三', '郑四'],
    year: 2024,
    semester: 'winter',
    category: 'art',
    status: 'in-progress',
    abstract: 'A photographic and video documentary exploring polarization phenomena in the natural world.',
    abstractZh: '一部探索自然界偏振现象的摄影和视频纪录片。',
    keywords: ['nature', 'photography', 'documentary'],
    keywordsZh: ['自然', '摄影', '纪录片'],
    order: 3,
  },

  // ===== 2025 Summer Projects (计划中) =====
  {
    id: '2025-summer-001',
    title: 'Quantum Polarization Entanglement',
    titleZh: '量子偏振纠缠实验',
    description: 'Experimental setup for demonstrating quantum entanglement with polarized photons.',
    descriptionZh: '演示偏振光子量子纠缠的实验装置。',
    students: ['Feng Wu', 'Han Liu'],
    studentsZh: ['冯五', '韩六'],
    year: 2025,
    semester: 'summer',
    category: 'theory',
    status: 'planned',
    abstract: 'Planning a Bell inequality experiment using entangled photon pairs from spontaneous parametric down-conversion.',
    abstractZh: '计划使用自发参量下转换产生的纠缠光子对进行贝尔不等式实验。',
    keywords: ['quantum', 'entanglement', 'Bell test'],
    keywordsZh: ['量子', '纠缠', '贝尔测试'],
    order: 1,
  },
  {
    id: '2025-summer-002',
    title: 'Polarization Microscope for Biology',
    titleZh: '偏振显微镜在生物学中的应用',
    description: 'Adapting polarization microscopy for studying biological structures.',
    descriptionZh: '改进偏振显微镜用于研究生物结构。',
    students: ['Wei Qi', 'Jian Ba'],
    studentsZh: ['魏七', '简八'],
    year: 2025,
    semester: 'summer',
    category: 'application',
    status: 'planned',
    abstract: 'Developing polarization microscopy techniques for studying collagen and other birefringent biological tissues.',
    abstractZh: '开发偏振显微镜技术用于研究胶原蛋白和其他双折射生物组织。',
    keywords: ['microscopy', 'biology', 'collagen'],
    keywordsZh: ['显微镜', '生物学', '胶原蛋白'],
    order: 2,
  },
  {
    id: '2025-summer-003',
    title: 'Interactive Polarization Museum Exhibit',
    titleZh: '互动式偏振博物馆展品',
    description: 'Designing hands-on exhibits for science museums about polarization.',
    descriptionZh: '为科学博物馆设计关于偏振的互动展品。',
    students: ['Kai Jiu', 'Xuan Shi'],
    studentsZh: ['凯九', '轩十'],
    year: 2025,
    semester: 'summer',
    category: 'education',
    status: 'planned',
    abstract: 'Creating a series of interactive exhibits demonstrating polarization concepts for museum visitors.',
    abstractZh: '创建一系列互动展品，向博物馆参观者展示偏振概念。',
    keywords: ['museum', 'exhibit', 'outreach'],
    keywordsZh: ['博物馆', '展品', '科普'],
    order: 3,
  },
]

// ===== Helper Functions =====

/** Group projects by year and semester */
export function groupProjectsByYear(): ProjectYearGroup[] {
  const grouped: Record<number, { summer: StudentProject[]; winter: StudentProject[] }> = {}

  STUDENT_PROJECTS.forEach(project => {
    if (!grouped[project.year]) {
      grouped[project.year] = { summer: [], winter: [] }
    }
    grouped[project.year][project.semester].push(project)
  })

  // Sort within each semester and convert to array
  return Object.entries(grouped)
    .map(([year, semesters]) => ({
      year: parseInt(year),
      semesters: {
        summer: semesters.summer.sort((a, b) => (a.order || 0) - (b.order || 0)),
        winter: semesters.winter.sort((a, b) => (a.order || 0) - (b.order || 0)),
      },
    }))
    .sort((a, b) => b.year - a.year) // Most recent first
}

/** Get projects by year */
export function getProjectsByYear(year: number): StudentProject[] {
  return STUDENT_PROJECTS.filter(p => p.year === year)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

/** Get projects by semester */
export function getProjectsBySemester(year: number, semester: ProjectSemester): StudentProject[] {
  return STUDENT_PROJECTS.filter(p => p.year === year && p.semester === semester)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

/** Get featured projects */
export function getFeaturedProjects(): StudentProject[] {
  return STUDENT_PROJECTS.filter(p => p.featured)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

/** Get projects by category */
export function getProjectsByCategory(category: ProjectCategory): StudentProject[] {
  return STUDENT_PROJECTS.filter(p => p.category === category)
    .sort((a, b) => b.year - a.year || (a.order || 0) - (b.order || 0))
}

/** Get projects by status */
export function getProjectsByStatus(status: ProjectStatus): StudentProject[] {
  return STUDENT_PROJECTS.filter(p => p.status === status)
    .sort((a, b) => b.year - a.year || (a.order || 0) - (b.order || 0))
}

/** Get completed projects (for ExperimentsPage) */
export function getCompletedProjects(): ProjectYearGroup[] {
  return groupProjectsByYear().map(yearGroup => ({
    year: yearGroup.year,
    semesters: {
      summer: yearGroup.semesters.summer.filter(p => p.status === 'completed'),
      winter: yearGroup.semesters.winter.filter(p => p.status === 'completed'),
    },
  })).filter(yearGroup =>
    yearGroup.semesters.summer.length > 0 || yearGroup.semesters.winter.length > 0
  )
}

/** Get ongoing projects (in-progress and planned, for LabPage) */
export function getOngoingProjects(): ProjectYearGroup[] {
  return groupProjectsByYear().map(yearGroup => ({
    year: yearGroup.year,
    semesters: {
      summer: yearGroup.semesters.summer.filter(p => p.status !== 'completed'),
      winter: yearGroup.semesters.winter.filter(p => p.status !== 'completed'),
    },
  })).filter(yearGroup =>
    yearGroup.semesters.summer.length > 0 || yearGroup.semesters.winter.length > 0
  )
}

/** Get all years with projects */
export function getProjectYears(): number[] {
  const years = new Set(STUDENT_PROJECTS.map(p => p.year))
  return Array.from(years).sort((a, b) => b - a)
}

/** Get semester label */
export function getSemesterLabel(semester: ProjectSemester, locale: 'en' | 'zh' = 'en'): string {
  if (locale === 'zh') {
    return semester === 'summer' ? '暑假' : '寒假'
  }
  return semester === 'summer' ? 'Summer' : 'Winter'
}

/** Get category label */
export function getCategoryLabel(category: ProjectCategory, locale: 'en' | 'zh' = 'en'): string {
  const labels: Record<ProjectCategory, { en: string; zh: string }> = {
    art: { en: 'Art & Design', zh: '艺术设计' },
    experiment: { en: 'Experiment', zh: '实验研究' },
    theory: { en: 'Theory', zh: '理论研究' },
    application: { en: 'Application', zh: '应用开发' },
    education: { en: 'Education', zh: '教育科普' },
  }
  return labels[category][locale]
}

/** Get status label */
export function getStatusLabel(status: ProjectStatus, locale: 'en' | 'zh' = 'en'): string {
  const labels: Record<ProjectStatus, { en: string; zh: string }> = {
    completed: { en: 'Completed', zh: '已完成' },
    'in-progress': { en: 'In Progress', zh: '进行中' },
    planned: { en: 'Planned', zh: '计划中' },
  }
  return labels[status][locale]
}

// ===== Statistics =====
export const PROJECT_STATS = {
  totalProjects: STUDENT_PROJECTS.length,
  completedProjects: STUDENT_PROJECTS.filter(p => p.status === 'completed').length,
  inProgressProjects: STUDENT_PROJECTS.filter(p => p.status === 'in-progress').length,
  plannedProjects: STUDENT_PROJECTS.filter(p => p.status === 'planned').length,
  featuredCount: STUDENT_PROJECTS.filter(p => p.featured).length,
  years: getProjectYears().length,
}