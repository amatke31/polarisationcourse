/**
 * Data module exports
 * 数据模块导出
 */

// Types
export * from './types'

// Optical Devices Catalog (NEW)
export {
  DEVICES,
  DEVICE_CATEGORIES,
  DIFFICULTY_CONFIG,
  PALETTE_COMPONENTS,
  getDeviceById,
  getDevicesByCategory,
  searchDevices,
  type Device,
  type DeviceCategory,
  type DeviceDifficulty,
  type DeviceSpecification,
  type DeviceCategoryConfig,
  type PaletteComponent,
} from './optical-devices'

// Experiments, Challenges & Tutorials (NEW)
export {
  CLASSIC_EXPERIMENTS,
  CHALLENGES,
  TUTORIALS,
  getExperimentById,
  getChallengeById,
  getTutorialById,
  getChallengesByDifficulty,
} from './experiments-challenges'

// Hardware UC2
export * from './hardware/modules'
export * from './hardware/configurations'
export * from './hardware/bom'

// Card Game
export * from './cardgame/cards'
export * from './cardgame/rules'

// Merchandise
export * from './merchandise/products'

// Cultural Creations (文创作品)
export * from './cultural-creations'

// Student Projects (学生课题)
export * from './student-projects'
