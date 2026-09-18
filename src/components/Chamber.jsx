import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function Chamber({ controller, onReady, onError, onComplete }) {
  const host = useRef(null)
  const callbacks = useRef({ onReady, onError, onComplete })
  useEffect(() => { callbacks.current = { onReady, onError, onComplete } })
  useEffect(() => {
    const container = host.current
    let renderer, model, mixer, observer, raf, paper, disposed = false, active = false
    let elapsed = 0, previous = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#090f19')
    scene.fog = new THREE.Fog('#090f19', 15, 35)
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100)
    camera.position.set(5, -13, 6.6)
    camera.up.set(0, 0, 1)
    camera.lookAt(0, 0, 2.2)
    // Blender glTF is Y-up; use a parent to restore Blender coordinates.
    const stage = new THREE.Group()
    stage.rotation.x = Math.PI / 2
    scene.add(stage)
    scene.add(new THREE.HemisphereLight(0xb5dfff, 0x1c2130, 2))
    for (const [color, intensity, position] of [[0xdceaff,80,[1,-5,7]], [0xffbc73,65,[-4,1,5]], [0x49baff,90,[4,2,3]]]) {
      const light = new THREE.PointLight(color,intensity)
      light.position.set(...position)
      scene.add(light)
    }
    const pulse = new THREE.PointLight(0x51dfff,0)
    pulse.position.set(0,-1,2.5)
    scene.add(pulse)
    const release = (root) => {
      const materials = new Set(), textures = new Set()
      root.traverse(obj => {
        obj.geometry?.dispose()
        for (const mat of (Array.isArray(obj.material) ? obj.material : [obj.material])) {
          if (!mat) continue
          materials.add(mat)
          for (const value of Object.values(mat)) if (value?.isTexture) textures.add(value)
        }
      })
      textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose())
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      container.appendChild(renderer.domElement)
      observer = new ResizeObserver(() => {
        const { width, height } = container.getBoundingClientRect()
        renderer.setSize(width, height)
        camera.aspect = width / Math.max(height,1)
        camera.fov = camera.aspect < .85 ? 48 : 34
        camera.updateProjectionMatrix()
      })
      observer.observe(container)
      new GLTFLoader().load('/models/chamber.glb', gltf => {
        if (disposed) { release(gltf.scene); return }
        model = gltf.scene
        paper = model.getObjectByName('Dossier_paper') || model.getObjectByName('Dossier paper')
        stage.add(model)
        mixer = new THREE.AnimationMixer(model)
        gltf.animations.forEach(clip => {
          const action = mixer.clipAction(clip)
          action.setLoop(THREE.LoopOnce,1)
          action.clampWhenFinished = true
          action.play()
        })
        mixer.setTime(0)
        controller.current = {
          summon() { elapsed = 0; active = true; if (paper) paper.visible = true; mixer.setTime(0) },
          reset() { active = false; elapsed = 0; mixer.setTime(0); pulse.intensity = 0 },
          skip() { active = false; mixer.setTime(3.2); if (paper) paper.visible = false; pulse.intensity = 0; callbacks.current.onComplete() },
        }
        callbacks.current.onReady()
      }, undefined, () => { if (!disposed) callbacks.current.onError() })
      const draw = now => {
        if (disposed) return
        const dt = previous ? Math.min((now-previous)/1000,.05) : 0
        previous = now
        if (active && mixer) {
          elapsed += dt
          mixer.setTime(reduced.matches ? 3.2 : elapsed)
          pulse.intensity = reduced.matches ? 0 : Math.max(0,1-Math.abs(elapsed-2.15)/.3)*70
          if (elapsed >= 3.2 || reduced.matches) {
            active = false
            if (paper) paper.visible = false
            pulse.intensity = 0
            callbacks.current.onComplete()
          }
        }
        if (!document.hidden) renderer.render(scene,camera)
        raf = requestAnimationFrame(draw)
      }
      raf = requestAnimationFrame(draw)
    } catch { callbacks.current.onError() }
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer?.disconnect()
      controller.current = null
      mixer?.stopAllAction()
      if (model) { mixer?.uncacheRoot(model); release(model) }
      renderer?.dispose()
      renderer?.domElement.remove()
    }
  }, [controller])
  return <div className="chamber" ref={host} aria-hidden="true" />
}
