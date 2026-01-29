# PolarCraft 开发指南

## 项目概述

PolarCraft 是一款由Claude开发的，基于偏振光物理的教育类体素解谜游戏。它结合了真实的光学原理（马吕斯定律、双折射、干涉）和 Minecraft 风格的体素玩法。玩家通过操控各种光学组件来操纵偏振光束以解决谜题。

我们面对一个由AI构建的庞大项目，代码结构已经给出。由于项目复杂，且可能存在未知错误（EOR），我们需要谨慎地进行功能增加和漏洞修复。我们希望采取以下策略：

- **理解现有代码结构**：首先，仔细阅读CLAUDE\.md，了解项目的整体架构、技术栈、目录结构、核心概念和已有的功能。
- **编写测试**：如果现有测试不足，考虑为关键模块编写测试，以确保在修改代码时不会破坏现有功能。
- **模块化修改**：不要一次性修改大量代码，而是针对某个模块或功能进行修改。修改前确保理解该模块的代码逻辑。
- **版本控制**：充分利用Git，每次修改都在新的分支上进行，修改完成并通过测试后合并到主分支。
- **代码审查**：尽管是AI生成的代码，但我们可以通过代码审查来理解代码逻辑，并发现潜在问题。
- **文档更新**：在修改代码的同时，更新相关文档（如CLAUDE\.md），以保持文档与代码一致。
- **逐步重构**：如果发现某些代码结构不合理，可以逐步进行重构，但每次重构的范围不宜过大。
- **利用AI辅助**：在理解代码的基础上，可以继续利用AI（如Claude）来帮助解释代码、生成测试用例、甚至修复漏洞。
- **保持耐心**：大型项目由AI生成，难免会有一些不符合人类编程习惯的地方，需要耐心理解和调整。

## 如何在项目中贡献代码

> 除了下列工具，你可能还需要AI代码辅助，比如Trae,下载链接为[https://www.trae.cn/](https://www.trae.cn/)

首先你需要一个代码编辑器，如VScode，下载链接是[https://code.visualstudio.com/download](https://code.visualstudio.com/download)，然后需要一个必备的代码管理器git下载链接是[https://cn-git.com/downloads/](https://cn-git.com/downloads/),接下来你需要安装该项目的工具链，首先是node.js，下载链接是[https://nodejs.cn/download/](https://nodejs.cn/download/)，请务必确保这些软件都添加到了路径下，否则可能无法调用指令，如果在终端上可以正确显示上述软件版本

> （具体指令可以参考浏览器搜索(如何查询XXX（工具名称）的版本）或者询问AI）

那么接下来可以在git bash 里克隆远程的github仓库（可以在互联网直接搜索或者询问AI)，链接为[https://github.com/amatke31/polarisationcourse](https://github.com/amatke31/polarisationcourse)，然后再在该目录下运行[终端指令](#快速命令)，接着你就可以在自己的本地仓库进行下面的修改流程，具体到步骤是：

### 第一步：运行项目，观察效果

- 按照CLAUDE\.md中的Quick Commands，尝试安装依赖并运行开发服务器。
- 浏览各个页面，看看是否有明显的错误。

### 第二步：阅读核心代码

- 从入口文件开始，了解应用的启动过程。
- 阅读核心类型定义（src/core/types\.ts）和核心逻辑（World\.ts, LightPhysics\.ts等）。
- 阅读状态管理（stores）和主要页面组件。

### 第三步：尝试修复简单问题

- 如果发现明显的语法错误或类型错误，先修复这些错误。
- 如果发现某个功能不工作，可以针对该功能进行调试。

### 第四步：增加新功能

- 在增加新功能前，确保对相关模块有足够的了解。
- 按照CLAUDE\.md中的开发指南，例如添加新的Demo或新的Block Type，按照指导步骤进行。

### 第五步：编写测试

- 为新增功能编写测试，同时考虑为现有核心功能补充测试。

### 第六步：持续集成

- 如果项目没有CI/CD，考虑设置，以确保每次修改都能通过测试。

最后，AI生成的项目就像考古遗址——不要急于推倒，而要仔细挖掘有价值的部分。核心物理算法和架构设计往往比实现细节更有价值。

## 代码重构策略

分为四个步骤，要达到一个健康的项目状态可能需要持续三个月时间的维护。

- 阶段一：评估与稳固（1-2周）
- 阶段二：核心重构（3-4周）
- 阶段三：增量重构策略（3-4周）
- 阶段四：持续优化

具体的操作可能有一下几步

### 第一步：建立安全网

#### 厘清文件架构

项目实现的核心文件如下

```txt
// 项目必须保留的骨架
src/
├── core/                  # 核心物理引擎
│   ├── types.ts           # 类型定义
│   ├── LightPhysics.ts    # 物理计算
│   └── World.ts           # 可能是游戏部分的世界管理
├── stores/                # 游戏的状态管理
│   └── gameStore.ts
├── pages/                 # 页面路由
└── App.tsx                # 根组件
```

建议删除重写的部分：

```txt
// 可以安全删除
src/components/
├── demos/            # 大部分demo可删（保留核心逻辑）
├── optical-studio/   # 复杂但非核心
└── effects/          # 视觉效果可重写
```

### 第二步：创建简化版本

```typescript
// 新建 minimal-game.html
// 用最简代码验证核心物理逻辑
<html>
<script>
// 直接测试物理公式
function testPolarization() {
  console.log("Malus Law test:", 100 * Math.cos(45 * Math.PI/180)**2);
}
</script>
</html>
```

### 第三步：渐进式替换

```bash
# 1. 备份原代码
cp -r src src-backup-$(date +%Y%m%d)

# 2. 创建干净的新结构
mkdir -p src-clean/{core,pages,components,stores}

# 3. 逐步迁移文件
# 每次只迁移一个模块，确保测试通过
```

### 第四步：代码审查清单

- 每个文件迁移时检查：
- 类型定义是否清晰？
- 函数是否单一职责？
- 是否有重复逻辑？
- 依赖是否合理？
- 测试是否覆盖？

## 技术栈

- **前端**：React 19 + TypeScript（严格模式）
- **3D 渲染**：React Three Fiber + Three.js + drei
- **2D 动画**：Framer Motion（用于课程演示可视化）
- **状态管理**：Zustand（附带 subscribeWithSelector 中间件）
- **路由**：React Router v7
- **样式**：Tailwind CSS v4
- **国际化**：i18next（带语言检测）
- **构建工具**：Vite
- **测试**：Vitest + React Testing Library
- **后端**（计划中）：NestJS + Colyseus（用于实时多人游戏）

## 主要功能

- 交互式 3D 体素解谜游戏，包含 5 个教程关卡
- 2D 解谜游戏，包含 4 个难度级别（简单/中等/困难/专家）共 11 个关卡
- 教育课程平台，包含 6 个单元共 20+ 个交互式物理演示
- **光学设计工作室**：偏振光艺术设计工具，包含器件库 + 光学工作台
- **计算工坊**：琼斯、斯托克斯、穆勒计算器 + 庞加莱球查看器
- **实验室模块**：研究模拟和数据分析工具
- **游戏中心**：多种游戏模式，包括卡牌游戏、密室逃脱、侦探游戏
- 多语言支持（英文/中文）
- 深色/浅色主题切换
- 3D 游戏中的三种相机模式（第一人称、等轴测、俯视）

## 快速命令

```bash
# 前端
npm install          # 安装依赖
npm run dev          # 启动开发服务器（热重载）
npm run build        # 生产环境构建 (tsc && vite build)
npm run preview      # 预览生产环境构建
npm run test         # 使用 vitest 运行测试
npm run test:run     # 运行一次测试
npm run test:coverage # 运行测试并生成覆盖率报告

# 后端（在 /server 目录中）
cd server
npm install
npm run start:dev    # 以监视模式启动 NestJS 服务器
npm run build        # 为生产环境构建
```

## Git 工作流

**分支策略：**

- 所有开发工作完成后应合并到 `main` 分支
- 从 `main` 分支创建功能分支以开发新功能或修复
- 代码审查/测试后，将功能分支直接合并到 `main`
- 始终保持 `main` 分支为可部署状态

**提交规范：**

- 使用约定式提交格式：`feat:`、`fix:`、`chore:`、`docs:` 等
- 用英文撰写清晰、简洁的提交信息
- 如适用，请引用问题编号

## 架构

### 目录结构

（注：此处目录结构树状图以文本形式保持原样，因其主要展示路径关系，无需翻译标签名称）

```txt
polarisation/
├── src/                          # React 应用源代码
│   ├── App.tsx                   # 根组件（包含 React Router）
│   ├── main.tsx                  # React 入口点
│   ├── index.css                 # 全局样式（Tailwind）
│   │
│   ├── core/                     # 核心游戏逻辑（与框架无关）
│   │   ├── types.ts              # TypeScript 类型、常量、接口
│   │   ├── World.ts              # 体素世界、光传播、关卡
│   │   ├── LightPhysics.ts       # 偏振光物理（四大公理）
│   │   ├── WaveOptics.ts         # 波动光学计算
│   │   └── JonesCalculus.ts      # 琼斯矢量/矩阵计算
│   │
│   ├── stores/                   # Zustand 状态存储
│   │   ├── gameStore.ts          # 游戏状态、操作、教程提示
│   │   ├── opticalBenchStore.ts  # 光学设计工作室状态管理
│   │   ├── labStore.ts           # 实验室模块状态管理
│   │   └── discoveryStore.ts     # 发现/成就追踪
│   │
│   ├── pages/                    # 页面组件
│   │   ├── HomePage.tsx          # 带导航的着陆页
│   │   ├── GamePage.tsx          # 完整的 3D 游戏（带 HUD）
│   │   ├── Game2DPage.tsx        # 基于 CSS/SVG 的 2D 解谜游戏
│   │   ├── GameHubPage.tsx       # 包含所有游戏模式的游戏中心
│   │   ├── DemosPage.tsx         # 交互式物理演示
│   │   ├── CoursePage.tsx        # 结构化课程内容
│   │   ├── OpticalDesignPage.tsx # 模块化光学设计工作室
│   │   ├── OpticalDesignStudioPageV2.tsx  # 旧版光学工作室
│   │   ├── LabPage.tsx           # 研究实验室模拟
│   │   ├── ExperimentsPage.tsx   # 创意实验模块
│   │   ├── ApplicationsPage.tsx  # 真实世界应用展示
│   │   ├── ChroniclesPage.tsx    # 历史编年史
│   │   ├── CalculationWorkshopPage.tsx   # 计算器中心
│   │   ├── JonesCalculatorPage.tsx       # 琼斯矩阵计算器
│   │   ├── StokesCalculatorPage.tsx      # 斯托克斯矢量计算器
│   │   ├── MuellerCalculatorPage.tsx     # 穆勒矩阵计算器
│   │   ├── PoincareSphereViewerPage.tsx  # 庞加莱球可视化
│   │   ├── CardGamePage.tsx      # 偏振卡牌游戏
│   │   ├── EscapeRoomPage.tsx    # 密室逃脱解谜游戏
│   │   ├── DetectiveGamePage.tsx # 侦探解谜游戏
│   │   ├── HardwarePage.tsx      # 硬件组件指南
│   │   ├── MerchandisePage.tsx   # 教育周边商品
│   │   └── index.ts              # 统一导出文件
│   │
│   ├── components/
│   │   ├── game/                 # 3D 游戏组件 (R3F)
│   │   │   ├── GameCanvas.tsx    # R3F Canvas 包装器
│   │   │   ├── Scene.tsx         # 主场景、控件、光照
│   │   │   ├── Blocks.tsx        # 方块网格渲染
│   │   │   ├── LightBeams.tsx    # 光束可视化
│   │   │   ├── SelectionBox.tsx  # 方块选中指示器
│   │   │   └── block-helpers/    # 方块渲染辅助工具
│   │   │
│   │   ├── hud/                  # 游戏 HUD 组件
│   │   │   ├── BlockSelector.tsx # 方块类型选择
│   │   │   ├── InfoBar.tsx       # 关卡信息显示
│   │   │   ├── LevelSelector.tsx # 关卡导航
│   │   │   ├── LevelGoal.tsx     # 传感器激活进度
│   │   │   ├── TutorialHint.tsx  # 提示显示
│   │   │   ├── HelpPanel.tsx     # 控制指南（对话框）
│   │   │   ├── ControlHints.tsx  # 屏幕控制提示
│   │   │   ├── Crosshair.tsx     # FPS 准星
│   │   │   ├── VisionModeIndicator.tsx # 视觉模式指示器
│   │   │   └── CameraModeIndicator.tsx # 相机模式指示器
│   │   │
│   │   ├── demos/                # 交互式物理演示
│   │   │   ├── basics/           # 单元 0：光学基础
│   │   │   │   ├── LightWaveDemo.tsx # 光波演示
│   │   │   │   ├── ElectromagneticWaveDemo.tsx # 电磁波演示
│   │   │   │   ├── ElectromagneticSpectrumDemo.tsx # 电磁波谱演示
│   │   │   │   ├── PolarizationIntroDemo.tsx # 偏振介绍演示
│   │   │   │   ├── PolarizationTypesDemo.tsx # 偏振类型演示
│   │   │   │   ├── PolarizationTypesUnifiedDemo.tsx # 偏振类型统一演示
│   │   │   │   ├── MalusLawGraphDemo.tsx # 马吕斯定律图表演示
│   │   │   │   ├── ThreePolarizersDemo.tsx # 三偏振片演示
│   │   │   │   ├── PolarizerScenarioDemo.tsx # 偏振片场景演示
│   │   │   │   ├── VirtualPolarizerLens.tsx # 虚拟偏振片透镜
│   │   │   │   └── InteractiveOpticalBenchDemo.tsx # 交互式光学工作台演示
│   │   │   ├── unit1/            # 单元 1：偏振基础
│   │   │   │   ├── PolarizationStateDemo.tsx # 偏振态演示
│   │   │   │   ├── MalusLawDemo.tsx # 马吕斯定律演示
│   │   │   │   ├── BirefringenceDemo.tsx # 双折射演示
│   │   │   │   ├── WaveplateDemo.tsx # 波片演示
│   │   │   │   └── AragoFresnelDemo.tsx # 阿拉果-菲涅耳演示
│   │   │   ├── unit2/            # 单元 2：界面反射
│   │   │   │   ├── FresnelDemo.tsx # 菲涅耳公式演示
│   │   │   │   └── BrewsterDemo.tsx # 布儒斯特角演示
│   │   │   ├── unit3/            # 单元 3：透明介质
│   │   │   │   ├── ChromaticDemo.tsx # 色偏振演示
│   │   │   │   ├── AnisotropyDemo.tsx # 各向异性演示
│   │   │   │   ├── OpticalRotationDemo.tsx # 旋光性演示
│   │   │   │   └── MediaGalleryPanel.tsx # 介质画廊面板
│   │   │   ├── unit4/            # 单元 4：散射
│   │   │   │   ├── RayleighScatteringDemo.tsx # 瑞利散射演示
│   │   │   │   ├── MieScatteringDemo.tsx # 米氏散射演示
│   │   │   │   └── MonteCarloScatteringDemo.tsx # 蒙特卡洛散射演示
│   │   │   ├── unit5/            # 单元 5：全偏振测量
│   │   │   │   ├── StokesVectorDemo.tsx # 斯托克斯矢量演示
│   │   │   │   ├── MuellerMatrixDemo.tsx # 穆勒矩阵演示
│   │   │   │   ├── JonesMatrixDemo.tsx # 琼斯矩阵演示
│   │   │   │   ├── PolarizationCalculatorDemo.tsx # 偏振计算器演示
│   │   │   │   └── PolarimetricMicroscopyDemo.tsx # 偏振显微术演示
│   │   │   ├── DemoCanvas.tsx    # 3D 演示包装器 (R3F)
│   │   │   ├── Demo2DCanvas.tsx  # 2D 演示包装器 (Canvas)
│   │   │   ├── DemoControls.tsx  # 共享演示 UI 控件
│   │   │   ├── DifficultyStrategy.tsx  # 难度级别处理
│   │   │   ├── LifeSceneIllustrations.tsx # 生活场景插图
│   │   │   └── index.ts          # 统一导出文件
│   │   │
│   │   ├── optical-studio/       # 光学设计工作室组件
│   │   │   ├── OpticalCanvas.tsx           # 主 SVG 画布（支持拖放）
│   │   │   ├── CanvasToolbar.tsx           # 播放/暂停、重置、设置
│   │   │   ├── DeviceLibrary.tsx           # 器件浏览器（包含 80+ 器件）
│   │   │   ├── Sidebar.tsx                 # 实验/自由设计/教程选项卡
│   │   │   ├── LeftPanel.tsx               # 左侧边栏面板
│   │   │   ├── RightPanel.tsx              # 右侧边栏面板
│   │   │   ├── StatusBar.tsx               # 状态栏显示
│   │   │   ├── UnifiedToolbar.tsx          # 统一工具栏
│   │   │   ├── ComponentPropertiesPanel.tsx # 编辑组件属性
│   │   │   ├── PolarizationDevicesPanel.tsx # 偏振器件浏览器
│   │   │   ├── ChallengePanel.tsx          # 挑战模式 UI
│   │   │   ├── TutorialOverlay.tsx         # 分步教程
│   │   │   ├── FormulaDisplay.tsx          # 实时物理公式显示
│   │   │   ├── PrinciplesPanel.tsx         # 第一性原理参考
│   │   │   └── index.ts                    # 统一导出文件
│   │   │
│   │   ├── optical-design/       # 模块化光学设计组件
│   │   │   ├── FreeDesignModule.tsx # 自由设计模块
│   │   │   ├── OpticalPathsModule.tsx # 光路模块
│   │   │   └── DeviceGalleryModule.tsx # 器件画廊模块
│   │   │
│   │   ├── shared/               # 共享组件
│   │   │   ├── optical/          # SVG 光学组件渲染器
│   │   │   │   ├── EmitterSVG.tsx # 发射器 SVG
│   │   │   │   ├── SensorSVG.tsx # 传感器 SVG
│   │   │   │   ├── PolarizerSVG.tsx # 偏振片 SVG
│   │   │   │   ├── MirrorSVG.tsx # 反射镜 SVG
│   │   │   │   ├── SplitterSVG.tsx # 分束器 SVG
│   │   │   │   ├── RotatorSVG.tsx # 旋转器 SVG
│   │   │   │   ├── QuarterWavePlateSVG.tsx # 四分之一波片 SVG
│   │   │   │   ├── HalfWavePlateSVG.tsx # 半波片 SVG
│   │   │   │   ├── BeamCombinerSVG.tsx # 光束合成器 SVG
│   │   │   │   ├── PhaseShifterSVG.tsx # 移相器 SVG
│   │   │   │   ├── OpticalIsolatorSVG.tsx # 光隔离器 SVG
│   │   │   │   ├── LightBeamSVG.tsx # 光束 SVG
│   │   │   │   └── ...更多
│   │   │   ├── SEO.tsx # SEO 组件
│   │   │   ├── ExperimentModule.tsx # 实验模块
│   │   │   ├── ModuleTabs.tsx # 模块选项卡
│   │   │   ├── DataCard.tsx # 数据卡片
│   │   │   ├── SearchFilter.tsx # 搜索过滤器
│   │   │   ├── PersistentHeader.tsx # 持久化页头
│   │   │   ├── PolarizationArt.tsx # 偏振艺术
│   │   │   ├── SecureVideoPlayer.tsx # 安全视频播放器
│   │   │   └── ExportUtils.tsx # 导出工具
│   │   │
│   │   ├── course/               # 课程相关组件
│   │   │   ├── RelatedDemos.tsx # 相关演示
│   │   │   ├── LensNavigator.tsx # 透镜导航器
│   │   │   ├── LearningPathMap.tsx # 学习路径图
│   │   │   ├── PSRTQuestStage.tsx # PSRT 任务阶段
│   │   │   ├── DemoQuiz.tsx # 演示测验
│   │   │   └── MysteryCard.tsx # 神秘卡片
│   │   │
│   │   ├── lab/                  # 实验室模块组件
│   │   │   ├── ResearchTaskModal.tsx # 研究任务模态框
│   │   │   ├── DataChart.tsx # 数据图表
│   │   │   └── DataEntryTable.tsx # 数据录入表
│   │   │
│   │   ├── experiments/          # 实验组件
│   │   │   ├── MichelLevyChart.tsx # 米歇尔-列维图
│   │   │   ├── ExperimentTools.tsx # 实验工具
│   │   │   ├── CulturalShowcase.tsx # 文化展示
│   │   │   └── PolarizerSource.tsx # 偏振片光源
│   │   │
│   │   ├── gallery/              # 画廊/可视化组件
│   │   │   ├── StressComparator.tsx # 应力比较器
│   │   │   ├── ThermalStressPlayer.tsx # 热应力播放器
│   │   │   ├── PolarizationSystemToggle.tsx # 偏振系统切换
│   │   │   ├── SugarOpticalRotator.tsx # 糖溶液旋光器
│   │   │   ├── ThicknessVisualizer.tsx # 厚度可视化器
│   │   │   └── DynamicStrainViewer.tsx # 动态应变查看器
│   │   │
│   │   ├── detective/            # 侦探游戏组件
│   │   │   └── DeductionPanel.tsx # 推理面板
│   │   │
│   │   ├── bench/                # 光学工作台组件
│   │   │   └── OpticalComponents.tsx # 光学组件
│   │   │
│   │   ├── chronicles/           # 历史编年史组件
│   │   ├── museum/               # 博物馆展品组件
│   │   ├── effects/              # 视觉效果
│   │   │   └── LightBeamEffect.tsx # 光束效果
│   │   ├── icons/                # 自定义图标组件
│   │   │
│   │   └── ui/                   # 可复用的 UI 基础组件
│   │       ├── button.tsx        # 按钮组件
│   │       ├── dialog.tsx        # 对话框组件
│   │       ├── tooltip.tsx       # 工具提示组件
│   │       ├── DiscoveryNotification.tsx # 发现通知
│   │       └── LanguageThemeSwitcher.tsx # 语言/主题切换器
│   │
│   ├── contexts/                 # React 上下文
│   │   └── ThemeContext.tsx      # 深色/浅色主题提供者
│   │
│   ├── i18n/                     # 国际化
│   │   ├── index.ts              # i18next 配置
│   │   └── locales/
│   │       ├── en.json           # 英文翻译
│   │       └── zh.json           # 中文翻译
│   │
│   └── lib/
│       └── utils.ts              # 工具函数（例如 cn 用于类名拼接）
│
├── server/                       # 后端 (NestJS + Colyseus)
│   ├── src/
│   │   ├── main.ts               # 服务器入口点
│   │   ├── app.module.ts         # 根模块
│   │   └── game/                 # 游戏模块
│   │       ├── game.module.ts
│   │       ├── game.gateway.ts   # WebSocket 网关
│   │       ├── game.service.ts
│   │       ├── rooms/            # Colyseus 房间
│   │       └── schemas/          # 状态模式
│   ├── package.json
│   └── tsconfig.json
│
├── index.html                    # SPA 入口点
├── package.json
├── vite.config.ts
├── tsconfig.json
├── postcss.config.js
├── tailwind.config.js            # Tailwind CSS 配置
├── components.json               # shadcn/ui 配置
├── CLAUDE.md                     # 本文件
├── COURSE.md                     # 课程大纲
└── README.md                     # 中文文档
```

### 应用路由

| 路由 | 组件 | 用途 |
|-------|-----------|---------|
| `/` | `HomePage` | 包含游戏/课程导航的着陆页 |
| `/games` | `GameHubPage` | 包含所有游戏模式的游戏中心 |
| `/games/2d` | `Game2DPage` | 基于 SVG 的 2D 解谜游戏 |
| `/games/3d` | `GamePage` | 完整的 3D 体素解谜游戏 |
| `/games/card` | `CardGamePage` | 偏振卡牌游戏 |
| `/games/escape` | `EscapeRoomPage` | 密室逃脱解谜游戏 |
| `/games/detective` | `DetectiveGamePage` | 侦探解谜游戏 |
| `/demos` | `DemosPage` | 交互式物理演示 |
| `/demos/:demoId` | `DemosPage` | 直达特定演示的深层链接 |
| `/course` | `CoursePage` | 结构化课程内容 |
| `/optical-studio` | `OpticalDesignPage` | 模块化光学设计工作室 |
| `/lab` | `LabPage` | 研究实验室模拟 |
| `/experiments` | `ExperimentsPage` | 创意实验模块 |
| `/applications` | `ApplicationsPage` | 真实世界应用展示 |
| `/chronicles` | `ChroniclesPage` | 历史编年史 |
| `/calc` | `CalculationWorkshopPage` | 计算器中心 |
| `/calc/jones` | `JonesCalculatorPage` | 琼斯矩阵计算器 |
| `/calc/stokes` | `StokesCalculatorPage` | 斯托克斯矢量计算器 |
| `/calc/mueller` | `MuellerCalculatorPage` | 穆勒矩阵计算器 |
| `/calc/poincare` | `PoincareSphereViewerPage` | 庞加莱球可视化 |
| `/hardware` | `HardwarePage` | 硬件组件指南 |
| `/merchandise` | `MerchandisePage` | 教育周边商品 |

### 旧版路由重定向

| 旧路由 | 重定向到 |
|-----------|--------------|
| `/game` | `/games/3d` |
| `/game2d` | `/games/2d` |
| `/cardgame` | `/games/card` |
| `/escape` | `/games/escape` |
| `/devices` | `/optical-studio` |
| `/bench` | `/optical-studio` |
| `/optics` | `/optical-studio` |
| `/creative` | `/experiments` |
| `/simulation` | `/lab` |
| `/lab/poincare` | `/calc/poincare` |
| `/lab/jones` | `/calc/jones` |
| `/lab/stokes` | `/calc/stokes` |
| `/lab/mueller` | `/calc/mueller` |

### 核心组件

| 组件 | 职责 |
|-----------|----------------|
| `src/core/types.ts` | 类型定义、方向向量、偏振颜色 |
| `src/core/World.ts` | 方块存储、光传播元胞自动机、关卡 |
| `src/core/LightPhysics.ts` | 静态物理方法（四大光学公理） |
| `src/core/WaveOptics.ts` | 波动光学计算 |
| `src/core/JonesCalculus.ts` | 琼斯矢量/矩阵计算 |
| `src/stores/gameStore.ts` | 全局游戏状态、操作、订阅 |
| `src/stores/opticalBenchStore.ts` | 光学设计工作室状态、光路计算 |
| `src/stores/labStore.ts` | 实验室模块状态管理 |
| `src/stores/discoveryStore.ts` | 发现/成就追踪 |
| `src/components/game/Scene.tsx` | R3F 场景组合、控件、光照 |
| `src/pages/Game2DPage.tsx` | 2D 解谜游戏逻辑、SVG 渲染、关卡定义 |
| `src/pages/DemosPage.tsx` | 演示导航、信息卡片、SVG 图表 |
| `src/pages/OpticalDesignPage.tsx` | 模块化光学设计工作室 |

## 关键概念

### 四大物理公理

1. **正交性** - 相差 90° 偏振的光可以共存而不发生干涉
2. **马吕斯定律** - `I = I₀ × cos²(θ)`，其中 θ 是光偏振方向与滤波器透光轴之间的夹角
3. **双折射** - 方解石将光分为 o 光（0°）和 e 光（90°）
4. **干涉** - 同相光强度相加，反相光强度相消

### 核心类型（src/core/types.ts）

```typescript
// 光包 - 基本的光单位
interface LightPacket {
  direction: Direction;           // 'north'|'south'|'east'|'west'|'up'|'down'
  intensity: number;              // 0-15
  polarization: PolarizationAngle; // 0|45|90|135
  phase: Phase;                   // 1|-1
}

// 方块类型 - 为高级谜题扩展
type BlockType =
  | 'air' | 'solid' | 'emitter' | 'polarizer' | 'rotator'
  | 'splitter' | 'sensor' | 'mirror'
  // 高级光学组件
  | 'prism'          // 色散折射
  | 'lens'           // 聚焦/散焦光
  | 'beamSplitter'   // 50/50 分束
  | 'quarterWave'    // 线偏振 ⇄ 圆偏振
  | 'halfWave'       // 翻转偏振方向
  | 'absorber'       // 部分吸收
  | 'phaseShifter'   // 相位调制
  | 'portal'         // 传送光

// 方块状态 - 扩展了高级属性
interface BlockState {
  type: BlockType;
  rotation: number;              // 0, 90, 180, 270
  polarizationAngle: PolarizationAngle;
  rotationAmount: number;        // 对于旋转器：45 或 90
  activated: boolean;            // 对于传感器
  requiredIntensity: number;     // 对于传感器
  facing: Direction;
  // 扩展属性
  absorptionRate: number;        // 对于吸收器：0-1
  phaseShift: number;            // 对于移相器：0, 90, 180, 270
  linkedPortalId: string | null; // 对于传送门：链接的传送门 ID
  splitRatio: number;            // 对于分束器：0-1（默认 0.5）
  focalLength: number;           // 对于透镜：正数 = 凸透镜，负数 = 凹透镜
  dispersive: boolean;           // 对于棱镜：启用色散效果
}
```

### 方块类型

**核心方块：**

| 类型 | 用途 | 关键状态 |
|------|---------|-----------|
| `emitter` | 发射偏振光 | `polarizationAngle`, `facing` |
| `polarizer` | 过滤光（马吕斯定律） | `polarizationAngle` |
| `rotator` | 无损耗地旋转偏振方向 | `rotationAmount`（45 或 90） |
| `splitter` | 双折射晶体（方解石） | `facing` |
| `sensor` | 检测光，触发激活 | `polarizationAngle`, `requiredIntensity`, `activated` |
| `mirror` | 反射光 | `facing` |
| `solid` | 阻挡光 | - |

**高级方块（扩展系统）：**

| 类型 | 用途 | 关键状态 |
|------|---------|-----------|
| `prism` | 折射并色散光 | `dispersive` |
| `lens` | 聚焦或发散光 | `focalLength` |
| `beamSplitter` | 50/50 分束 | `splitRatio` |
| `quarterWave` | 线偏振 ⇄ 圆偏振转换 | `rotationAmount`（90） |
| `halfWave` | 翻转偏振方向 | `rotationAmount`（180） |
| `absorber` | 部分吸收光强度 | `absorptionRate` |
| `phaseShifter` | 移动光的相位 | `phaseShift` |
| `portal` | 将光传送到链接的传送门 | `linkedPortalId` |

## 状态管理（Zustand）

### 游戏存储结构

```typescript
// src/stores/gameStore.ts
interface GameState {
  // World 实例
  world: World | null

  // 关卡状态
  currentLevelIndex: number
  currentLevel: LevelData | null
  isLevelComplete: boolean

  // 玩家状态
  selectedBlockType: BlockType
  selectedBlockRotation: number
  selectedPolarizationAngle: PolarizationAngle

  // 视图状态
  visionMode: 'normal' | 'polarized'
  cameraMode: 'first-person' | 'isometric' | 'top-down'
  showGrid: boolean
  showHelp: boolean

  // 教程
  tutorialHints: string[]
  currentHintIndex: number
  showHint: boolean

  // 操作
  initWorld: (size?: number) => void
  loadLevel: (index: number) => void
  placeBlock: (position: BlockPosition) => void
  removeBlock: (position: BlockPosition) => void
  rotateBlockAt: (position: BlockPosition) => void
  // ... 更多操作
}
```

### 使用存储

```tsx
import { useGameStore } from '@/stores/gameStore'

function MyComponent() {
  const { world, visionMode, toggleVisionMode } = useGameStore()
  // 或者为了性能，选择特定值：
  const visionMode = useGameStore(state => state.visionMode)
}
```

## 游戏控制

| 输入 | 第一人称 | 等轴测/俯视 |
|-------|--------------|-------------------|
| WASD | 移动玩家 | 平移相机 |
| 空格 | 跳跃 | - |
| 鼠标 | 环视 | 相机控制 |
| 左键点击 | 放置方块 | 放置方块 |
| 右键点击 | 删除方块 | 删除方块 |
| R | 旋转悬停/选中的方块 | 同上 |
| V | 切换偏振视觉模式 | 同上 |
| C | 循环切换相机模式 | 同上 |
| G | 切换网格显示 | 同上 |
| H | 显示/隐藏帮助 | 同上 |
| 1-7 | 选择方块类型 | 同上 |

## 教程关卡（3D 游戏）

| 关卡 | 名称 | 概念 |
|-------|------|---------|
| 0 | 光与门 | 基本发射器 → 传感器，偏振匹配 |
| 1 | 偏振片 | 光通过滤波器，马吕斯定律介绍 |
| 2 | 马吕斯定律 | 两个偏振片，90° 阻挡 |
| 3 | 旋转器 | 波片无损耗地旋转偏振方向 |
| 4 | 双折射 | 方解石分束器产生两束光 |

## 2D 解谜游戏

2D 游戏 (`/games/2d`) 提供了一个简化、更易上手的解谜体验，使用了受《纪念碑谷》和《Shadowmatic》美学启发的基于 SVG 的视觉效果。

### 2D 游戏功能

- **基于 SVG 的渲染**，带有动画光束
- **实时光路计算**，使用递归光线追踪
- **偏振颜色可视化**切换
- **键盘控制**用于组件旋转（选中时使用方向键）
- **开放式谜题** - 许多关卡有多个有效解法

### 2D 关卡难度

| 难度 | 关卡 | 复杂度 |
|------------|--------|------------|
| 简单 | 0-2 | 基本偏振片/反射镜机制 |
| 中等 | 3-5 | 旋转器、分束器、L 形路径 |
| 困难 | 6-8 | 多个传感器、迷宫导航 |
| 专家 | 9-10 | 多个光源、复杂路径规划 |

### 2D 组件类型

| 组件 | 交互 | 行为 |
|-----------|-------------|----------|
| 发射器 | 锁定（仅查看） | 沿一个方向发射偏振光 |
| 偏振片 | 点击选中，用 ±15° 旋转 | 根据马吕斯定律过滤光 |
| 反射镜 | 点击选中，旋转 45°/135° | 以指定角度反射光 |
| 分束器 | 锁定（仅查看） | 产生 o 光（0°）和 e 光（90°） |
| 旋转器 | 点击切换 45°/90° | 无强度损耗地旋转偏振方向 |
| 传感器 | 锁定（仅查看） | 当强度/偏振匹配时激活 |

### 2D 控制

- **点击** - 选择未锁定的组件
- **左右方向键** - 旋转选中的组件
- **眼睛按钮** - 切换偏振颜色显示
- **重置** - 将关卡恢复到初始状态

## 光学设计工作室

一个全面的偏振光艺术设计工具，将器件库与交互式光学工作台相结合，用于创建和模拟光学系统。

### 功能

- **器件库** - 浏览 80+ 种光学器件，包含详细规格、工作原理、公式和真实世界应用
- **光学工作台** - 用于设计自定义光路的交互式 SVG 画布，支持拖放
- **经典实验** - 演示关键光学现象的预配置装置（马吕斯定律、双折射等）
- **挑战模式** - 基于目标的谜题，包含成功条件和提示
- **交互式教程** - 学习光学原理的分步指南
- **保存/加载设计** - 将设计持久化到 localStorage，以 JSON 格式导出/导入
- **第一性原理面板** - 四大光学公理的快速参考

### 组件类型（光学工作台）

| 组件 | 功能 | 关键属性 |
|-----------|----------|----------------|
| `emitter` | 光源 | `polarization` (0-180° 或 -1 表示非偏振) |
| `polarizer` | 线性偏振片滤波器 | `angle`（透光轴角度） |
| `waveplate` | 相位延迟器 | `retardation`（90 表示 λ/4, 180 表示 λ/2） |
| `mirror` | 反射光 | `reflectAngle`, `rotation` |
| `splitter` | 分束器 | `splitType` (PBS/NPBS/Calcite) |
| `sensor` | 检测光 | 读取强度 & 偏振 |
| `lens` | 聚焦/散焦 | `focalLength` |

### 光学工作台存储结构

```typescript
// src/stores/opticalBenchStore.ts
interface OpticalBenchState {
  // 工作台上的组件
  components: BenchComponent[]
  selectedComponentId: string | null

  // 光模拟
  lightSegments: LightSegment[]
  isSimulating: boolean
  showPolarization: boolean

  // UI 状态
  showGrid: boolean
  snapToGrid: boolean
  showLabels: boolean
  showAnnotations: boolean
  showFormulas: boolean

  // 历史记录（撤销/重做）
  history: HistoryState[]
  historyIndex: number

  // 已保存的设计
  savedDesigns: SavedDesign[]

  // 实验与挑战
  currentExperiment: ClassicExperiment | null
  currentChallenge: Challenge | null
  currentTutorial: Tutorial | null

  // 操作
  addComponent: (type: BenchComponentType, position: Position) => void
  updateComponent: (id: string, updates: Partial<BenchComponent>) => void
  moveComponent: (id: string, position: Position) => void
  rotateComponent: (id: string, angle: number) => void
  deleteComponent: (id: string) => void
  duplicateComponent: (id: string) => void

  calculateLightPaths: () => void
  saveDesign: (name: string) => void
  loadDesign: (id: string) => void
  loadExperiment: (experiment: ClassicExperiment) => void
  loadChallenge: (challenge: Challenge) => void

  undo: () => void
  redo: () => void
}
```

### 光路计算

光学工作台使用递归光线追踪来计算光路：

```typescript
// 光通过组件的传播
1. 从具有初始偏振的发射器开始
2. 追踪光线直到击中组件或边界
3. 应用组件效果：
   - 偏振片：应用马吕斯定律 (I = I₀ × cos²θ)
   - 波片：修改偏振态
   - 反射镜：反射并计算角度
   - 分束器：创建两条光线（对于方解石，产生 o 光和 e 光）
4. 继续追踪每条输出光线
5. 在传感器处或达到最大反弹次数 (10) 后停止
```

### 控制（光学工作台）

| 输入 | 操作 |
|-------|--------|
| 点击 + 拖拽 | 移动组件 |
| 点击 | 选择组件 |
| 双击 | 打开属性面板 |
| Delete/Backspace | 移除选中的组件 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+D | 复制选中项 |
| 空格 | 切换模拟 |

### 添加新实验

实验在 `opticalBenchStore.ts` 中定义：

```typescript
const experiment: ClassicExperiment = {
  id: 'malus-law',
  name: "马吕斯定律",
  nameZh: '马吕斯定律',
  description: '演示通过交叉偏振片时的强度变化',
  descriptionZh: '演示通过交叉偏振片的强度变化',
  difficulty: 'easy',
  components: [
    { type: 'emitter', x: 100, y: 200, polarization: 0 },
    { type: 'polarizer', x: 300, y: 200, angle: 45 },
    { type: 'sensor', x: 500, y: 200 },
  ],
  learningPoints: [
    '强度遵循 cos²θ 关系',
    '交叉偏振片 (90°) 阻挡所有光',
  ],
}
```

### 添加新挑战

```typescript
const challenge: Challenge = {
  id: 'challenge-1',
  name: '光之迷宫',
  nameZh: '光之迷宫',
  description: '以 50% 强度将光引导至传感器',
  difficulty: 'medium',
  initialComponents: [...],
  availableComponents: ['polarizer', 'mirror'],
  successConditions: {
    sensorIntensity: { min: 45, max: 55 },
    sensorPolarization: 90,
  },
  hints: ['首先尝试使用 45° 偏振片'],
}
```

## 计算工坊

一套用于偏振数学计算的工具：

| 计算器 | 路由 | 用途 |
|------------|-------|---------|
| 琼斯计算器 | `/calc/jones` | 琼斯矢量/矩阵运算 |
| 斯托克斯计算器 | `/calc/stokes` | 斯托克斯参数计算 |
| 穆勒计算器 | `/calc/mueller` | 穆勒矩阵运算 |
| 庞加莱球 | `/calc/poincare` | 3D 偏振态可视化 |

## 课程结构（交互式演示）

演示使用两种可视化方法：

- **2D**：SVG + Framer Motion 动画（对于波形/图表可视化更清晰）
- **3D**：React Three Fiber（用于空间关系和 3D 组件）

| 单元 | 主题 | 演示 | 可视化类型 |
|------|-------|-------|-------------|
| 0（基础） | 光学基础 | 光波、电磁波、电磁波谱、偏振介绍、偏振类型、马吕斯定律图、三偏振片、偏振片场景、虚拟透镜、交互式工作台 | 混合 |
| 1 | 光偏振 | 偏振态 (3D)、马吕斯定律 (2D)、双折射 (3D)、波片 (3D)、阿拉果-菲涅耳 | 混合 |
| 2 | 界面反射 | 菲涅耳方程、布儒斯特角 | 2D |
| 3 | 透明介质 | 色偏振、各向异性、旋光性、介质画廊 | 2D |
| 4 | 混浊介质 | 瑞利散射、米氏散射、蒙特卡洛散射 | 2D |
| 5 | 全偏振测量 | 斯托克斯矢量 (3D)、穆勒矩阵 (2D)、琼斯矩阵、偏振计算器、偏振显微术 | 混合 |

### 课程难度级别

该课程根据 COURSE.md 中面向研究的学习理念，实现了**三级难度系统**：

| 难度等级 | 图标 | 目标受众 | 学习模式 | 内容重点 |
|------------------|------|----------------|---------------|---------------|
| **基础** | 🔰 | 初学者，低年级本科生 | PSRT：问题驱动的研究入门 | 通过简单解释发现现象。无需公式！强调“为什么”而非“如何计算” |
| **应用** | ⚙️ | 具备基础知识的学习者 | ESRT：轮转式研究训练 | 动手实验，包含定量公式。侧重于测量原理和实验设计 |
| **研究** | 🧬 | 高级学习者，研究生 | ORIC/SURF：独立原创研究 | 前沿研究方法，严谨的学术处理。高级理论和研究视角 |

**按难度调整内容：**

每个演示都根据所选难度级别调整其内容：

- **基础级别：**
  - 隐藏数学公式
  - 使用简化的语言和日常类比
  - 侧重于视觉理解和与生活场景的联系
  - 最多 2 个物理细节，1 个前沿应用
  - 问题强调观察（“你看到了什么？”）

- **应用级别：**
  - 显示关键公式（例如，马吕斯定律：I = I₀ × cos²θ）
  - 包含数学符号和定量关系
  - 强调实验设计和测量技术
  - 最多 3 个物理细节，2 个前沿应用
  - 问题强调设计（“我们如何测量？”）

- **研究级别：**
  - 显示完整的公式推导
  - 使用严谨的学术术语
  - 包含高级概念（穆勒矩阵、斯托克斯矢量）
  - 最多 4 个物理细节，3 个前沿应用
  - 问题强调探索（“如果……会怎样？如何改进？”）

### 演示控制组件

`DemoControls.tsx` 文件为所有演示提供共享的 UI 组件：

```tsx
// 带标签和值显示的滑块
<SliderControl
  label="波长 (λ)"
  value={wavelength}
  min={380}
  max={700}
  step={5}
  unit=" nm"
  onChange={setWavelength}
  color="cyan"
/>

// 切换开关
<Toggle label="显示 B 场" checked={showBField} onChange={setShowBField} />

// 控制面板容器
<ControlPanel title="波参数">
  {/* 控件 */}
</ControlPanel>

// 用于解释的信息卡片
<InfoCard title="物理原理" color="cyan">
  <p>解释文本...</p>
</InfoCard>

// 值显示
<ValueDisplay label="频率" value="5.45 × 10¹⁴ Hz" />
```

## 开发指南

### TypeScript 配置

- 目标：ES2020
- 启用严格模式
- JSX: react-jsx
- 路径别名：`@/*` → `./src/*`
- 无未使用的局部变量/参数
- switch 语句中无贯穿

### 代码风格

- 对于物理/游戏逻辑解释，使用中文注释
- 对于技术文档，使用英文
- 优先使用带钩子的函数组件
- 使用 Zustand 处理全局状态，UI 特定问题仅使用局部状态
- 使用 `cn()` 工具函数处理条件类名（Tailwind）
- 所有角度均以度为单位（需要时转换为弧度）

### 添加新演示

1. 在相应的 `src/components/demos/unit*/` 文件夹中创建组件
2. 在 `DemosPage.tsx` 中导入组件
3. 将演示信息添加到 `DemosPage.tsx` 中的 `getDemoInfo()` 函数
4. 将演示条目添加到 `DemosPage.tsx` 中的 `DEMOS` 数组：

   ```typescript
   {
     id: 'my-demo',
     titleKey: 'demos.myDemo.title',
     unit: 1,
     component: MyDemoComponent,
     descriptionKey: 'demos.myDemo.description',
     visualType: '2D', // 或 '3D'
   }
   ```

5. 将翻译添加到 `src/i18n/locales/en.json` 和 `zh.json`
6. 从 `src/components/demos/index.ts` 导出

### 添加新方块类型（3D 游戏）

1. 将类型添加到 `src/core/types.ts` 中的 `BlockType` 联合类型
2. 在 `createDefaultBlockState()` 中添加默认处理
3. 在 `LightPhysics.ts` 中添加物理处理（如果影响光）
4. 在 `World.propagateLight()` 的 switch 语句中添加分支
5. 在 `Blocks.tsx` 中添加网格渲染
6. 更新 `BlockSelector.tsx` UI

### 添加新 2D 关卡

所有 2D 关卡都在 `src/pages/Game2DPage.tsx` 的 `LEVELS` 数组中定义：

```typescript
{
  id: 11,                           // 唯一关卡 ID
  name: '关卡名称',               // 英文名称
  nameZh: '关卡名称',                // 中文名称
  description: '关卡描述', // 英文描述
  descriptionZh: '关卡描述',         // 中文描述
  hint: '可选提示',            // 英文提示（可选）
  hintZh: '可选提示',                // 中文提示（可选）
  difficulty: 'medium',             // 'easy'|'medium'|'hard'|'expert'
  gridSize: { width: 100, height: 100 },
  openEnded: true,                  // 可能存在多种解法
  components: [
    { id: 'e1', type: 'emitter', x: 15, y: 50, angle: 0,
      polarizationAngle: 0, direction: 'right', locked: true },
    { id: 'p1', type: 'polarizer', x: 50, y: 50, angle: 0,
      polarizationAngle: 45, locked: false },
    { id: 's1', type: 'sensor', x: 85, y: 50, angle: 0,
      requiredIntensity: 50, requiredPolarization: 45, locked: true },
  ],
}
```

**组件位置**：`x` 和 `y` 是网格区域的百分比（0-100）。
**锁定组件**：对于玩家无法修改的组件，设置 `locked: true`。

### 添加翻译

```json
// src/i18n/locales/en.json
{
  "namespace": {
    "key": "English text"
  }
}

// src/i18n/locales/zh.json
{
  "namespace": {
    "key": "中文文本"
  }
}
```

用法：

```tsx
const { t } = useTranslation()
return <span>{t('namespace.key')}</span>
```

### 主题支持

```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>
      {/* 使用 CSS 变量或条件类 */}
    </div>
  )
}
```

## 构建配置

### Vite 配置

```typescript
// vite.config.ts
{
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: { '@': resolve(__dirname, './src') }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  }
}
```

### 依赖项

**前端生产环境：**

- `react`, `react-dom` (v19) - UI 框架
- `react-router-dom` (v7) - 客户端路由
- `three`, `@react-three/fiber`, `@react-three/drei` - 3D 渲染
- `framer-motion` - 用于课程演示的 2D 动画
- `zustand` - 状态管理
- `i18next`, `react-i18next`, `i18next-browser-languagedetector` - 国际化

**前端开发环境：**

- `typescript` - 类型安全
- `vite`, `@vitejs/plugin-react` - 构建工具
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom` - 测试
- `tailwindcss`, `@tailwindcss/vite` - 样式
- `lucide-react` - 图标
- `class-variance-authority`, `clsx`, `tailwind-merge` - 工具类

**后端：**

- `@nestjs/*` - 服务器框架
- `@colyseus/*` - 实时多人游戏

## 测试

```bash
# 以监视模式运行测试
npm run test

# 运行一次测试
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage
```

测试使用 Vitest 配合 React Testing Library 和 jsdom 进行 DOM 模拟。

## 调试

### 访问世界状态

```javascript
// 在浏览器控制台中
const store = window.__ZUSTAND_DEVTOOLS_GLOBAL_STORE__
// 或者在组件中直接导入进行调试
```

### 光传播

World 类公开了用于调试的方法：

```typescript
world.getAllBlocks()      // 获取所有已放置的方块
world.getAllLightStates() // 获取所有光位置和光包
world.getLightState(x, y, z) // 获取特定位置的光
```

### 视觉调试

- 按 `V` 键切换偏振视觉模式（显示偏振颜色）
- 按 `G` 键切换网格覆盖层
- 使用等轴测/俯视图以获得更好的谜题概览

## 后端服务器（未来多人游戏）

服务器已设置，但多人游戏功能尚未实现：

```bash
cd server
npm run start:dev  # 在端口 3001 启动
```

- API 前缀：`/api`
- WebSocket：`ws://localhost:3001`
- 为 `localhost:5173` 和 `localhost:3000` 启用 CORS

## 常见任务

### 运行开发服务器

```bash
npm run dev
# 在 http://localhost:5173 打开
```

### 为生产环境构建

```bash
npm run build
npm run preview  # 在本地测试生产环境构建
```

### 添加新语言

1. 创建 `src/i18n/locales/{lang}.json`
2. 在 `src/i18n/index.ts` 中导入并添加到 `resources`
3. 将语言选项添加到 `LanguageThemeSwitcher.tsx`

### 使用 Framer Motion 创建新演示

对于具有流畅动画的基于 2D SVG 的演示：

```tsx
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SliderControl, ControlPanel, InfoCard } from '../DemoControls'

export function MyDemo() {
  const [value, setValue] = useState(50)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="flex gap-6">
      {/* 可视化 */}
      <div className="flex-1">
        <svg viewBox="0 0 700 300" className="w-full">
          <motion.path
            d="M 0,150 Q 100,50 200,150 T 400,150"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            animate={isPlaying ? { d: [...paths] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* 控件 */}
      <ControlPanel title="参数">
        <SliderControl
          label="值"
          value={value}
          min={0}
          max={100}
          onChange={setValue}
        />
      </ControlPanel>
    </div>
  )
}
```

## 物理参考

### 偏振颜色（视觉模式）

| 角度 | 颜色 | 十六进制 |
|-------|-------|-----|
| 0°（水平） | 红色 | `#ff4444` |
| 45° | 橙/黄 | `#ffaa00` |
| 90°（垂直） | 绿色 | `#44ff44` |
| 135° | 蓝色 | `#4444ff` |

### 方向向量

```typescript
const DIRECTION_VECTORS = {
  north: { x: 0, y: 0, z: -1 },
  south: { x: 0, y: 0, z: 1 },
  east:  { x: 1, y: 0, z: 0 },
  west:  { x: -1, y: 0, z: 0 },
  up:    { x: 0, y: 1, z: 0 },
  down:  { x: 0, y: -1, z: 0 }
}
```

### 强度计算（马吕斯定律）

```typescript
// 当光通过偏振片时
const outputIntensity = inputIntensity * Math.cos(angleDiff * Math.PI / 180) ** 2
```
