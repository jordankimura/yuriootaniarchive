import { useRef, useState } from 'react'
import Chamber from './components/Chamber'
import { projects } from './data/projects'
import './summon-study.css'

export default function SummonStudy() {
  const controller = useRef(null)
  const [status,setStatus] = useState('loading')
  const [phase,setPhase] = useState('idle')
  const [index,setIndex] = useState(-1)
  const [browse,setBrowse] = useState(false)
  const project = projects[index]
  const summon = () => {
    const choices = projects.map((_,i)=>i).filter(i=>i!==index)
    setIndex(choices[Math.floor(Math.random()*choices.length)])
    setBrowse(false)
    if (status === 'error') { setPhase('revealed'); return }
    setPhase('summoning')
    controller.current?.summon()
  }
  const select = i => { setIndex(i); setPhase('revealed'); setBrowse(false); controller.current?.reset() }
  return <main className="study">
    <header><a href="/" className="brand">YURI OOTANI <span>THE ARCHIVE</span></a><button className="quiet" onClick={()=>setBrowse(!browse)}>Browse {projects.length} projects</button></header>
    <div className={`stage-layout ${phase === 'revealed' ? 'has-dossier' : ''}`}>
      <section className="stage" aria-label="Project summoning chamber">
        <Chamber controller={controller} onReady={()=>setStatus('ready')} onError={()=>setStatus('error')} onComplete={()=>setPhase('revealed')} />
        <div className="stage-caption"><span>PERSONAL WORK / EXPERIMENTS / UNFINISHED IDEAS</span><h1>Something worth<br/>bringing to light.</h1></div>
        <div className="summon-controls">
          <p role="status">{status==='loading' ? 'Preparing the chamber…' : status==='error' ? 'The 3D chamber is unavailable. You can still explore every project.' : phase==='summoning' ? 'Retrieving a fragment of the archive…' : 'One project. A little ceremony.'}</p>
          {phase==='summoning' ? <button className="summon" onClick={()=>controller.current?.skip()}>Skip to project →</button> : <button className="summon" disabled={status==='loading'} onClick={summon}>{phase==='revealed' ? 'Summon another project' : 'Summon a project'} <span>✧</span></button>}
        </div>
      </section>
      {phase==='revealed' && project && <article className="dossier" aria-label="Revealed project">
        <div className="dossier-top"><span>ARCHIVE / {String(index+1).padStart(3,'0')}</span><button aria-label="Close project" onClick={()=>{setPhase('idle');controller.current?.reset()}}>×</button></div>
        <img src={project.thumbnail} alt={project.name} />
        <p className="category">{project.type} / YURI OOTANI</p>
        <h2>{project.name}</h2><p className="summary">{project.description}</p>
        <p className="description">{project.longDescription}</p>
        <a className="project-link" href={project.link} target="_blank" rel="noreferrer">View project <span>↗</span></a>
      </article>}
    </div>
    {browse && <section className="project-browser" aria-label="Browse projects"><h2>The collection</h2><div>{projects.map((p,i)=><button key={p.id} onClick={()=>select(i)}><img src={p.thumbnail} alt=""/><span><small>{p.type}</small>{p.name}</span><b>↗</b></button>)}</div></section>}
    <footer><span>A collection by Yuri Ootani</span><a href="mailto:yuriootani@gmail.com">Get in touch ↗</a></footer>
  </main>
}
