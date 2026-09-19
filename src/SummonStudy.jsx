import { useEffect, useRef, useState  } from 'react'
import { projects  } from './data/projects'
import './envelope-study.css'
import './reveal-sequence.css'
import './yuri-theme.css'
import SignaturePad from './components/SignaturePad'
import Dossier from './components/Dossier'
import ArchiveDialog from './components/ArchiveDialog'
import { EnvelopeDoodles, CharacterPin, SleepingBorg } from './components/EnvelopeArtwork'

export default function SummonStudy() {
  const [phase, setPhase] = useState('sealed')
  const [index, setIndex] = useState(-1)
  const [browse, setBrowse] = useState(false)
  const [contact, setContact] = useState(false)
  const [about, setAbout] = useState(false)
  const [mark, setMark] = useState([])
  const [authorized, setAuthorized] = useState(false)
  const timer = useRef(null)
  const result = useRef(null)
  const project = projects[index]
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => { if (phase === 'revealed') result.current?.focus()  }, [phase])
  function open(signature = []) {
    if (phase !== 'sealed') return
    setMark(Array.isArray(signature) ? signature : [])
    setAuthorized(true)
    const choices = projects.map((_, i) => i).filter(i => i !== index)
    setIndex(choices[Math.floor(Math.random() * choices.length)])
    setBrowse(false)
    setPhase('opening')
    timer.current = setTimeout(() => setPhase('revealed'), 4800)
   }
  function select(i) {
    clearTimeout(timer.current)
    setMark([]); setAuthorized(false); setIndex(i); setBrowse(false); setPhase('revealed')
   }
  return <main className={`archive ${phase} motion full-effects`}>
    <header className="masthead"><button className="header-gallery" onClick={()=>setBrowse(true)} aria-haspopup="dialog" aria-expanded={browse}>Gallery <span aria-hidden="true">↗</span></button><button className="header-seal" onClick={()=>setAbout(true)} aria-label="About this archive" aria-haspopup="dialog" aria-expanded={about}><span>Y / O</span><small>ARCHIVE</small></button><button className="header-contact" onClick={()=>setContact(true)} aria-haspopup="dialog" aria-expanded={contact}>Contact ↗</button></header>
    <section className="ceremony" aria-label="Open an archived project">
      <div className="speed-lines" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--ray-angle':`${i*22.5}deg`,'--line-delay':`${-i*.31}s`,'--line-length':`${160+(i%4)*40}px`}}/>)}</div>
      <div className="ambient" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="crosshair"/>{Array.from({length:12 },(_,i)=><i key={i } style={{'--i':i, left:`${8 + (i*29)%84 }%`,top:`${12+(i*17)%74 }%` } }/>) }</div>
      {phase === 'sealed' && <div className="arrival-effects" aria-hidden="true"><span className="arrival-flare"/><span className="arrival-beam"/>{Array.from({length:12},(_,i)=><i key={i} style={{'--angle':`${i*30+8}deg`,'--ray-delay':`${.3+(i%3)*.04}s`}}/>)}</div>}
      <div className="foreground-glints" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
      {phase === 'opening' && <div className="opening-effects" aria-hidden="true"><span className="signature-star star-a"/><span className="signature-star star-b"/><span className="flap-light"/><span className="reveal-wash"/><div className="reveal-confetti">{Array.from({length:10},(_,i)=><i key={i} style={{'--particle':i,'--direction':`${i*36}deg`}}/>)}</div></div>}


      {phase !== 'revealed' && <div className={`envelope-space ${index < 0 ? 'first-arrival' : 'return-arrival' }` }><div className="envelope">
        <div className="envelope-back"><CharacterPin/></div>
        <div className="envelope-front"><div className="paper-grain"/><EnvelopeDoodles/></div>
        <div className="flap"><i className="flap-fastener" aria-hidden="true"/></div>
        <SignaturePad locked={phase !== 'sealed' } onAuthorize={open } />
      </div></div> }
      {phase !== 'sealed' && project && <Dossier project={project } index={index } phase={phase } mark={mark } authorized={authorized } onAnother={()=>setPhase('sealed') } ref={result } /> }
    </section>
    {browse && <ArchiveDialog title="The gallery" onClose={()=>setBrowse(false)} className="gallery-dialog"><p className="dialog-intro">A few things I’ve made. Pick a card to take a closer look.</p><div className="postcard-grid">{projects.map((p,i)=><button className="gallery-postcard" key={p.id} onClick={()=>select(i)}><img src={p.thumbnail} alt=""/><span className="postcard-number">0{i+1} / {p.type}</span><strong>{p.name}</strong><span className="postcard-open">Open dossier ↗</span></button>)}</div></ArchiveDialog>}
    {about && <ArchiveDialog title="About this archive" onClose={()=>setAbout(false)} className="about-dialog" portrait="/images/yuri-profile.jpg">
      <div className="about-art" aria-hidden="true"><SleepingBorg/></div>
      <div className="about-copy">
        <p>hi, i'm jordan. i've used “yuri ootani” online for about ten years. i borrowed the name from the protagonist of hitoshi tomizawa's manga <a href="https://sf-encyclopedia.com/entry/alien_nine" target="_blank" rel="noreferrer">alien nine</a>, and it stuck.</p>
        <p>yuri is a schoolgirl reluctantly recruited to catch aliens. she wears a symbiotic alien called a borg, which protects her and helps her do things she couldn't do on her own. the image aged well: something that gives you extraordinary abilities, with an uneasy question about how much autonomy you're giving up in return.</p>
        <h3>a little about me</h3>
        <p>i live in the san francisco bay area and my background is in civil engineering.</p>
        <p>riot games degen (league &amp; tft, no valorant). trying to keep busy so i don't relapse for the fifth time lol.</p>
        <p>still trying out new hobbies. open to new stuff. trying to make stuff work.</p>
        <p>feel free to <a href="mailto:yuriootani@gmail.com">email me</a> or <a href="https://x.com/yuriootaniqbis" target="_blank" rel="noreferrer">dm me on twitter</a>.</p><p className="about-signoff">two Ls make a W</p>
      </div>
    </ArchiveDialog>}
    {contact && <ArchiveDialog title="Say hello" onClose={()=>setContact(false)} className="contact-dialog"><p className="dialog-intro">A note, a question, or something you think I’d like.</p><a className="contact-link" href="mailto:yuriootani@gmail.com"><span>Email<small>yuriootani@gmail.com</small></span><span aria-hidden="true">↗</span></a><a className="contact-link" href="https://x.com/yuriootaniqbis" target="_blank" rel="noreferrer"><span>X<small>@yuriootaniqbis</small></span><span aria-hidden="true">↗</span></a></ArchiveDialog>}
  </main>
 }
























