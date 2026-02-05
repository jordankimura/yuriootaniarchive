import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import './LandingPage.css'

export default function LandingPage({ onSummon }) {
  const [stars, setStars] = useState([])
  const [isHovering, setIsHovering] = useState(false)

  // Generate random stars on mount
  useEffect(() => {
    const generateStars = () => {
      return Array.from({ length: 300 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 3 + 2, // 1x speed
        delay: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.3
      }))
    }
    setStars(generateStars())
  }, [])

  return (
    <div className="landing-page">
      {/* Cosmic Background */}
      <div className="cosmic-bg" />

      {/* Animated Stars */}
      <div className="stars-container">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 1.5, star.opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Summoning Circle - Background Layer */}
      <motion.div
        className="summon-circle-outer"
        animate={{
          rotate: 360,
          opacity: [0.3, 0.8, 0.3], // 80% glow intensity
        }}
        transition={{
          rotate: {
            duration: 14, // 1x speed
            repeat: Infinity,
            ease: 'linear',
          },
          opacity: {
            duration: 3, // 1x speed
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Inner Summoning Circle */}
      <motion.div
        className="summon-circle-inner"
        animate={{
          rotate: -360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 15, // 1x speed
            repeat: Infinity,
            ease: 'linear',
          },
          scale: {
            duration: 2, // 1x speed
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Energy Particles */}
      <div className="energy-particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="energy-particle"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 400],
              y: [0, (Math.random() - 0.5) * 400],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2, // 1x speed
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Central Content */}
      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }} // 1x speed
      >
        {/* Summon Button - centered with circles */}
        <motion.button
          className="summon-button"
          onClick={onSummon}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: isHovering
              ? '0 0 60px rgba(79, 179, 212, 0.5), 0 0 120px rgba(79, 179, 212, 0.25), inset 0 0 40px rgba(125, 211, 252, 0.25)' // 50% glow
              : '0 0 40px rgba(79, 179, 212, 0.5), 0 0 80px rgba(79, 179, 212, 0.25), inset 0 0 20px rgba(125, 211, 252, 0.2)'
          }}
          transition={{
            duration: 1.5, // 1x speed
            delay: 1.2, // 1x speed
            boxShadow: { duration: 0.3 }
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="button-glow"
            animate={{
              opacity: [0.4, 0.5, 0.4], // 50% glow intensity
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5, // 1x speed
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="button-text">open</span>
          <motion.div
            className="button-shine"
            animate={{
              x: ['-200%', '300%'], // Extended to go all the way through
            }}
            transition={{
              duration: 2, // 1x speed
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1, // 1x speed
            }}
          />
        </motion.button>

        {/* Hint Text */}
        <motion.p
          className="hint-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{
            duration: 3, // 1x speed
            delay: 2, // 1x speed
            repeat: Infinity,
            repeatDelay: 2, // 1x speed
          }}
        >
          Click to see projects
        </motion.p>
      </motion.div>

      {/* Radial Light Rays */}
      <div className="light-rays">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="light-ray"
            style={{
              transform: `rotate(${i * 20}deg)`, // 360 / 18 = 20 degrees
            }}
            animate={{
              opacity: [0.4, 0, 0, 0.6, 0.4], // Start on, turn off, pulse on
            }}
            transition={{
              duration: 5,
              delay: i * 0.12, // Stagger the turn-off
              times: [0, 0.25, 0.6, 0.75, 1], // Timing for each opacity keyframe
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bottom Decorative Elements */}
      <motion.div
        className="bottom-decoration"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }} // 1x speed
      >
        <div className="deco-line" />
        <div className="deco-gem" />
        <div className="deco-line" />
      </motion.div>
    </div>
  )
}
