import { useId } from 'react'
import YuriDoodle from './YuriDoodle'

export function EnvelopeDoodles() {
  return <div className="envelope-doodles" aria-label="Little doodles of Yuri waving and Borg playing">
    <svg className="doodle-yuri" viewBox="0 0 120 125" role="img" aria-label="Yuri waving hello"><g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path fill="currentColor" d="M25 67Q17 40 27 23Q41 10 61 16Q81 18 83 42L85 68L71 72L29 72Z"/>
      <path fill="var(--ivory)" d="M30 40L34 30L43 41L48 28L55 41L62 29L72 42L77 36L76 59Q68 75 51 70Q34 68 30 51Z"/>
      <path fill="none" d="M38 48l7-2M59 47l7 2M45 61q8 6 15-1M40 72L32 95L34 113M65 73L77 84L95 63M72 90L95 73M40 75L51 85L61 75M51 85L52 109M35 96L68 98L70 114M95 73L99 61L104 58L99 55L98 49L94 53L90 49L89 57L86 55L85 61L95 63M107 44l4-5M112 53l5-1"/>
      <ellipse cx="44" cy="52" rx="2" ry="4" fill="currentColor"/><ellipse cx="65" cy="53" rx="2" ry="4" fill="currentColor"/>
    </g></svg>
    <svg className="doodle-borg-flying" viewBox="0 0 120 110" role="img" aria-label="Borg fluttering around a star"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M35 71Q13 62 9 24Q28 35 40 56M84 72Q105 58 113 21Q90 30 79 56M31 72Q29 48 58 48Q87 46 89 72Q58 88 31 72ZM33 77Q58 89 87 77"/>
      <ellipse cx="43" cy="65" rx="4" ry="7"/><ellipse cx="76" cy="64" rx="4" ry="7"/><path d="M21 84l-7 5M27 94l-6 5M58 14l3 8 9 2-8 4-2 9-4-9-8-2 8-4Z"/>
    </g></svg>

    <YuriDoodle className="doodle-original"/>
    <svg className="margin-scribbles" viewBox="0 0 430 600" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M333 156C317 140 339 133 344 147C354 130 374 146 344 167Z"/>
      <path d="M180 139c-15-9-28 12-14 20s30-8 18-17-20 4-12 9"/>
      <path d="M345 260c30-30 42 20 16 25s-27-31-8-27 18 38-3 35"/>
      <path d="M48 350c-16-17-21 7-6 7-19 12 2 27 6 11 9 20 25 0 10-7 21-1 7-25-4-11 6-23-19-19-6 0Z M48 360l6-2M51 375q-9 18-2 32M48 393q-15-14-19-3 7 9 19 3"/>
      <path d="M278 180l7 3-7 4 5 8-9-4-5 7 1-9-9-2 9-3 1-9Z"/>
      <path d="M318 550l9-13M326 554l11-16M314 544l22 5M317 551l22 5"/>
      <path d="M66 557c-10-23 6-24 7-7s-10 20-1 5 16-9 10 1 11 5 11-3 9-6 8 1 11 3 21-3"/>
      <path d="M369 390l5 5M378 381l6 2M364 403l3 5"/>
    </g></svg>
  </div>
}

export function CharacterPin() {
  const id = useId().replace(/:/g, '')
  return <div className="character-pin metal-pin"><svg viewBox="0 0 160 160" role="img" aria-label="Silver enamel pin of Yuri wearing Borg on her head">
    <defs><linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".2" stopColor="#a7a3b0"/><stop offset=".4" stopColor="#fff"/><stop offset=".55" stopColor="#777281"/><stop offset=".72" stopColor="#eeeaf2"/><stop offset="1" stopColor="#98919e"/></linearGradient><radialGradient id={`${id}-enamel`}><stop stopColor="#fffaf7"/><stop offset="1" stopColor="#d6c3d4"/></radialGradient></defs>
    <circle cx="80" cy="80" r="76" fill={`url(#${id}-silver)`}/><circle cx="80" cy="80" r="68" fill={`url(#${id}-enamel)`} stroke="#fff9" strokeWidth="2"/>
    <g stroke={`url(#${id}-silver)`} strokeWidth="3" strokeLinejoin="round">
      <path fill="#292832" d="M43 122L39 85Q41 50 78 52Q117 51 121 87L119 123L105 130L55 130Z"/>
      <path fill="#f7eee9" d="M50 86L55 72L63 84L70 70L78 86L87 72L94 85L105 73L111 90L107 111Q96 133 78 130Q57 127 51 109Z"/>
      <path fill="#c9c5d5" d="M48 76Q20 68 24 22Q43 33 56 60M110 76Q137 65 137 22Q116 35 104 61Z"/>
      <path fill="#b66e82" d="M44 75Q42 42 79 42Q117 42 115 75Q80 88 44 75Z"/>
      <path fill="#f7f4f1" d="M44 73Q81 83 115 73L115 83Q78 93 44 82Z"/>
      <ellipse cx="58" cy="61" rx="7" ry="11" fill="#292832"/><ellipse cx="101" cy="61" rx="7" ry="11" fill="#292832"/>
    </g>
    <g fill="#292832"><ellipse cx="66" cy="102" rx="3" ry="6"/><ellipse cx="96" cy="102" rx="3" ry="6"/></g><path d="M60 93q5-3 10 0M90 93q5-3 10 0M76 117q5 4 10-1" fill="none" stroke="#292832" strokeWidth="2" strokeLinecap="round"/>
    <path d="M34 38Q68 5 112 32" fill="none" stroke="#fff" strokeWidth="3" opacity=".85"/>
  </svg><span className="pin-gloss" aria-hidden="true"/></div>
}


export function SleepingBorg() {
  return <svg className="doodle-borg-sleeping" viewBox="0 0 130 80" role="img" aria-label="A sleepy Borg"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 59Q15 56 9 38Q28 35 41 47M85 57Q109 54 117 32Q96 32 80 46M32 58Q33 32 60 33Q89 32 91 58Q61 71 32 58ZM43 50q5 5 10 0M69 49q5 5 10-1M22 71q36 4 81-1M92 20h8l-8 8h8M109 7h11l-11 11h11"/>
    </g></svg>
}


