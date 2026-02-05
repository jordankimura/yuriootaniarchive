import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Box,
  Text,
  VStack,
  Image,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from './data/projects'
import SummonAnimation from './components/SummonAnimation'
import './components/LandingPage.css'

const MotionBox = motion.create(Box)

// Card type styles - symbols and colors for each project type
const TYPE_STYLES = {
  writing: {
    symbol: '✎',
    color: 'rgba(230, 200, 160, 0.9)',
    glow: 'rgba(230, 200, 160, 0.25)'
  },
  visual: {
    symbol: '◈',
    color: 'rgba(180, 140, 220, 0.9)',
    glow: 'rgba(180, 140, 220, 0.25)'
  },
  video: {
    symbol: '◎',
    color: 'rgba(220, 100, 120, 0.9)',
    glow: 'rgba(220, 100, 120, 0.25)'
  },
  slides: {
    symbol: '▣',
    color: 'rgba(100, 180, 220, 0.9)',
    glow: 'rgba(100, 180, 220, 0.25)'
  },
  code: {
    symbol: '⟨⟩',
    color: 'rgba(120, 220, 180, 0.9)',
    glow: 'rgba(120, 220, 180, 0.25)'
  },
  audio: {
    symbol: '♫',
    color: 'rgba(220, 180, 100, 0.9)',
    glow: 'rgba(220, 180, 100, 0.25)'
  },
  other: {
    symbol: '✧',
    color: 'rgba(168, 212, 230, 0.9)',
    glow: 'rgba(168, 212, 230, 0.25)'
  }
}

// Hook to detect mobile
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

function App() {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('about')
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const [phase, setPhase] = useState('landing') // 'landing' | 'summoning' | 'portfolio'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [summonKey, setSummonKey] = useState(0)
  const [cardVisible, setCardVisible] = useState(false)

  const currentProject = projects[currentIndex]

  // Card reveal after summon animation completes
  useEffect(() => {
    if (phase === 'portfolio' && !cardVisible) {
      const timer = setTimeout(() => setCardVisible(true), 600)
      return () => clearTimeout(timer)
    }
  }, [phase, cardVisible])

  // Stars for circle area
  const stars = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 80,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.4 + 0.3
    }))
  , [])

  // Open button - triggers animation, picks random project
  const handleSummon = () => {
    setCardVisible(false)
    setMobileDetailsOpen(false)  // Reset mobile details
    const randomIndex = Math.floor(Math.random() * projects.length)
    setCurrentIndex(randomIndex)
    setSummonKey(k => k + 1)  // Force fresh animation component
    setPhase('summoning')
    setActiveNav('projects')
    setProjectsExpanded(true)
  }

  // Animation complete callback
  const handleSummonComplete = () => {
    setPhase('portfolio')
  }

  // Nav click handler
  const handleNavClick = (nav) => {
    if (nav === 'projects') {
      setProjectsExpanded(!projectsExpanded)
      setActiveNav('projects')
    } else {
      setProjectsExpanded(false)
      setActiveNav(nav)
      // Reset to landing when clicking About or Contact
      if (nav === 'about' || nav === 'contact') {
        setPhase('landing')
        setCardVisible(false)
      }
    }
  }

  // Direct project select from nav - no animation, instant show
  const handleProjectSelect = (index) => {
    setCurrentIndex(index)
    setPhase('portfolio')
    setCardVisible(true)  // Instant, no delay
    setActiveNav('projects')
  }

  // Panels always visible - expand when viewing project
  const panelsExpanded = phase === 'portfolio' && cardVisible

  // Close mobile menu when selecting something
  const handleMobileNavClick = (nav) => {
    handleNavClick(nav)
    if (nav !== 'projects') setMobileMenuOpen(false)
    // Open details panel for About/Contact on mobile
    if (nav === 'about' || nav === 'contact') {
      setMobileDetailsOpen(true)
    }
  }

  const handleMobileProjectSelect = (index) => {
    handleProjectSelect(index)
    setMobileMenuOpen(false)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#030308',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Mobile header */}
      {isMobile && (
        <header style={{
          height: '56px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          background: 'rgba(10, 15, 25, 0.98)',
          borderBottom: '1px solid rgba(168, 212, 230, 0.1)',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>✧</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Yuri Ootani</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(168, 212, 230, 0.8)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </header>
      )}

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: '56px',
              right: 0,
              bottom: 0,
              width: '280px',
              background: 'rgba(10, 15, 25, 0.98)',
              borderLeft: '1px solid rgba(168, 212, 230, 0.1)',
              zIndex: 45,
              padding: '1rem',
              overflowY: 'auto'
            }}
          >
            <NavButton label="About" icon="○" active={activeNav === 'about'} onClick={() => handleMobileNavClick('about')} />
            <NavButton label="Projects" icon="◈" active={activeNav === 'projects'} onClick={() => handleMobileNavClick('projects')} hasDropdown expanded={projectsExpanded} />

            {projectsExpanded && (
              <div style={{ marginLeft: '1rem', borderLeft: '1px solid rgba(168, 212, 230, 0.15)' }}>
                {projects.map((project, idx) => (
                  <button
                    key={project.id}
                    onClick={() => handleMobileProjectSelect(idx)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem',
                      background: currentIndex === idx && phase === 'portfolio' ? 'rgba(224, 192, 128, 0.15)' : 'transparent',
                      border: 'none',
                      borderLeft: currentIndex === idx && phase === 'portfolio' ? '2px solid rgba(224, 192, 128, 0.7)' : '2px solid transparent',
                      color: currentIndex === idx && phase === 'portfolio' ? '#fff' : 'rgba(168, 212, 230, 0.6)',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}

            <NavButton label="Contact" icon="△" active={activeNav === 'contact'} onClick={() => handleMobileNavClick('contact')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
      {/* Left Navigation Panel - Desktop only */}
      {!isMobile && (
      <motion.nav
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: panelsExpanded ? '280px' : (projectsExpanded ? '240px' : '200px'),
          minWidth: panelsExpanded ? '280px' : (projectsExpanded ? '240px' : '200px'),
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(168, 212, 230, 0.1)',
          background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.95) 0%, rgba(5, 8, 15, 0.98) 100%)',
          zIndex: 20,
          transition: 'width 0.4s ease, min-width 0.4s ease'
        }}
      >
            {/* Branding */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(168, 212, 230, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(107, 168, 194, 0.3), rgba(224, 192, 128, 0.25))',
                  border: '1px solid rgba(168, 212, 230, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: '0 0 20px rgba(107, 168, 194, 0.2)'
                }}>
                  ✧
                </div>
                <div>
                  <div style={{
                    color: 'rgba(255,255,255,1)',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    Yuri Ootani
                  </div>
                  <div style={{
                    color: 'rgba(224, 192, 128, 0.7)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase'
                  }}>
                    Archive
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Items */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* About */}
              <NavButton
                label="About"
                icon="○"
                active={activeNav === 'about'}
                onClick={() => handleNavClick('about')}
              />

              {/* Projects with dropdown */}
              <NavButton
                label="Projects"
                icon="◈"
                active={activeNav === 'projects'}
                onClick={() => handleNavClick('projects')}
                hasDropdown
                expanded={projectsExpanded}
              />

              {/* Projects dropdown list - folder/finder style */}
              <AnimatePresence>
                {(projectsExpanded || panelsExpanded) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      overflow: 'hidden',
                      marginBottom: '0.5rem',
                      marginLeft: '0.5rem',
                      borderLeft: '1px solid rgba(168, 212, 230, 0.15)',
                      background: panelsExpanded ? 'rgba(0,0,0,0.2)' : 'transparent',
                      borderRadius: panelsExpanded ? '0 8px 8px 0' : '0'
                    }}
                  >
                    {panelsExpanded && (
                      <div style={{
                        padding: '0.75rem 1rem 0.5rem',
                        borderBottom: '1px solid rgba(168, 212, 230, 0.1)',
                        marginBottom: '0.25rem'
                      }}>
                        <Text fontSize="xs" color="rgba(168, 212, 230, 0.5)" textTransform="uppercase" letterSpacing="0.1em">
                          All Projects
                        </Text>
                      </div>
                    )}
                    {projects.map((project, idx) => {
                      const isActive = currentIndex === idx && phase === 'portfolio'
                      return (
                        <motion.button
                          key={project.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => handleProjectSelect(idx)}
                          style={{
                            width: '100%',
                            padding: panelsExpanded ? '0.6rem 1rem' : '0.5rem 1rem 0.5rem 1.5rem',
                            background: isActive
                              ? 'rgba(224, 192, 128, 0.15)'
                              : 'transparent',
                            border: 'none',
                            borderLeft: isActive
                              ? '2px solid rgba(224, 192, 128, 0.7)'
                              : '2px solid transparent',
                            color: isActive
                              ? 'rgba(255,255,255,1)'
                              : 'rgba(168, 212, 230, 0.6)',
                            fontSize: panelsExpanded ? '0.75rem' : '0.7rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                              e.currentTarget.style.background = 'rgba(107, 168, 194, 0.1)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'rgba(168, 212, 230, 0.6)'
                              e.currentTarget.style.background = 'transparent'
                            }
                          }}
                        >
                          <span style={{
                            fontSize: '0.6rem',
                            opacity: isActive ? 1 : 0.4,
                            color: isActive ? 'rgba(224, 192, 128, 0.9)' : 'inherit'
                          }}>
                            {isActive ? '◆' : '◇'}
                          </span>
                          <span style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {project.name}
                          </span>
                          {panelsExpanded && (
                            <span style={{
                              fontSize: '0.6rem',
                              color: 'rgba(168, 212, 230, 0.4)',
                              textTransform: 'uppercase'
                            }}>
                              {project.type}
                            </span>
                          )}
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contact */}
              <NavButton
                label="Contact"
                icon="△"
                active={activeNav === 'contact'}
                onClick={() => handleNavClick('contact')}
              />
            </div>

            {/* Bottom decoration */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(168, 212, 230, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
                <div style={{ width: '4px', height: '4px', background: 'rgba(224, 192, 128, 0.5)', borderRadius: '50%' }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(168, 212, 230, 0.15), transparent)' }} />
              </div>
            </div>
      </motion.nav>
      )}

      {/* Center - Letterboxed Summoning Circle */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '2rem'
      }}>
        {/* Ornate frame container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '700px',
            aspectRatio: '1',
            maxHeight: 'calc(100vh - 4rem)'
          }}
        >
          {/* Ornate corners */}
          <OrnateCorner position="top-left" />
          <OrnateCorner position="top-right" />
          <OrnateCorner position="bottom-left" />
          <OrnateCorner position="bottom-right" />

          {/* Edge lines */}
          <div style={{ position: 'absolute', top: '20px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168, 212, 230, 0.3), rgba(224, 192, 128, 0.2), rgba(168, 212, 230, 0.3), transparent)' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(168, 212, 230, 0.3), rgba(224, 192, 128, 0.2), rgba(168, 212, 230, 0.3), transparent)' }} />
          <div style={{ position: 'absolute', left: '20px', top: '40px', bottom: '40px', width: '1px', background: 'linear-gradient(180deg, transparent, rgba(168, 212, 230, 0.3), rgba(224, 192, 128, 0.2), rgba(168, 212, 230, 0.3), transparent)' }} />
          <div style={{ position: 'absolute', right: '20px', top: '40px', bottom: '40px', width: '1px', background: 'linear-gradient(180deg, transparent, rgba(168, 212, 230, 0.3), rgba(224, 192, 128, 0.2), rgba(168, 212, 230, 0.3), transparent)' }} />

          {/* Inner circle area */}
          <div style={{
            position: 'absolute',
            inset: '30px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#050510'
          }}>
            {/* Summon Animation - persistent, triggered by summonKey */}
            <SummonAnimation
              triggerCount={summonKey}
              onComplete={handleSummonComplete}
            />

            {/* Stars */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
              {stars.map((star) => (
                <div
                  key={star.id}
                  className="star-twinkle"
                  style={{
                    position: 'absolute',
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: `0 0 ${star.size * 2}px rgba(168, 212, 230, 0.6)`,
                    animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                    opacity: star.opacity,
                  }}
                />
              ))}
            </div>

            {/* Open button - hidden only during animation */}
            <AnimatePresence>
              {phase !== 'summoning' && (
                <motion.div
                  key="open-button-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 25,
                    padding: '1.5rem 0',
                    background: 'linear-gradient(to top, rgba(5, 5, 16, 0.95) 0%, rgba(5, 5, 16, 0.8) 60%, transparent 100%)'
                  }}
                >
                  <motion.button
                    onClick={handleSummon}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 35px rgba(224, 192, 128, 0.5), 0 8px 25px rgba(0, 0, 0, 0.4)'
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '0.9rem 2.2rem',
                      background: 'linear-gradient(135deg, rgba(224, 192, 128, 0.9) 0%, rgba(180, 140, 70, 0.95) 100%)',
                      border: '1px solid rgba(220, 190, 120, 0.6)',
                      borderRadius: '6px',
                      color: '#0a0f1a',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 0 25px rgba(224, 192, 128, 0.3), 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    ✧ Open ✧
                  </motion.button>

                  {phase === 'landing' && (
                    <motion.p
                      style={{
                        color: 'rgba(168, 212, 230, 0.7)',
                        marginTop: '0.75rem',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.8, 0.8, 0.8, 0] }}
                      transition={{ duration: 4, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      Reveal a project
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Portfolio card overlay - desktop only, mobile card is outside container */}
            {!isMobile && (
            <AnimatePresence>
              {phase === 'portfolio' && cardVisible && (
                <motion.div
                  key="portfolio-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 15,
                    paddingBottom: '100px',
                    pointerEvents: 'none'
                  }}
                >
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    w="250px"
                    h="350px"
                    bg="linear-gradient(160deg, rgba(15, 20, 35, 0.98) 0%, rgba(8, 12, 24, 0.99) 100%)"
                    borderRadius="xl"
                    border="1px solid rgba(168, 212, 230, 0.25)"
                    boxShadow="0 15px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 212, 230, 0.15)"
                    overflow="hidden"
                    style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}
                  >
                    {/* Card art area */}
                    <Box
                      flex="1"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Background pattern */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 30%, ${TYPE_STYLES[currentProject.type]?.glow || 'rgba(168, 212, 230, 0.15)'} 0%, transparent 60%)`,
                        opacity: 0.6
                      }} />

                      {/* Type symbol */}
                      <div style={{
                        fontSize: '5rem',
                        color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.8)',
                        textShadow: `0 0 40px ${TYPE_STYLES[currentProject.type]?.glow || 'rgba(168, 212, 230, 0.4)'}`,
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
                      </div>

                      {/* Corner decorations */}
                      <div style={{ position: 'absolute', top: 12, left: 12, fontSize: '0.9rem', color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.6)', opacity: 0.7 }}>
                        {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
                      </div>
                      <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '0.9rem', color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.6)', opacity: 0.7, transform: 'rotate(180deg)' }}>
                        {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
                      </div>
                    </Box>

                    {/* Card info */}
                    <VStack
                      p={4}
                      align="stretch"
                      spacing={1}
                      flex="0 0 auto"
                      bg="rgba(0,0,0,0.3)"
                      borderTop="1px solid rgba(168, 212, 230, 0.15)"
                    >
                      <Text fontSize="md" fontWeight="bold" color="white" noOfLines={1}>{currentProject.name}</Text>
                      <Text fontSize="xs" color={TYPE_STYLES[currentProject.type]?.color || 'rgba(224, 192, 128, 0.8)'} textTransform="uppercase" letterSpacing="0.1em">
                        {currentProject.type}
                      </Text>
                    </VStack>
                  </MotionBox>

                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile card - rendered outside the inner circle container */}
      {isMobile && phase === 'portfolio' && cardVisible && (
        <motion.div
          key="mobile-portfolio-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: mobileDetailsOpen ? 0 : 0,
            top: mobileDetailsOpen ? '8vh' : '28%'
          }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '28%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: 'translateY(-50%)',
            zIndex: 30,
            pointerEvents: 'none'
          }}
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            w="200px"
            h="280px"
            bg="linear-gradient(160deg, rgba(15, 20, 35, 0.98) 0%, rgba(8, 12, 24, 0.99) 100%)"
            borderRadius="xl"
            border="1px solid rgba(168, 212, 230, 0.25)"
            boxShadow="0 15px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 212, 230, 0.15)"
            overflow="hidden"
            style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}
          >
            {/* Card art area */}
            <Box
              flex="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
            >
              {/* Background pattern */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 30%, ${TYPE_STYLES[currentProject.type]?.glow || 'rgba(168, 212, 230, 0.15)'} 0%, transparent 60%)`,
                opacity: 0.6
              }} />

              {/* Type symbol */}
              <div style={{
                fontSize: '4rem',
                color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.8)',
                textShadow: `0 0 40px ${TYPE_STYLES[currentProject.type]?.glow || 'rgba(168, 212, 230, 0.4)'}`,
                position: 'relative',
                zIndex: 1
              }}>
                {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
              </div>

              {/* Corner decorations */}
              <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.8rem', color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.6)', opacity: 0.7 }}>
                {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
              </div>
              <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: '0.8rem', color: TYPE_STYLES[currentProject.type]?.color || 'rgba(168, 212, 230, 0.6)', opacity: 0.7, transform: 'rotate(180deg)' }}>
                {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
              </div>
            </Box>

            {/* Card info */}
            <VStack
              p={3}
              align="stretch"
              spacing={1}
              flex="0 0 auto"
              bg="rgba(0,0,0,0.3)"
              borderTop="1px solid rgba(168, 212, 230, 0.15)"
            >
              <Text fontSize="sm" fontWeight="bold" color="white" noOfLines={1}>{currentProject.name}</Text>
              <Text fontSize="xs" color={TYPE_STYLES[currentProject.type]?.color || 'rgba(224, 192, 128, 0.8)'} textTransform="uppercase" letterSpacing="0.1em">
                {currentProject.type}
              </Text>
            </VStack>
          </MotionBox>
        </motion.div>
      )}

      {/* Mobile: View Details button when card is showing */}
      {isMobile && phase === 'portfolio' && cardVisible && !mobileDetailsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 35
          }}
        >
          <button
            onClick={() => setMobileDetailsOpen(true)}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'transparent',
              border: '1px solid rgba(168, 212, 230, 0.4)',
              borderRadius: '6px',
              color: 'rgba(168, 212, 230, 0.9)',
              fontSize: '0.7rem',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s'
            }}
          >
            View Details ↓
          </button>
        </motion.div>
      )}

      {/* Mobile slide-up panel for project details, About, and Contact */}
      {isMobile && (
        <AnimatePresence>
          {mobileDetailsOpen && (
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: activeNav === 'about' || activeNav === 'contact' ? '60vh' : '85vh',
                background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.99) 0%, rgba(5, 8, 15, 1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 40,
                overflow: 'hidden',
                borderRadius: '16px 16px 0 0',
                borderTop: '1px solid rgba(168, 212, 230, 0.2)'
              }}
            >
              {/* Drag handle / close button */}
              <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(168, 212, 230, 0.3)', borderRadius: '2px' }} />
                <button
                  onClick={() => setMobileDetailsOpen(false)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.3)',
                    border: 'none',
                    color: 'rgba(168, 212, 230, 0.8)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* About content */}
              {activeNav === 'about' && (
                <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
                  <Text
                    color="rgba(255,255,255,1)"
                    fontSize="xs"
                    fontWeight="600"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    mb={3}
                    pb={2}
                    borderBottom="1px solid rgba(168, 212, 230, 0.15)"
                  >
                    About
                  </Text>
                  <Text color="rgba(255,255,255,0.85)" fontSize="md" fontWeight="600" mb={3}>
                    Yuri Ootani
                  </Text>
                  <Text color="rgba(255,255,255,0.7)" fontSize="sm" lineHeight="tall" mb={4}>
                    Creative technologist and recovering engineer. I make things that probably shouldn't exist.
                  </Text>
                  <Text color="rgba(168, 212, 230, 0.6)" fontSize="xs" lineHeight="tall" mb={3}>
                    This is the archive — a graveyard of half-finished experiments, abandoned side projects, and the occasional thing that actually worked.
                  </Text>
                  <Text color="rgba(168, 212, 230, 0.6)" fontSize="xs" lineHeight="tall" mb={4}>
                    Click <span style={{ color: 'rgba(224, 192, 128, 0.9)' }}>Open</span> to summon a random project, or browse the list.
                  </Text>
                  <Text color="rgba(168, 212, 230, 0.4)" fontSize="xs" fontStyle="italic">
                    "most of these started as 'what if' and ended up here"
                  </Text>
                </div>
              )}

              {/* Contact content */}
              {activeNav === 'contact' && (
                <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
                  <Text
                    color="rgba(255,255,255,1)"
                    fontSize="xs"
                    fontWeight="600"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    mb={3}
                    pb={2}
                    borderBottom="1px solid rgba(168, 212, 230, 0.15)"
                  >
                    Contact
                  </Text>
                  <Text color="rgba(255,255,255,0.7)" fontSize="sm" lineHeight="tall" mb={4}>
                    Want to collaborate, chat, or roast my projects? I'm around.
                  </Text>
                  <VStack spacing={3} align="stretch" mb={4}>
                    <ContactLink label="Twitter" value="@yuriootaniqbis" />
                    <ContactLink label="Email" value="yuriootani@gmail.com" />
                  </VStack>
                  <Text color="rgba(168, 212, 230, 0.4)" fontSize="xs">
                    Response time varies wildly.
                  </Text>
                </div>
              )}

              {/* Project details content */}
              {activeNav === 'projects' && (
                <>
                  {/* Banner image - matches 400x280 aspect ratio */}
                  <div style={{
                    height: '280px',
                    flexShrink: 0,
                    background: (currentProject.banner || currentProject.thumbnail)
                      ? `rgba(5, 8, 15, 1) url(${currentProject.banner || currentProject.thumbnail}) center/contain no-repeat`
                      : 'linear-gradient(135deg, rgba(107, 168, 194, 0.2), rgba(140, 120, 180, 0.15))',
                    position: 'relative'
                  }}>
                    {!(currentProject.banner || currentProject.thumbnail) && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: 'rgba(168, 212, 230, 0.3)'
                      }}>
                        {TYPE_STYLES[currentProject.type]?.symbol || '✧'}
                      </div>
                    )}
                    {/* Gradient fade */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40px',
                      background: 'linear-gradient(to top, rgba(10, 15, 25, 1), transparent)'
                    }} />
                  </div>

                  {/* Scrollable content */}
                  <div style={{ padding: '1rem 1.25rem', overflow: 'auto', flex: 1 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <Text color="#fff" fontSize="md" fontWeight="700" style={{ flex: 1 }}>{currentProject.name}</Text>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        background: 'rgba(224, 192, 128, 0.15)',
                        border: '1px solid rgba(224, 192, 128, 0.3)',
                        borderRadius: '4px',
                        color: 'rgba(224, 192, 128, 0.9)',
                        fontSize: '0.6rem',
                        textTransform: 'uppercase',
                        marginLeft: '0.5rem',
                        flexShrink: 0
                      }}>
                        {currentProject.type}
                      </span>
                    </div>

                    {/* Link button */}
                    {currentProject.link && (
                      <a
                        href={currentProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.8rem',
                          background: 'linear-gradient(135deg, rgba(224, 192, 128, 0.9) 0%, rgba(180, 140, 70, 0.95) 100%)',
                          borderRadius: '5px',
                          color: '#0a0f1a',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          marginBottom: '1rem'
                        }}
                      >
                        View Project →
                      </a>
                    )}

                    {/* Description */}
                    <Text color="rgba(255,255,255,0.7)" fontSize="xs" lineHeight="1.7" whiteSpace="pre-line">
                      {currentProject.longDescription || currentProject.description}
                    </Text>
                  </div>
                </>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Right Panel - Desktop only */}
      {!isMobile && (
      <motion.aside
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: panelsExpanded ? '480px' : '340px',
          minWidth: panelsExpanded ? '480px' : '340px',
          padding: panelsExpanded ? '0' : '2rem 1.5rem',
          borderLeft: '1px solid rgba(168, 212, 230, 0.1)',
          background: 'linear-gradient(180deg, rgba(10, 15, 25, 0.95) 0%, rgba(5, 8, 15, 0.98) 100%)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          transition: 'width 0.4s ease, min-width 0.4s ease, padding 0.4s ease',
          overflow: 'hidden'
        }}
      >
            {/* Expanded Project View with Banner */}
            <AnimatePresence mode="wait">
              {panelsExpanded ? (
                <motion.div
                  key="expanded-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  {/* Banner Image Area - matches 400x280 aspect ratio */}
                  <div style={{
                    height: '280px',
                    background: (currentProject.banner || currentProject.thumbnail)
                      ? `url(${currentProject.banner || currentProject.thumbnail}) center/cover`
                      : 'linear-gradient(135deg, rgba(107, 168, 194, 0.2), rgba(140, 120, 180, 0.15), rgba(224, 192, 128, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(168, 212, 230, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {!(currentProject.banner || currentProject.thumbnail) && (
                      <div style={{
                        fontSize: '4rem',
                        opacity: 0.2,
                        color: 'rgba(168, 212, 230, 0.5)'
                      }}>
                        ✧
                      </div>
                    )}
                    {/* Gradient overlay for readability */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(to top, rgba(10, 15, 25, 0.9), transparent)'
                    }} />
                  </div>

                  {/* Project Details */}
                  <div style={{
                    padding: '1.5rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto'
                  }}>
                    {/* Header with type badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <Text
                        color="rgba(255,255,255,1)"
                        fontSize="xl"
                        fontWeight="700"
                        lineHeight="1.2"
                        style={{ flex: 1, paddingRight: '0.5rem' }}
                      >
                        {currentProject.name}
                      </Text>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(224, 192, 128, 0.15)',
                        border: '1px solid rgba(224, 192, 128, 0.3)',
                        borderRadius: '4px',
                        color: 'rgba(224, 192, 128, 0.9)',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap'
                      }}>
                        {currentProject.type}
                      </span>
                    </div>

                    {/* Link button - right under title */}
                    {currentProject.link && (
                      <a
                        href={currentProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem 0.9rem',
                          background: 'linear-gradient(135deg, rgba(224, 192, 128, 0.9) 0%, rgba(180, 140, 70, 0.95) 100%)',
                          border: '1px solid rgba(220, 190, 120, 0.6)',
                          borderRadius: '5px',
                          color: '#0a0f1a',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textDecoration: 'none',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          boxShadow: '0 0 15px rgba(224, 192, 128, 0.2)',
                          marginBottom: '1rem',
                          width: 'fit-content'
                        }}
                      >
                        <span>View Project</span>
                        <span style={{ fontSize: '0.8rem' }}>→</span>
                      </a>
                    )}

                    {/* Description */}
                    <Text
                      color="rgba(255,255,255,0.7)"
                      fontSize="sm"
                      lineHeight="1.7"
                      whiteSpace="pre-line"
                    >
                      {currentProject.longDescription || currentProject.description}
                    </Text>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`default-view-${activeNav}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  {activeNav === 'about' && (
                    <>
                      <Text
                        color="rgba(255,255,255,1)"
                        fontSize="xs"
                        fontWeight="600"
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        mb={3}
                        pb={2}
                        borderBottom="1px solid rgba(168, 212, 230, 0.15)"
                      >
                        About
                      </Text>
                      <Text color="rgba(255,255,255,0.85)" fontSize="md" fontWeight="600" mb={3}>
                        Yuri Ootani
                      </Text>
                      <Text color="rgba(255,255,255,0.7)" fontSize="sm" lineHeight="tall" mb={4}>
                        Creative technologist and recovering engineer. I make things that probably shouldn't exist.
                      </Text>
                      <Text color="rgba(168, 212, 230, 0.6)" fontSize="xs" lineHeight="tall" mb={3}>
                        This is the archive — a graveyard of half-finished experiments, abandoned side projects, and the occasional thing that actually worked.
                      </Text>
                      <Text color="rgba(168, 212, 230, 0.6)" fontSize="xs" lineHeight="tall" mb={4}>
                        Click <span style={{ color: 'rgba(224, 192, 128, 0.9)' }}>Open</span> to summon a random project, or browse the list.
                      </Text>
                      <div style={{ flex: 1 }} />
                      <Text color="rgba(168, 212, 230, 0.4)" fontSize="xs" fontStyle="italic">
                        "most of these started as 'what if' and ended up here"
                      </Text>
                    </>
                  )}

                  {activeNav === 'contact' && (
                    <>
                      <Text
                        color="rgba(255,255,255,1)"
                        fontSize="xs"
                        fontWeight="600"
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        mb={3}
                        pb={2}
                        borderBottom="1px solid rgba(168, 212, 230, 0.15)"
                      >
                        Contact
                      </Text>
                      <Text color="rgba(255,255,255,0.7)" fontSize="sm" lineHeight="tall" mb={4}>
                        Want to collaborate, chat, or roast my projects? I'm around.
                      </Text>
                      <VStack spacing={3} align="stretch" mb={4}>
                        <ContactLink label="Twitter" value="@yuriootaniqbis" />
                        <ContactLink label="Email" value="yuriootani@gmail.com" />
                      </VStack>
                      <div style={{ flex: 1 }} />
                      <Text color="rgba(168, 212, 230, 0.4)" fontSize="xs">
                        Response time varies wildly.
                      </Text>
                    </>
                  )}

                  {activeNav === 'projects' && !panelsExpanded && (
                    <>
                      <Text
                        color="rgba(255,255,255,1)"
                        fontSize="xs"
                        fontWeight="600"
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        mb={3}
                        pb={2}
                        borderBottom="1px solid rgba(168, 212, 230, 0.15)"
                      >
                        Projects
                      </Text>
                      <Text color="rgba(255,255,255,0.7)" fontSize="sm" lineHeight="tall" mb={3}>
                        Browse the archive or click Open to reveal a random project.
                      </Text>
                      <Text color="rgba(168, 212, 230, 0.5)" fontSize="xs" lineHeight="tall">
                        {projects.length} projects in the collection.
                      </Text>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
      </motion.aside>
      )}
      </div>

      {/* Footer - Desktop only */}
      {!isMobile && (
      <footer style={{
        height: '36px',
        minHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'rgba(5, 8, 15, 0.98)',
        borderTop: '1px solid rgba(168, 212, 230, 0.08)',
        color: 'rgba(168, 212, 230, 0.4)',
        fontSize: '0.65rem',
        letterSpacing: '0.08em'
      }}>
        <span>yuri ootani</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{projects.length} projects</span>
          <span style={{ opacity: 0.5 }}>✧</span>
          <span>2026</span>
        </span>
      </footer>
      )}
    </div>
  )
}

// Nav button component
function NavButton({ label, icon, active, onClick, hasDropdown, expanded }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ background: 'linear-gradient(90deg, rgba(107, 168, 194, 0.1), transparent)' }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        marginBottom: '0.25rem',
        background: active
          ? 'linear-gradient(90deg, rgba(107, 168, 194, 0.15), transparent)'
          : 'transparent',
        border: 'none',
        borderLeft: active
          ? '2px solid rgba(224, 192, 128, 0.8)'
          : '2px solid transparent',
        color: active
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(168, 212, 230, 0.6)',
        fontSize: '0.8rem',
        fontWeight: active ? '600' : '400',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        textAlign: 'left'
      }}
    >
      <span style={{
        fontSize: '0.75rem',
        opacity: active ? 1 : 0.5,
        color: active ? 'rgba(224, 192, 128, 0.9)' : 'inherit'
      }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {hasDropdown && (
        <span style={{
          fontSize: '0.6rem',
          opacity: 0.5,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      )}
    </motion.button>
  )
}

// Ornate corner component
function OrnateCorner({ position }) {
  const rotations = {
    'top-left': 0,
    'top-right': 90,
    'bottom-right': 180,
    'bottom-left': 270
  }
  const positions = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-right': { bottom: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 }
  }

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      style={{
        position: 'absolute',
        ...positions[position],
        transform: `rotate(${rotations[position]}deg)`,
        opacity: 0.6
      }}
    >
      <path d="M 0 50 L 0 0 L 50 0" stroke="rgba(168, 212, 230, 0.5)" strokeWidth="1" fill="none" />
      <path d="M 0 40 L 0 5 L 5 5 L 5 0 L 40 0" stroke="rgba(224, 192, 128, 0.4)" strokeWidth="0.5" fill="none" />
      <circle cx="0" cy="0" r="3" fill="rgba(224, 192, 128, 0.6)" />
      <circle cx="0" cy="0" r="6" stroke="rgba(168, 212, 230, 0.3)" strokeWidth="0.5" fill="none" />
      <circle cx="15" cy="0" r="1.5" fill="rgba(168, 212, 230, 0.4)" />
      <circle cx="30" cy="0" r="1" fill="rgba(168, 212, 230, 0.3)" />
      <circle cx="0" cy="15" r="1.5" fill="rgba(168, 212, 230, 0.4)" />
      <circle cx="0" cy="30" r="1" fill="rgba(168, 212, 230, 0.3)" />
    </svg>
  )
}

// Contact link component
function ContactLink({ label, value }) {
  return (
    <div style={{ padding: '0.4rem 0' }}>
      <Text color="rgba(168, 212, 230, 0.5)" fontSize="xs" textTransform="uppercase" letterSpacing="0.1em">
        {label}
      </Text>
      <Text color="rgba(255,255,255,0.8)" fontSize="sm">
        {value}
      </Text>
    </div>
  )
}

export default App
