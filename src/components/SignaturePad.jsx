import { useEffect, useRef, useState } from 'react'

export default function SignaturePad({ locked, onAuthorize }) {
  const [strokes, setStrokes] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [pending, setPending] = useState(false)
  const active = useRef(null)
  const distance = useRef(0)
  const latestStrokes = useRef([])
  const sendTimer = useRef(null)
  useEffect(() => {
    if (locked) clearTimeout(sendTimer.current)
    return () => clearTimeout(sendTimer.current)
  }, [locked])
  function cancelCountdown() {
    clearTimeout(sendTimer.current)
    setPending(false)
  }
  function updateStrokes(next) {
    latestStrokes.current = next
    setStrokes(next)
  }
  function point(e) {
    const matrix = e.currentTarget.getScreenCTM()
    if (!matrix) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
    return [Math.max(8, Math.min(292, p.x)), Math.max(8, Math.min(82, p.y))]
  }
  function start(e) {
    if (locked || active.current || !e.isPrimary || e.button !== 0) return
    const p = point(e)
    if (!p) return
    cancelCountdown()
    e.currentTarget.setPointerCapture(e.pointerId)
    active.current = { id: e.pointerId, points: [p] }
    updateStrokes([...latestStrokes.current, [p]])
    setDrawing(true)
  }
  function move(e) {
    const stroke = active.current
    if (!stroke || stroke.id !== e.pointerId || locked) return
    const p = point(e)
    if (!p) return
    const last = stroke.points.at(-1)
    const step = Math.hypot(p[0]-last[0], p[1]-last[1])
    if (step < .8) return
    distance.current += step
    stroke.points.push(p)
    updateStrokes([...latestStrokes.current.slice(0,-1), [...stroke.points]])
  }
  function finish(e, cancelled = false) {
    if (active.current?.id !== e.pointerId) return
    active.current = null
    setDrawing(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (!cancelled && distance.current >= 14) {
      setPending(true)
      sendTimer.current = setTimeout(() => {
        setPending(false)
        onAuthorize(latestStrokes.current)
      }, 1000)
    } else {
      cancelCountdown()
    }
  }
  function clear() {
    cancelCountdown()
    updateStrokes([])
    distance.current = 0
  }
  return <div className={`signature-pad ${drawing ? 'is-drawing' : ''} ${pending ? 'is-pending' : ''} ${locked ? 'signed' : ''}`}>
    <div className="signature-label"><span>SIGN HERE</span>{!locked && strokes.length > 0 && <button onClick={clear}>Clear</button>}</div>
    <svg viewBox="0 0 300 90" role="button" tabIndex={locked ? -1 : 0} aria-disabled={locked} aria-label="Sign to open: draw a small mark, or press Enter or Space." onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cancelCountdown(); onAuthorize(latestStrokes.current) } }} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} onLostPointerCapture={e=>finish(e,true)}>
      {strokes.map((stroke,i)=><polyline key={i} points={stroke.map(p=>p.join(',')).join(' ')} />)}
      {!strokes.length && !locked && <text x="150" y="52" textAnchor="middle">Leave your mark to open</text>}
    </svg>
    {pending && <span className="signature-countdown" aria-hidden="true"/>}
    {locked && <span className="authorization-stamp">SIGNED <span>Y / O</span></span>}
  </div>
}
