/**
 * PhysicsMode Enum
 * Defines the different physics computation modes available in the unified engine
 *
 * Mode descriptions:
 * - LEGACY_SCALAR: Original game physics using LightPacket (intensity 0-15, 4 discrete angles)
 * - JONES_LINEAR: Jones calculus with linear polarization only (continuous angles)
 * - JONES_FULL: Full Jones calculus with circular/elliptical polarization support
 * - COHERENCY: Coherency matrix representation for partial polarization support
 * - SPECTRAL: Wavelength-dependent physics (future enhancement)
 */
export enum PhysicsMode {
  LEGACY_SCALAR = 'legacy',
  JONES_LINEAR = 'jones-linear',
  JONES_FULL = 'jones-full',
  COHERENCY = 'coherency',
  SPECTRAL = 'spectral',
}

/**
 * Get the display name for a physics mode
 */
export function getPhysicsModeDisplayName(mode: PhysicsMode, isZh: boolean = false): string {
  const names: Record<PhysicsMode, { en: string; zh: string }> = {
    [PhysicsMode.LEGACY_SCALAR]: { en: 'Scalar Mode', zh: '标量模式' },
    [PhysicsMode.JONES_LINEAR]: { en: 'Jones Linear', zh: '琼斯线性' },
    [PhysicsMode.JONES_FULL]: { en: 'Jones Full', zh: '完整琼斯' },
    [PhysicsMode.COHERENCY]: { en: 'Coherency Matrix', zh: '相干矩阵' },
    [PhysicsMode.SPECTRAL]: { en: 'Spectral Mode', zh: '光谱模式' },
  };
  return isZh ? names[mode].zh : names[mode].en;
}

/**
 * Get the description for a physics mode
 */
export function getPhysicsModeDescription(mode: PhysicsMode, isZh: boolean = false): string {
  const descriptions: Record<PhysicsMode, { en: string; zh: string }> = {
    [PhysicsMode.LEGACY_SCALAR]: {
      en: 'Simplified game physics (intensity 0-15, 4 discrete angles)',
      zh: '简化游戏物理（强度0-15，4个离散角度）',
    },
    [PhysicsMode.JONES_LINEAR]: {
      en: 'Jones calculus with linear polarization (continuous angles)',
      zh: '琼斯微积分与线性偏振（连续角度）',
    },
    [PhysicsMode.JONES_FULL]: {
      en: 'Full Jones calculus with circular/elliptical polarization',
      zh: '完整琼斯微积分支持圆/椭圆偏振',
    },
    [PhysicsMode.COHERENCY]: {
      en: 'Coherency matrix representation for partial polarization',
      zh: '相干矩阵表示部分偏振',
    },
    [PhysicsMode.SPECTRAL]: {
      en: 'Wavelength-dependent physics (future enhancement)',
      zh: '波长相关物理（未来增强）',
    },
  };
  return isZh ? descriptions[mode].zh : descriptions[mode].en;
}

/**
 * Check if a mode is available (not future-only)
 */
export function isModeAvailable(mode: PhysicsMode): boolean {
  return mode !== PhysicsMode.SPECTRAL;
}
