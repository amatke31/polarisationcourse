import { useEffect, useCallback, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PointerLockControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'
import { Blocks } from './Blocks'
import { LightBeams } from './LightBeams'
import { SelectionBox } from './SelectionBox'
import { BlockPosition } from '@/core/types'

export function Scene() {
  const {
    world,
    cameraMode,
    showGrid,
    visionMode,
    placeBlock,
    removeBlock,
    rotateBlockAt,
  } = useGameStore()

  const { gl, camera } = useThree()
  const [targetPosition, setTargetPosition] = useState<BlockPosition | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<BlockPosition | null>(null)
  const pointerLockRef = useRef<any>(null)

  // Movement state tracking for WASD controls
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  // Movement physics constants
  const MOVE_SPEED = 0.15
  const JUMP_FORCE = 0.3
  const GRAVITY = -0.015

  // Velocity and ground state for jumping
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const isGrounded = useRef(true)

  // Set up scene background
  useEffect(() => {
    const scene = gl.domElement.parentElement
    if (scene) {
      gl.setClearColor(visionMode === 'polarized' ? 0x150505 : 0x0a0a15)
    }
  }, [visionMode, gl])

  // Set initial camera position for different modes
  useEffect(() => {
    if (cameraMode === 'isometric') {
      camera.position.set(15, 15, 15)
      camera.lookAt(0, 1, 0)
    } else if (cameraMode === 'top-down') {
      camera.position.set(0, 25, 0.1)
      camera.lookAt(0, 0, 0)
    } else if (cameraMode === 'first-person') {
      camera.position.set(0, 2, 5)
    }
  }, [cameraMode, camera])

  // Handle keyboard input for camera mode toggle and ESC to exit pointer lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { setCameraMode, toggleVisionMode, toggleGrid, toggleHelp, rotateSelectedBlock } = useGameStore.getState()
      const currentCameraMode = useGameStore.getState().cameraMode

      switch (e.code) {
        case 'Escape':
          // Exit pointer lock mode when ESC is pressed
          if (currentCameraMode === 'first-person' && document.pointerLockElement) {
            document.exitPointerLock()
            // Optionally switch to isometric view for easier navigation
            // setCameraMode('isometric')
          }
          break
        case 'KeyC':
          const modes: ('first-person' | 'isometric' | 'top-down')[] = ['first-person', 'isometric', 'top-down']
          const nextIndex = (modes.indexOf(currentCameraMode) + 1) % modes.length
          setCameraMode(modes[nextIndex])
          break
        case 'KeyV':
          toggleVisionMode()
          break
        case 'KeyG':
          toggleGrid()
          break
        case 'KeyH':
          toggleHelp()
          break
        case 'KeyR':
          if (hoveredBlock) {
            rotateBlockAt(hoveredBlock)
          } else {
            rotateSelectedBlock()
          }
          break
        // WASD movement keys
        case 'KeyW':
          moveState.current.forward = true
          break
        case 'KeyS':
          moveState.current.backward = true
          break
        case 'KeyA':
          moveState.current.left = true
          break
        case 'KeyD':
          moveState.current.right = true
          break
        case 'Space':
          moveState.current.jump = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = false
          break
        case 'KeyS':
          moveState.current.backward = false
          break
        case 'KeyA':
          moveState.current.left = false
          break
        case 'KeyD':
          moveState.current.right = false
          break
        case 'Space':
          moveState.current.jump = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [hoveredBlock])

  const handleBlockClick = useCallback((position: BlockPosition, normal: THREE.Vector3, button: number) => {
    if (button === 0) {
      // Left click - place block adjacent to clicked face
      const newPos: BlockPosition = {
        x: position.x + Math.round(normal.x),
        y: position.y + Math.round(normal.y),
        z: position.z + Math.round(normal.z),
      }
      if (newPos.y > 0) {
        placeBlock(newPos)
      }
    } else if (button === 2) {
      // Right click - remove block
      if (position.y > 0) {
        removeBlock(position)
      }
    }
  }, [placeBlock, removeBlock])

  const handleBlockHover = useCallback((position: BlockPosition | null, targetPos: BlockPosition | null) => {
    setHoveredBlock(position)
    setTargetPosition(targetPos)
  }, [])

  // Player movement loop - updates camera position each frame based on WASD input
  useFrame(() => {
    // Only apply movement in first-person mode
    if (cameraMode !== 'first-person') return

    // Get camera's forward direction (flattened to horizontal plane)
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0 // Flatten to horizontal plane for movement
    direction.normalize()

    // Calculate right vector (perpendicular to forward direction)
    const right = new THREE.Vector3()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0))

    // Apply WASD movement
    if (moveState.current.forward) {
      camera.position.addScaledVector(direction, MOVE_SPEED)
    }
    if (moveState.current.backward) {
      camera.position.addScaledVector(direction, -MOVE_SPEED)
    }
    if (moveState.current.left) {
      camera.position.addScaledVector(right, -MOVE_SPEED)
    }
    if (moveState.current.right) {
      camera.position.addScaledVector(right, MOVE_SPEED)
    }

    // Handle jumping
    if (moveState.current.jump && isGrounded.current) {
      velocity.current.y = JUMP_FORCE
      isGrounded.current = false
    }

    // Apply gravity
    velocity.current.y += GRAVITY
    camera.position.y += velocity.current.y

    // Ground collision check (keep camera at y=2 minimum)
    if (camera.position.y <= 2) {
      camera.position.y = 2
      velocity.current.y = 0
      isGrounded.current = true
    }
  })

  return (
    <>
      {/* Enhanced Lighting - Monument Valley inspired soft aesthetic */}
      <ambientLight intensity={0.5} color={0x404860} />

      {/* Main key light - warm sun-like */}
      <directionalLight
        position={[12, 25, 12]}
        intensity={1.0}
        color={0xfff8f0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />

      {/* Fill light - cool blue for contrast */}
      <directionalLight position={[-15, 12, -10]} intensity={0.35} color={0x7090cc} />

      {/* Rim light - subtle highlight */}
      <directionalLight position={[0, 8, -15]} intensity={0.2} color={0xaabbff} />

      {/* Hemisphere light for soft ambient */}
      <hemisphereLight
        args={[0x88aacc, 0x443322, 0.4]}
        position={[0, 50, 0]}
      />

      {/* Atmospheric fog - gives depth */}
      {cameraMode === 'first-person' && (
        <fog attach="fog" args={[visionMode === 'polarized' ? 0x150810 : 0x0a0a18, 25, 70]} />
      )}
      {cameraMode !== 'first-person' && (
        <fog attach="fog" args={[visionMode === 'polarized' ? 0x150810 : 0x0a0a18, 50, 120]} />
      )}

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[20, 20]}
          position={[0, 0.01, 0]}
          cellColor={0x303050}
          sectionColor={0x4080aa}
          fadeDistance={50}
          fadeStrength={1}
          cellThickness={1}
          sectionThickness={1.5}
          infiniteGrid
        />
      )}

      {/* World blocks */}
      {world && (
        <Blocks
          world={world}
          visionMode={visionMode}
          onBlockClick={handleBlockClick}
          onBlockHover={handleBlockHover}
        />
      )}

      {/* Light beams */}
      {world && <LightBeams world={world} visionMode={visionMode} />}

      {/* Selection box */}
      {targetPosition && (
        <SelectionBox position={targetPosition} valid={targetPosition.y > 0} />
      )}

      {/* Camera controls based on mode */}
      {cameraMode === 'first-person' ? (
        <PointerLockControls ref={pointerLockRef} />
      ) : (
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          panSpeed={0.8}
          zoomSpeed={1.2}
          enablePan={cameraMode === 'isometric' || cameraMode === 'top-down'}
          enableRotate={cameraMode === 'isometric'}
          maxPolarAngle={cameraMode === 'top-down' ? 0.1 : Math.PI / 2}
          minPolarAngle={cameraMode === 'top-down' ? 0.1 : 0.1}
          minDistance={5}
          maxDistance={50}
          // 使触控板更流畅
          enableZoom
          screenSpacePanning
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      )}
    </>
  )
}
