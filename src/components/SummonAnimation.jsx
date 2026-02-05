import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import MobileSummonAnimation from './MobileSummonAnimation'

// Hook to detect mobile - responds to window resize
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

// Use CSS animation on mobile for smooth performance
export default function SummonAnimation(props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileSummonAnimation {...props} />
  }
  return <DesktopSummonAnimation {...props} />
}

// Mobile-optimized config overrides
const MOBILE_CONFIG = {
  ringCount: 3,          // Reduced from 5
  detailLevel: 2,        // Reduced from 5
  runeDensity: 8,        // Reduced from 16
}

const RUNES = [
  // Elder Futhark runes
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ",
  // Geometric symbols (non-emoji)
  "◇", "◆", "△", "▽", "▷", "◁", "○", "●", "□", "■", "◈", "◉", "⊕", "⊗", "⊙", "⊛",
  // Alchemical/arcane symbols
  "∆", "∇", "⟁", "⟐", "⟡", "⌖", "⌘", "⍟", "⎈", "⏣", "⏥", "⏦"
]

const CONFIG = {
  // Idle state values
  idleWispEnergy: 0.08,
  idleBloom: 0.2,
  idleRotationSpeed: 0.3,
  idleStreakOpacity: 0.15,

  // Active state values
  coreSize: 40,
  wispEnergy: 0.5,
  glowRadius: 120,
  pulseSpeed: 1.0,
  streakCount: 20,
  streakLength: 200,
  streakFlicker: 0.4,
  ringCount: 5,          // Reduced for cleaner look / mobile
  innerRadius: 60,       // Start a bit further out
  ringSpacing: 40,       // Spacing between rings
  rotationSpeed: 0.8,
  runeDensity: 16,       // More runes per ring
  detailLevel: 5,        // Max detail
  bloom: 0.5,
  chromatic: 0.003,  // Reduced - mainly for summon flash
  coreColor: '#ffffff',
  glowColor: '#a8d4e6',    // Softer, more ethereal blue
  glyphColor: '#6ba8c2',   // Muted mystical cyan (less cyberpunk)
  accentColor: '#c9a961',  // Antique gold (warmer, less orange)
}

// Chromatic Aberration Shader
const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: CONFIG.chromatic },
    time: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      vec2 offset = normalize(center) * amount * dist;

      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
}

// Static check for desktop optimizations (only used within desktop component)
const isLowPowerDevice = typeof window !== 'undefined' && window.innerWidth < 768

function DesktopSummonAnimation({ triggerCount = 0, onComplete }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const flashRef = useRef(null)
  const ringRef = useRef(null)
  const pulseRef = useRef(null)
  const prevTriggerRef = useRef(0)  // Track previous trigger count
  const isAnimatingRef = useRef(false)  // Prevent overlapping animations
  const animationStateRef = useRef({
    wispEnergy: CONFIG.idleWispEnergy,
    bloom: CONFIG.idleBloom,
    rotationSpeed: CONFIG.idleRotationSpeed,
    streakOpacity: CONFIG.idleStreakOpacity
  })
  const threeRef = useRef(null)

  // Reset to idle state before starting new animation
  const resetToIdle = useCallback(() => {
    const state = animationStateRef.current
    state.wispEnergy = CONFIG.idleWispEnergy
    state.bloom = CONFIG.idleBloom
    state.rotationSpeed = CONFIG.idleRotationSpeed
    state.streakOpacity = CONFIG.idleStreakOpacity

    if (threeRef.current) {
      const { wispMaterial, bloomPass } = threeRef.current
      wispMaterial.uniforms.energy.value = CONFIG.idleWispEnergy
      wispMaterial.uniforms.coreSize.value = CONFIG.coreSize
      if (bloomPass) bloomPass.strength = CONFIG.idleBloom
    }

    // Reset overlay elements
    if (flashRef.current) flashRef.current.style.opacity = '0'
    if (ringRef.current) {
      ringRef.current.style.opacity = '0'
      ringRef.current.style.transform = 'translate(-50%, -50%) scale(0.1)'
    }
    if (pulseRef.current) {
      pulseRef.current.style.opacity = '0'
      pulseRef.current.style.transform = 'translate(-50%, -50%) scale(0)'
    }
  }, [])

  // Run summon sequence
  const runSummonSequence = useCallback(async () => {
    if (!threeRef.current || isAnimatingRef.current) return

    isAnimatingRef.current = true
    resetToIdle()  // Start fresh

    const { wispMaterial, bloomPass } = threeRef.current
    const state = animationStateRef.current
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))

    // === PHASE 1: Build-up with accelerating spin (3 seconds) ===
    // Ring starts expanding at 2s mark
    const buildUpFrames = 90  // 3 seconds at ~30fps
    const ringStartFrame = 60  // Start ring expansion at 2s

    for (let i = 0; i <= buildUpFrames; i++) {
      await sleep(33)
      const t = i / buildUpFrames

      // Continuous acceleration - gets faster and faster
      const spinMultiplier = 1 + Math.pow(t, 2.5) * 30  // Exponential acceleration

      state.wispEnergy = CONFIG.idleWispEnergy + t * (CONFIG.wispEnergy * 1.5 - CONFIG.idleWispEnergy)
      state.bloom = CONFIG.idleBloom + t * (CONFIG.bloom + 2 - CONFIG.idleBloom)
      state.rotationSpeed = CONFIG.rotationSpeed * spinMultiplier
      state.streakOpacity = CONFIG.idleStreakOpacity + t * (0.6 - CONFIG.idleStreakOpacity)

      wispMaterial.uniforms.energy.value = state.wispEnergy
      wispMaterial.uniforms.coreSize.value = CONFIG.coreSize * (1 + t * 0.5)
      if (bloomPass) bloomPass.strength = state.bloom

      // Start ring expansion at 2s mark
      if (i === ringStartFrame && ringRef.current) {
        ringRef.current.style.opacity = '1'
        ringRef.current.style.transform = 'translate(-50%, -50%) scale(0.1)'
      }

      // Expand ring during last second (frames 60-90)
      if (i > ringStartFrame && ringRef.current) {
        const ringT = (i - ringStartFrame) / (buildUpFrames - ringStartFrame)
        const scale = 0.1 + ringT * 1.5  // Expand to 1.6x
        ringRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
        ringRef.current.style.opacity = `${1 - ringT * 0.2}`
      }
    }

    // === PHASE 2A: Ring contracts to center ===
    state.rotationSpeed = 0  // Stop spinning during contraction

    for (let i = 0; i <= 10; i++) {
      await sleep(25)
      const t = i / 10

      // Ring shrinks to center
      if (ringRef.current) {
        const scale = 1.6 - t * 1.5  // Shrink from 1.6 to 0.1
        ringRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
        ringRef.current.style.opacity = `${0.8 + t * 0.2}`  // Get brighter as it shrinks
      }

      // Energy concentrates
      wispMaterial.uniforms.coreSize.value = CONFIG.coreSize * (1.5 + t * 1.5)
      wispMaterial.uniforms.energy.value = CONFIG.wispEnergy * (2 + t * 2)
      if (bloomPass) bloomPass.strength = CONFIG.bloom + 2 + t * 2
    }

    // Hide ring
    if (ringRef.current) {
      ringRef.current.style.opacity = '0'
    }

    // === PHASE 2B: Dramatic pause - everything frozen ===
    await sleep(200)

    // === PHASE 2C: Clear counter-rotation "click" (1/4 rotation) ===
    const counterFrames = 12
    for (let i = 0; i <= counterFrames; i++) {
      await sleep(18)
      const t = i / counterFrames
      // Stronger reverse rotation - 1/4 turn
      state.rotationSpeed = -CONFIG.rotationSpeed * 5 * (1 - t * 0.7)
    }

    // Lock in place
    state.rotationSpeed = 0

    // Brief moment of tension before flash
    await sleep(80)

    // === PHASE 3: FLASH - full screen white explosion ===
    wispMaterial.uniforms.coreSize.value = CONFIG.coreSize * 6
    wispMaterial.uniforms.energy.value = CONFIG.wispEnergy * 8
    if (bloomPass) bloomPass.strength = 8

    if (flashRef.current) {
      flashRef.current.style.opacity = '1'
    }

    await sleep(80)

    // === PHASE 4: PULSE WAVE - expands outward ===
    if (pulseRef.current) {
      pulseRef.current.style.opacity = '1'
      pulseRef.current.style.transform = 'translate(-50%, -50%) scale(0)'
    }

    // Expand pulse wave out of frame
    for (let i = 0; i <= 15; i++) {
      await sleep(30)
      const t = i / 15
      const scale = t * 4  // Expand to 4x (off screen)
      if (pulseRef.current) {
        pulseRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
        pulseRef.current.style.opacity = `${1 - t}`  // Fade as it expands
      }
      // Fade flash
      if (flashRef.current) {
        flashRef.current.style.opacity = `${1 - t * 0.8}`
      }
    }

    // Clean up overlays
    if (flashRef.current) flashRef.current.style.opacity = '0'
    if (pulseRef.current) pulseRef.current.style.opacity = '0'

    await sleep(100)

    // === PHASE 5: Settle ===
    for (let i = 0; i <= 20; i++) {
      await sleep(25)
      const t = i / 20
      wispMaterial.uniforms.coreSize.value = CONFIG.coreSize * 6 - (CONFIG.coreSize * 5) * t
      wispMaterial.uniforms.energy.value = CONFIG.wispEnergy * 8 - (CONFIG.wispEnergy * 7) * t
      if (bloomPass) bloomPass.strength = 8 - (8 - CONFIG.bloom) * t
      state.rotationSpeed = CONFIG.rotationSpeed * t * 0.3
    }

    // Signal ready for card
    if (onComplete) {
      onComplete()
    }

    // Continue subtle animation behind card
    state.wispEnergy = CONFIG.wispEnergy * 0.3
    state.bloom = CONFIG.bloom * 0.5
    state.rotationSpeed = CONFIG.rotationSpeed * 0.3

    isAnimatingRef.current = false
  }, [onComplete, resetToIdle])

  // Trigger summon when triggerCount increases
  useEffect(() => {
    // Only trigger when count increases (not on mount with 0) and Three.js is ready
    if (triggerCount > prevTriggerRef.current) {
      prevTriggerRef.current = triggerCount

      // Wait a tick for Three.js to be ready if component just mounted
      const timer = setTimeout(() => {
        if (threeRef.current) {
          runSummonSequence()
        }
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [triggerCount, runSummonSequence])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let width = container.clientWidth
    let height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050510)

    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 0.1, 1000
    )
    camera.position.z = 100

    const renderer = new THREE.WebGLRenderer({ antialias: !isLowPowerDevice }) // Disable antialiasing on mobile
    renderer.setSize(width, height)
    renderer.setPixelRatio(isLowPowerDevice ? 1 : Math.min(window.devicePixelRatio, 2)) // Lower pixel ratio on mobile
    container.appendChild(renderer.domElement)

    // Post-processing - disabled on mobile for performance
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    // Skip bloom and chromatic aberration on mobile
    let bloomPass = null
    let chromaPass = null

    if (!isLowPowerDevice) {
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        CONFIG.idleBloom, 0.4, 0.85
      )
      composer.addPass(bloomPass)

      chromaPass = new ShaderPass(ChromaticShader)
      composer.addPass(chromaPass)
    }

    // Wisp shader material
    const wispMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        energy: { value: CONFIG.idleWispEnergy },
        coreSize: { value: CONFIG.coreSize },
        glowRadius: { value: CONFIG.glowRadius },
        pulseSpeed: { value: CONFIG.pulseSpeed },
        coreColor: { value: new THREE.Color(CONFIG.coreColor) },
        glowColor: { value: new THREE.Color(CONFIG.glowColor) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float energy;
        uniform float coreSize;
        uniform float glowRadius;
        uniform float pulseSpeed;
        uniform vec3 coreColor;
        uniform vec3 glowColor;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          float pulse = 1.0 + sin(time * pulseSpeed * 2.0) * 0.2 * energy;
          float coreRadius = coreSize / 500.0 * pulse;
          float core = 1.0 - smoothstep(0.0, coreRadius, dist);
          core = pow(core, 2.0);
          float glowR = glowRadius / 500.0 * pulse;
          float glow = 1.0 - smoothstep(0.0, glowR, dist);
          glow = pow(glow, 3.0);
          vec3 color = mix(glowColor, coreColor, core);
          float alpha = (glow * 0.6 + core * 0.8) * energy;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const wispGeometry = new THREE.PlaneGeometry(500, 500)
    const wisp = new THREE.Mesh(wispGeometry, wispMaterial)
    scene.add(wisp)

    // Store refs for animation control (streaks removed)
    threeRef.current = { wispMaterial, bloomPass, chromaPass }

    // Create glyph SVG - with mobile optimization
    createGlyph(svgRef.current, width, height, isLowPowerDevice)

    // Animation loop
    let time = 0
    let animationId
    const ringRotations = []
    const ringCount = isLowPowerDevice ? MOBILE_CONFIG.ringCount : CONFIG.ringCount
    for (let i = 0; i < ringCount; i++) {
      ringRotations.push({
        angle: 0,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 0.8 + i * 0.15
      })
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.016

      const state = animationStateRef.current

      wispMaterial.uniforms.time.value = time

      // Rotate glyph rings with current speed
      ringRotations.forEach((rot, i) => {
        rot.angle += rot.direction * state.rotationSpeed * rot.speed * 0.3
        const ring = document.getElementById(`summon-ring-${i}`)
        if (ring) {
          const cx = ring.getAttribute('data-cx')
          const cy = ring.getAttribute('data-cy')
          ring.setAttribute('transform', `rotate(${rot.angle}, ${cx}, ${cy})`)
        }
      })

      // Rotate spikes with outermost ring (same direction as last ring)
      const spikes = document.getElementById('summon-ring-spikes')
      if (spikes && ringRotations.length > 0) {
        const lastRot = ringRotations[ringRotations.length - 1]
        const cx = spikes.getAttribute('data-cx')
        const cy = spikes.getAttribute('data-cy')
        spikes.setAttribute('transform', `rotate(${lastRot.angle}, ${cx}, ${cy})`)
      }

      // Update bloom based on state (only on desktop)
      if (bloomPass) {
        bloomPass.strength = state.bloom
      }

      // Only update chromatic aberration on desktop
      if (chromaPass) {
        chromaPass.uniforms.time.value = time
      }
      composer.render()
    }

    animate()

    // Handle resize
    const handleResize = () => {
      width = container.clientWidth
      height = container.clientHeight
      camera.left = width / -2
      camera.right = width / 2
      camera.top = height / 2
      camera.bottom = height / -2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      composer.setSize(width, height)
      createGlyph(svgRef.current, width, height, isLowPowerDevice)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      composer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#050510',
        zIndex: 0
      }}
    >
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      {/* Electric ring - expands then shrinks */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          border: '4px solid rgba(168, 212, 230, 0.9)',
          boxShadow: `
            0 0 20px rgba(168, 212, 230, 0.8),
            0 0 40px rgba(107, 168, 194, 0.6),
            0 0 60px rgba(201, 169, 97, 0.3),
            inset 0 0 30px rgba(168, 212, 230, 0.3)
          `,
          background: 'radial-gradient(circle, transparent 60%, rgba(168, 212, 230, 0.1) 80%, rgba(201, 169, 97, 0.15) 100%)',
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.1)',
          pointerEvents: 'none',
          zIndex: 8,
          animation: 'electric-flicker 0.1s infinite'
        }}
      >
        {/* Inner electric arcs */}
        <div style={{
          position: 'absolute',
          inset: '10px',
          borderRadius: '50%',
          border: '2px dashed rgba(255, 255, 255, 0.5)',
          animation: 'spin-fast 0.3s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '20px',
          borderRadius: '50%',
          border: '1px solid rgba(201, 169, 97, 0.4)',
          animation: 'spin-fast 0.2s linear infinite reverse'
        }} />
      </div>

      {/* Full-screen flash overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(220,235,245,0.95) 20%, rgba(168,212,230,0.8) 40%, rgba(201,169,97,0.4) 60%, transparent 80%)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Pulse wave ring - expands outward */}
      <div
        ref={pulseRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '4px solid rgba(168, 212, 230, 0.8)',
          boxShadow: '0 0 30px rgba(168, 212, 230, 0.6)',
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0)',
          pointerEvents: 'none',
          zIndex: 9
        }}
      />
    </div>
  )
}

function createGlyph(svg, width, height, isMobileDevice = false) {
  if (!svg) return

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.innerHTML = ''

  const cx = width / 2
  const cy = height / 2

  // Use mobile-optimized values when on mobile
  const ringCount = isMobileDevice ? MOBILE_CONFIG.ringCount : CONFIG.ringCount
  const detailLevel = isMobileDevice ? MOBILE_CONFIG.detailLevel : CONFIG.detailLevel
  const runeDensity = isMobileDevice ? MOBILE_CONFIG.runeDensity : CONFIG.runeDensity

  // Two-tone color scheme (FGO style)
  const cyanColor = CONFIG.glyphColor    // #4fb3d4
  const goldColor = CONFIG.accentColor   // #fbbf24

  // Defs with filters for both colors
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
  defs.innerHTML = `
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-strong">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-gold">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
  svg.appendChild(defs)

  // Create rings with alternating cyan/gold colors
  for (let ring = 0; ring < ringCount; ring++) {
    const radius = CONFIG.innerRadius + ring * CONFIG.ringSpacing

    // Alternate colors: even rings = cyan, odd rings = gold
    const ringColor = ring % 2 === 0 ? cyanColor : goldColor
    const ringFilter = ring % 2 === 0 ? "url(#glow)" : "url(#glow-gold)"

    const ringGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    ringGroup.setAttribute("id", `summon-ring-${ring}`)
    ringGroup.setAttribute("data-cx", cx)
    ringGroup.setAttribute("data-cy", cy)

    // Sporadic dash patterns - more chaotic for outer rings
    const sporadicPatterns = [
      "15,8,45,12,8,20,30,6",
      "50,15,10,8,25,20,5,12,40,8",
      "8,25,60,10,15,30,5,15",
      "35,8,12,25,55,12,8,18,20,10",
      "20,30,8,15,45,8,12,20,30,15"
    ]
    const mainPatterns = [
      "80,6,25,6,40,8,15,6",
      "45,8,70,6,20,10,35,6",
      "30,5,60,8,15,5,90,8",
      "55,6,25,8,45,6,30,10",
      "70,8,15,6,40,8,25,6,50,8"
    ]
    const innerPatterns = [
      "12,18,35,15,8,25,20,12",
      "25,20,10,30,40,15,6,25",
      "18,12,50,20,12,18,30,25",
      "8,30,25,15,45,20,10,18",
      "35,25,15,20,8,30,25,15"
    ]

    // Double-line effect: outer line (slightly larger) - sporadic breaks
    const outerLine = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    outerLine.setAttribute("cx", cx)
    outerLine.setAttribute("cy", cy)
    outerLine.setAttribute("r", radius + 4)
    outerLine.setAttribute("fill", "none")
    outerLine.setAttribute("stroke", ringColor)
    outerLine.setAttribute("stroke-width", "0.5")
    outerLine.setAttribute("filter", ringFilter)
    outerLine.setAttribute("opacity", "0.4")
    outerLine.setAttribute("stroke-dasharray", sporadicPatterns[ring % sporadicPatterns.length])
    ringGroup.appendChild(outerLine)

    // Second outer line for more layering
    const outerLine2 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    outerLine2.setAttribute("cx", cx)
    outerLine2.setAttribute("cy", cy)
    outerLine2.setAttribute("r", radius + 2)
    outerLine2.setAttribute("fill", "none")
    outerLine2.setAttribute("stroke", ring % 2 === 0 ? goldColor : cyanColor)
    outerLine2.setAttribute("stroke-width", "0.3")
    outerLine2.setAttribute("opacity", "0.3")
    outerLine2.setAttribute("stroke-dasharray", innerPatterns[(ring + 2) % innerPatterns.length])
    ringGroup.appendChild(outerLine2)

    // Main circle - with sporadic breaks
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    circle.setAttribute("cx", cx)
    circle.setAttribute("cy", cy)
    circle.setAttribute("r", radius)
    circle.setAttribute("fill", "none")
    circle.setAttribute("stroke", ringColor)
    circle.setAttribute("stroke-width", ring === ringCount - 1 ? "1.2" : "0.8")
    circle.setAttribute("filter", ringFilter)
    circle.setAttribute("opacity", "0.75")
    circle.setAttribute("stroke-dasharray", mainPatterns[ring % mainPatterns.length])
    ringGroup.appendChild(circle)

    // Inner line (slightly smaller) - creates double-line effect
    const innerLine = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    innerLine.setAttribute("cx", cx)
    innerLine.setAttribute("cy", cy)
    innerLine.setAttribute("r", radius - 3)
    innerLine.setAttribute("fill", "none")
    innerLine.setAttribute("stroke", ringColor)
    innerLine.setAttribute("stroke-width", "0.5")
    innerLine.setAttribute("opacity", "0.45")
    innerLine.setAttribute("stroke-dasharray", innerPatterns[ring % innerPatterns.length])
    ringGroup.appendChild(innerLine)

    // Extra sporadic inner line
    const innerLine2 = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    innerLine2.setAttribute("cx", cx)
    innerLine2.setAttribute("cy", cy)
    innerLine2.setAttribute("r", radius - 5)
    innerLine2.setAttribute("fill", "none")
    innerLine2.setAttribute("stroke", ring % 2 === 0 ? goldColor : cyanColor)
    innerLine2.setAttribute("stroke-width", "0.3")
    innerLine2.setAttribute("opacity", "0.25")
    innerLine2.setAttribute("stroke-dasharray", sporadicPatterns[(ring + 3) % sporadicPatterns.length])
    ringGroup.appendChild(innerLine2)

    // Decorative broken circle (opposite color for contrast)
    if (ring > 0) {
      const innerColor = ring % 2 === 0 ? goldColor : cyanColor
      const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      inner.setAttribute("cx", cx)
      inner.setAttribute("cy", cy)
      inner.setAttribute("r", radius - 8)
      inner.setAttribute("fill", "none")
      inner.setAttribute("stroke", innerColor)
      inner.setAttribute("stroke-width", "0.4")
      inner.setAttribute("stroke-dasharray", sporadicPatterns[(ring + 1) % sporadicPatterns.length])
      inner.setAttribute("opacity", "0.3")
      ringGroup.appendChild(inner)
    }

    // Ticks and runes
    const tickCount = runeDensity + ring * 3
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2
      const isMajor = i % 4 === 0
      const tickLen = isMajor ? 8 : 4

      const x1 = cx + Math.cos(angle) * (radius - tickLen)
      const y1 = cy + Math.sin(angle) * (radius - tickLen)
      const x2 = cx + Math.cos(angle) * (radius + tickLen)
      const y2 = cy + Math.sin(angle) * (radius + tickLen)

      // Alternate tick colors within ring
      const tickColor = isMajor ? ringColor : (ring % 2 === 0 ? goldColor : cyanColor)
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
      tick.setAttribute("x1", x1)
      tick.setAttribute("y1", y1)
      tick.setAttribute("x2", x2)
      tick.setAttribute("y2", y2)
      tick.setAttribute("stroke", tickColor)
      tick.setAttribute("stroke-width", isMajor ? "1.5" : "0.8")
      tick.setAttribute("opacity", isMajor ? "0.7" : "0.4")
      ringGroup.appendChild(tick)

      // Runes - alternate colors
      if (isMajor && detailLevel >= 2) {
        const runeR = radius + 15
        const rx = cx + Math.cos(angle) * runeR
        const ry = cy + Math.sin(angle) * runeR

        // Alternate rune colors within ring
        const runeIdx = Math.floor(i / 4)
        const runeColor = runeIdx % 2 === 0 ? cyanColor : goldColor
        const runeFilter = runeIdx % 2 === 0 ? "url(#glow)" : "url(#glow-gold)"

        const rune = document.createElementNS("http://www.w3.org/2000/svg", "text")
        rune.setAttribute("x", rx)
        rune.setAttribute("y", ry)
        rune.setAttribute("text-anchor", "middle")
        rune.setAttribute("dominant-baseline", "middle")
        rune.setAttribute("fill", runeColor)
        rune.setAttribute("font-size", "11")
        rune.setAttribute("filter", runeFilter)
        rune.setAttribute("opacity", "0.7")
        rune.textContent = RUNES[Math.floor(Math.random() * RUNES.length)]
        ringGroup.appendChild(rune)
      }
    }

    // Random sporadic connecting lines around circumference (spins with ring)
    const sporadicLineCount = 8 + ring * 4  // More lines on outer rings
    for (let i = 0; i < sporadicLineCount; i++) {
      // Random start and end angles
      const startAngle = Math.random() * Math.PI * 2
      const arcSpan = (Math.random() * 0.4 + 0.1) * Math.PI  // 18-90 degree arcs
      const endAngle = startAngle + arcSpan

      // Random radius offset for variety
      const rOffset1 = (Math.random() - 0.5) * 15
      const rOffset2 = (Math.random() - 0.5) * 15
      const r1 = radius + rOffset1
      const r2 = radius + rOffset2

      const x1 = cx + Math.cos(startAngle) * r1
      const y1 = cy + Math.sin(startAngle) * r1
      const x2 = cx + Math.cos(endAngle) * r2
      const y2 = cy + Math.sin(endAngle) * r2

      // Randomly choose line type: straight, arc, or zigzag
      const lineType = Math.floor(Math.random() * 3)
      const lineColor = Math.random() > 0.5 ? cyanColor : goldColor
      const lineOpacity = 0.15 + Math.random() * 0.25

      if (lineType === 0) {
        // Straight line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttribute("x1", x1)
        line.setAttribute("y1", y1)
        line.setAttribute("x2", x2)
        line.setAttribute("y2", y2)
        line.setAttribute("stroke", lineColor)
        line.setAttribute("stroke-width", Math.random() * 0.5 + 0.3)
        line.setAttribute("opacity", lineOpacity)
        if (Math.random() > 0.5) {
          line.setAttribute("stroke-dasharray", `${Math.random() * 8 + 2},${Math.random() * 6 + 2}`)
        }
        ringGroup.appendChild(line)
      } else if (lineType === 1) {
        // Arc along circumference
        const arcPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
        const midAngle = (startAngle + endAngle) / 2
        const bulge = (Math.random() - 0.5) * 20
        const mx = cx + Math.cos(midAngle) * (radius + bulge)
        const my = cy + Math.sin(midAngle) * (radius + bulge)
        arcPath.setAttribute("d", `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`)
        arcPath.setAttribute("fill", "none")
        arcPath.setAttribute("stroke", lineColor)
        arcPath.setAttribute("stroke-width", Math.random() * 0.4 + 0.2)
        arcPath.setAttribute("opacity", lineOpacity)
        ringGroup.appendChild(arcPath)
      } else {
        // Zigzag/angular connection
        const midAngle = (startAngle + endAngle) / 2
        const zigOffset = (Math.random() - 0.5) * 25
        const mx = cx + Math.cos(midAngle) * (radius + zigOffset)
        const my = cy + Math.sin(midAngle) * (radius + zigOffset)
        const zigPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
        zigPath.setAttribute("d", `M ${x1} ${y1} L ${mx} ${my} L ${x2} ${y2}`)
        zigPath.setAttribute("fill", "none")
        zigPath.setAttribute("stroke", lineColor)
        zigPath.setAttribute("stroke-width", Math.random() * 0.4 + 0.2)
        zigPath.setAttribute("opacity", lineOpacity * 0.8)
        ringGroup.appendChild(zigPath)
      }
    }

    // Random cross-connections within ring area
    const crossCount = 3 + ring * 2
    for (let i = 0; i < crossCount; i++) {
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = angle1 + (Math.random() * 0.8 + 0.3) * Math.PI  // 54-198 degrees apart
      const r1 = radius - 10 + Math.random() * 20
      const r2 = radius - 10 + Math.random() * 20

      const x1 = cx + Math.cos(angle1) * r1
      const y1 = cy + Math.sin(angle1) * r1
      const x2 = cx + Math.cos(angle2) * r2
      const y2 = cy + Math.sin(angle2) * r2

      const crossLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
      crossLine.setAttribute("x1", x1)
      crossLine.setAttribute("y1", y1)
      crossLine.setAttribute("x2", x2)
      crossLine.setAttribute("y2", y2)
      crossLine.setAttribute("stroke", Math.random() > 0.6 ? goldColor : cyanColor)
      crossLine.setAttribute("stroke-width", "0.3")
      crossLine.setAttribute("opacity", 0.1 + Math.random() * 0.15)
      crossLine.setAttribute("stroke-dasharray", `${Math.random() * 15 + 5},${Math.random() * 10 + 3}`)
      ringGroup.appendChild(crossLine)
    }

    // Connectors between rings - use gold for contrast
    if (ring < ringCount - 1 && detailLevel >= 3) {
      const nextRadius = CONFIG.innerRadius + (ring + 1) * CONFIG.ringSpacing
      const connCount = 6 + ring * 2

      for (let i = 0; i < connCount; i++) {
        const angle = (i / connCount) * Math.PI * 2
        const x1 = cx + Math.cos(angle) * radius
        const y1 = cy + Math.sin(angle) * radius
        const x2 = cx + Math.cos(angle + 0.08) * nextRadius
        const y2 = cy + Math.sin(angle + 0.08) * nextRadius
        const midR = (radius + nextRadius) / 2 + 8
        const mx = cx + Math.cos(angle + 0.04) * midR
        const my = cy + Math.sin(angle + 0.04) * midR

        // Alternate connector colors
        const connColor = i % 2 === 0 ? cyanColor : goldColor
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("d", `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`)
        path.setAttribute("fill", "none")
        path.setAttribute("stroke", connColor)
        path.setAttribute("stroke-width", "0.8")
        path.setAttribute("opacity", "0.35")
        ringGroup.appendChild(path)

        // Diamonds - gold for accent
        if (i % 2 === 0 && detailLevel >= 4) {
          const dx = cx + Math.cos(angle) * ((radius + nextRadius) / 2)
          const dy = cy + Math.sin(angle) * ((radius + nextRadius) / 2)
          const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
          diamond.setAttribute("points", `${dx},${dy-4} ${dx+4},${dy} ${dx},${dy+4} ${dx-4},${dy}`)
          diamond.setAttribute("fill", goldColor)
          diamond.setAttribute("opacity", "0.6")
          diamond.setAttribute("filter", "url(#glow-gold)")
          ringGroup.appendChild(diamond)
        }
      }
    }

    // Triangles - alternate colors
    if (detailLevel >= 4 && ring < ringCount - 1) {
      const nextRadius = CONFIG.innerRadius + (ring + 1) * CONFIG.ringSpacing
      const triR = (radius + nextRadius) / 2
      const triCount = 3 + ring

      for (let i = 0; i < triCount; i++) {
        const angle = (i / triCount) * Math.PI * 2 + Math.PI / 6
        const tx = cx + Math.cos(angle) * triR
        const ty = cy + Math.sin(angle) * triR

        const triColor = i % 2 === 0 ? cyanColor : goldColor
        const tri = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
        const pts = []
        for (let j = 0; j < 3; j++) {
          const a = angle + (j / 3) * Math.PI * 2
          pts.push(`${tx + Math.cos(a) * 6},${ty + Math.sin(a) * 6}`)
        }
        tri.setAttribute("points", pts.join(" "))
        tri.setAttribute("fill", "none")
        tri.setAttribute("stroke", triColor)
        tri.setAttribute("stroke-width", "0.8")
        tri.setAttribute("opacity", "0.5")
        ringGroup.appendChild(tri)
      }
    }

    // Extra detail level 5: small circles and dots - alternate colors
    if (detailLevel >= 5) {
      const dotCount = 8 + ring * 2
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2 + (ring * 0.2)
        const dotR = radius - 15
        const dx = cx + Math.cos(angle) * dotR
        const dy = cy + Math.sin(angle) * dotR

        const dotColor = i % 3 === 0 ? goldColor : cyanColor
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        dot.setAttribute("cx", dx)
        dot.setAttribute("cy", dy)
        dot.setAttribute("r", i % 3 === 0 ? "2" : "1")
        dot.setAttribute("fill", dotColor)
        dot.setAttribute("opacity", i % 3 === 0 ? "0.6" : "0.3")
        ringGroup.appendChild(dot)
      }
    }

    svg.appendChild(ringGroup)
  }

  // Radial geometric lines spanning multiple rings - alternating colors
  const radialGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  const radialCount = 12
  const innermost = CONFIG.innerRadius
  const outermost = CONFIG.innerRadius + (ringCount - 1) * CONFIG.ringSpacing

  for (let i = 0; i < radialCount; i++) {
    const angle = (i / radialCount) * Math.PI * 2

    // Main radial line from inner to outer - alternate colors
    const radialColor = i % 2 === 0 ? cyanColor : goldColor
    const radialFilter = i % 2 === 0 ? "url(#glow)" : "url(#glow-gold)"
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", cx + Math.cos(angle) * innermost)
    line.setAttribute("y1", cy + Math.sin(angle) * innermost)
    line.setAttribute("x2", cx + Math.cos(angle) * outermost)
    line.setAttribute("y2", cy + Math.sin(angle) * outermost)
    line.setAttribute("stroke", radialColor)
    line.setAttribute("stroke-width", "1")
    line.setAttribute("opacity", "0.35")
    line.setAttribute("filter", radialFilter)
    radialGroup.appendChild(line)

    // Secondary diagonal lines between radials - opposite color
    if (i % 2 === 0) {
      const nextAngle = ((i + 1) / radialCount) * Math.PI * 2
      const midRadius = (innermost + outermost) / 2

      const diag = document.createElementNS("http://www.w3.org/2000/svg", "line")
      diag.setAttribute("x1", cx + Math.cos(angle) * (midRadius - 30))
      diag.setAttribute("y1", cy + Math.sin(angle) * (midRadius - 30))
      diag.setAttribute("x2", cx + Math.cos(nextAngle) * (midRadius + 30))
      diag.setAttribute("y2", cy + Math.sin(nextAngle) * (midRadius + 30))
      diag.setAttribute("stroke", goldColor)
      diag.setAttribute("stroke-width", "0.6")
      diag.setAttribute("opacity", "0.3")
      radialGroup.appendChild(diag)
    }
  }
  svg.appendChild(radialGroup)

  // Outer spikes/pointys on the outermost circle - alternating cyan/gold
  const spikesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  spikesGroup.setAttribute("id", "summon-ring-spikes")
  spikesGroup.setAttribute("data-cx", cx)
  spikesGroup.setAttribute("data-cy", cy)

  const spikeCount = 24
  const spikeBaseRadius = outermost
  const spikeLength = 25
  const spikeWidth = 8

  for (let i = 0; i < spikeCount; i++) {
    const angle = (i / spikeCount) * Math.PI * 2
    const isMajor = i % 3 === 0

    // Alternate spike colors - major spikes are gold, minor are cyan
    const spikeColor = isMajor ? goldColor : cyanColor
    const spikeFilter = isMajor ? "url(#glow-gold)" : "url(#glow)"

    // Spike tip
    const tipX = cx + Math.cos(angle) * (spikeBaseRadius + (isMajor ? spikeLength * 1.5 : spikeLength))
    const tipY = cy + Math.sin(angle) * (spikeBaseRadius + (isMajor ? spikeLength * 1.5 : spikeLength))

    // Spike base points (left and right)
    const baseAngleOffset = (isMajor ? spikeWidth * 1.2 : spikeWidth) / spikeBaseRadius
    const baseLeftX = cx + Math.cos(angle - baseAngleOffset) * spikeBaseRadius
    const baseLeftY = cy + Math.sin(angle - baseAngleOffset) * spikeBaseRadius
    const baseRightX = cx + Math.cos(angle + baseAngleOffset) * spikeBaseRadius
    const baseRightY = cy + Math.sin(angle + baseAngleOffset) * spikeBaseRadius

    const spike = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    spike.setAttribute("points", `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`)
    spike.setAttribute("fill", isMajor ? spikeColor : "none")
    spike.setAttribute("stroke", spikeColor)
    spike.setAttribute("stroke-width", isMajor ? "1.5" : "1")
    spike.setAttribute("opacity", isMajor ? "0.7" : "0.4")
    spike.setAttribute("filter", spikeFilter)
    spikesGroup.appendChild(spike)

    // Small circle at major spike tips - gold with strong glow
    if (isMajor) {
      const tipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      tipCircle.setAttribute("cx", tipX)
      tipCircle.setAttribute("cy", tipY)
      tipCircle.setAttribute("r", "3")
      tipCircle.setAttribute("fill", goldColor)
      tipCircle.setAttribute("opacity", "0.9")
      tipCircle.setAttribute("filter", "url(#glow-gold)")
      spikesGroup.appendChild(tipCircle)
    }
  }
  svg.appendChild(spikesGroup)

  // Center design - abstract broken geometry (not Star of David)
  const centerG = document.createElementNS("http://www.w3.org/2000/svg", "g")

  // Outer broken ring
  const outerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  outerRing.setAttribute("cx", cx)
  outerRing.setAttribute("cy", cy)
  outerRing.setAttribute("r", "38")
  outerRing.setAttribute("fill", "none")
  outerRing.setAttribute("stroke", cyanColor)
  outerRing.setAttribute("stroke-width", "1")
  outerRing.setAttribute("stroke-dasharray", "12,8,20,8,6,8")
  outerRing.setAttribute("filter", "url(#glow)")
  outerRing.setAttribute("opacity", "0.6")
  centerG.appendChild(outerRing)

  // Radiating broken lines from center (not forming triangles)
  const rayCount = 8
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 - Math.PI / 2
    const rayColor = i % 2 === 0 ? cyanColor : goldColor
    const rayFilter = i % 2 === 0 ? "url(#glow)" : "url(#glow-gold)"

    // Inner segment (gap in middle)
    const innerRay = document.createElementNS("http://www.w3.org/2000/svg", "line")
    innerRay.setAttribute("x1", cx + Math.cos(angle) * 8)
    innerRay.setAttribute("y1", cy + Math.sin(angle) * 8)
    innerRay.setAttribute("x2", cx + Math.cos(angle) * 18)
    innerRay.setAttribute("y2", cy + Math.sin(angle) * 18)
    innerRay.setAttribute("stroke", rayColor)
    innerRay.setAttribute("stroke-width", "1.5")
    innerRay.setAttribute("filter", rayFilter)
    innerRay.setAttribute("opacity", "0.8")
    centerG.appendChild(innerRay)

    // Outer segment (separated from inner)
    const outerRay = document.createElementNS("http://www.w3.org/2000/svg", "line")
    outerRay.setAttribute("x1", cx + Math.cos(angle) * 24)
    outerRay.setAttribute("y1", cy + Math.sin(angle) * 24)
    outerRay.setAttribute("x2", cx + Math.cos(angle) * 35)
    outerRay.setAttribute("y2", cy + Math.sin(angle) * 35)
    outerRay.setAttribute("stroke", rayColor)
    outerRay.setAttribute("stroke-width", "1")
    outerRay.setAttribute("filter", rayFilter)
    outerRay.setAttribute("opacity", "0.6")
    centerG.appendChild(outerRay)
  }

  // Broken inner arcs (not complete shapes)
  for (let i = 0; i < 4; i++) {
    const startAngle = (i / 4) * Math.PI * 2 + Math.PI / 8
    const arcColor = i % 2 === 0 ? goldColor : cyanColor

    const arc = document.createElementNS("http://www.w3.org/2000/svg", "path")
    const r = 28
    const arcLength = Math.PI / 3  // 60 degree arc
    const x1 = cx + Math.cos(startAngle) * r
    const y1 = cy + Math.sin(startAngle) * r
    const x2 = cx + Math.cos(startAngle + arcLength) * r
    const y2 = cy + Math.sin(startAngle + arcLength) * r

    arc.setAttribute("d", `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`)
    arc.setAttribute("fill", "none")
    arc.setAttribute("stroke", arcColor)
    arc.setAttribute("stroke-width", "1")
    arc.setAttribute("stroke-dasharray", "8,4")
    arc.setAttribute("filter", i % 2 === 0 ? "url(#glow-gold)" : "url(#glow)")
    arc.setAttribute("opacity", "0.5")
    centerG.appendChild(arc)
  }

  // Small center details
  const innerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  innerRing.setAttribute("cx", cx)
  innerRing.setAttribute("cy", cy)
  innerRing.setAttribute("r", "12")
  innerRing.setAttribute("fill", "none")
  innerRing.setAttribute("stroke", cyanColor)
  innerRing.setAttribute("stroke-width", "0.8")
  innerRing.setAttribute("stroke-dasharray", "4,6")
  innerRing.setAttribute("filter", "url(#glow)")
  innerRing.setAttribute("opacity", "0.5")
  centerG.appendChild(innerRing)

  const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  centerDot.setAttribute("cx", cx)
  centerDot.setAttribute("cy", cy)
  centerDot.setAttribute("r", "3")
  centerDot.setAttribute("fill", goldColor)
  centerDot.setAttribute("filter", "url(#glow-gold)")
  centerDot.setAttribute("opacity", "0.85")
  centerG.appendChild(centerDot)

  svg.appendChild(centerG)
}
