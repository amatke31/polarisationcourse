# Game Module Refactor Plan

## Summary

**Goal**: Refactor the game module to improve maintainability, performance, and functionality through 4 core phases over 3-4 weeks.

**Your Priorities**: Maintainability → Performance → Functionality
**Timeline**: 3-4 weeks
**Physics**: Keep both Scalar + Wave modes
**Progress**: Unified between 3D and 2D games

---

## Current Issues

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | Game2DPage.tsx: 1520 lines | Impossible to maintain |
| P0 | Dual Physics Systems | Confusing, slow |
| P0 | Scene.tsx: Mixed Concerns | Violates SRP |
| P1 | gameStore: Bloated (342 lines) | Hard to understand |
| P1 | No Shared Progress | Poor UX |

---

## 4 Phases

### Phase 1: Split Game2DPage.tsx (Week 1)

**Problem**: 1520-line monolith

**Solution**: Split into focused components

```
src/components/game2d/
├── Game2DPage.tsx           # Entry point (~150 lines)
├── GameBoard.tsx            # SVG rendering (~200 lines)
├── GameControls.tsx         # Input handling (~100 lines)
├── LevelManager.tsx         # Level loading (~150 lines)
└── VictoryModal.tsx         # Win display (~100 lines)
```

**Files Modified**: `src/pages/Game2DPage.tsx`

**Benefits**: Maintainable, testable, reusable

---

### Phase 2: Unify Physics (Week 2)

**Problem**: Dual systems (Scalar + Wave) causing duplication

**Solution**: Single engine with mode switching

```
src/core/physics/
├── PhysicsEngine.ts         # Main engine
├── modes/
│   ├── ScalarMode.ts        # Simplified game physics
│   └── WaveMode.ts          # Accurate Jones calculus
└── adapters/
    ├── WorldAdapter.ts      # 3D integration
    └── Game2DAdapter.ts     # 2D integration
```

**Files Modified**: `src/core/LightPhysics.ts`, `src/core/World.ts`

**Benefits**: Single source of truth, better performance

---

### Phase 3: Separate Scene Concerns (Week 3)

**Problem**: Scene.tsx has rendering + input + camera logic

**Solution**: Split into managers

```
src/components/game/3d/
├── Scene.tsx                # Composition only (~50 lines)
└── managers/
    ├── CameraManager.ts     # Camera modes (~100 lines)
    ├── InputManager.ts      # Keyboard/mouse (~150 lines)
    └── LightingManager.tsx  # Scene lighting (~100 lines)
```

**Files Modified**: `src/components/game/Scene.tsx`

**Benefits**: Single responsibility per manager

---

### Phase 4: Refactor State Management (Week 4)

**Problem**: Bloated gameStore with mixed concerns

**Solution**: Split into focused stores with shared progress

```
src/stores/
├── game/gameStore.ts        # Core 3D state (~150 lines)
├── game2d/game2DStore.ts    # 2D state (~150 lines)
├── progress/progressStore.ts # Shared 3D+2D progress (~100 lines)
└── ui/uiStore.ts            # Camera, vision, help (~100 lines)
```

**Files Modified**: `src/stores/gameStore.ts`

**Benefits**: Clear boundaries, shared progress

---

## Critical Files

| File | Lines | Phase | Change |
|------|-------|-------|--------|
| Game2DPage.tsx | 1520 | 1 | Split into 7 components |
| LightPhysics.ts | 1109 | 2 | Use PhysicsEngine |
| World.ts | 1039 | 2 | Remove dual propagation |
| Scene.tsx | 222 | 3 | Split into managers |
| gameStore.ts | 342 | 4 | Split into 4 stores |

---

## Verification

After each phase:
1. Run tests: `npm run test`
2. Play game to verify functionality
3. Check console for errors

Final checklist:
- [ ] All 5 tutorial levels playable (3D)
- [ ] All 18 levels playable (2D)
- [ ] Progress shared between games
- [ ] Camera/vision modes work
- [ ] No console errors
- [ ] 60fps performance

---

## Rollback Strategy

- Old code kept until new code verified
- Git commits after each phase
- Can revert individual phases
