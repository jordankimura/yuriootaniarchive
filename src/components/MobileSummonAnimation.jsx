import { useEffect, useRef, useState } from 'react'

// Pure CSS summon animation for mobile - GPU accelerated, smooth performance
export default function MobileSummonAnimation({ triggerCount = 0, onComplete }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const prevTriggerRef = useRef(0)

  useEffect(() => {
    if (triggerCount > prevTriggerRef.current) {
      prevTriggerRef.current = triggerCount
      setIsAnimating(true)

      const timer = setTimeout(() => {
        setIsAnimating(false)
        if (onComplete) onComplete()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [triggerCount, onComplete])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#050510',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes summon-buildup {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          70% { transform: translate(-50%, -50%) rotate(1080deg) scale(1.2); }
          85% { transform: translate(-50%, -50%) rotate(1080deg) scale(0.8); }
          100% { transform: translate(-50%, -50%) rotate(1170deg) scale(1); }
        }
        @keyframes summon-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes summon-pulse-wave {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}</style>

      {/* Center glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(107,168,194,0.36) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        animation: 'glow-pulse 2s ease-in-out infinite',
        boxShadow: '0 0 25px rgba(107,168,194,0.24), 0 0 50px rgba(107,168,194,0.12)',
        zIndex: 5
      }} />

      {/* Ring 1 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '2px solid rgba(107, 168, 194, 0.6)',
        boxShadow: '0 0 10px rgba(107, 168, 194, 0.3)',
        animation: isAnimating
          ? 'summon-buildup 3.5s ease-in-out forwards'
          : 'spin 8s linear infinite',
        zIndex: 3
      }} />

      {/* Ring 2 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        border: '1px solid rgba(201, 169, 97, 0.5)',
        boxShadow: '0 0 10px rgba(201, 169, 97, 0.3)',
        animation: isAnimating
          ? 'summon-buildup 3.5s ease-in-out forwards'
          : 'spin-reverse 10s linear infinite',
        animationDelay: isAnimating ? '0.1s' : '0s',
        zIndex: 3
      }} />

      {/* Ring 3 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        border: '1px solid rgba(107, 168, 194, 0.4)',
        boxShadow: '0 0 10px rgba(107, 168, 194, 0.2)',
        animation: isAnimating
          ? 'summon-buildup 3.5s ease-in-out forwards'
          : 'spin 12s linear infinite',
        animationDelay: isAnimating ? '0.2s' : '0s',
        zIndex: 3
      }} />

      {/* Runes */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '200px',
        height: '200px',
        transform: 'translate(-50%, -50%)',
        animation: isAnimating
          ? 'summon-buildup 3.5s ease-in-out forwards'
          : 'spin 15s linear infinite',
        zIndex: 2
      }}>
        {['ᚠ', 'ᚦ', 'ᚱ', 'ᚺ', 'ᛁ', 'ᛊ', 'ᛗ', 'ᛟ'].map((rune, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-100px)`,
              color: i % 2 === 0 ? 'rgba(107, 168, 194, 0.7)' : 'rgba(201, 169, 97, 0.7)',
              fontSize: '14px',
              textShadow: i % 2 === 0
                ? '0 0 8px rgba(107, 168, 194, 0.5)'
                : '0 0 8px rgba(201, 169, 97, 0.5)'
            }}
          >
            {rune}
          </span>
        ))}
      </div>

      {/* Flash overlay - only during summon */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(107,168,194,0.5) 30%, transparent 60%)',
          animation: 'summon-flash 0.8s ease-out 3s forwards',
          zIndex: 10,
          pointerEvents: 'none'
        }} />
      )}

      {/* Pulse wave - only during summon */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '4px solid rgba(107, 168, 194, 0.8)',
          boxShadow: '0 0 20px rgba(107, 168, 194, 0.6)',
          transform: 'translate(-50%, -50%) scale(0)',
          animation: 'summon-pulse-wave 0.6s ease-out 3.2s forwards',
          zIndex: 9,
          pointerEvents: 'none'
        }} />
      )}
    </div>
  )
}
