import { useState } from 'react'

export default function ProjectImages({ project }) {
  const [selected, setSelected] = useState(0)
  const images = project.images || [{ src: project.thumbnail, alt: project.name }]
  const current = images[selected]
  if (images.length === 1) return <img className="project-image" src={current.src} alt={current.alt}/>
  return <div className="project-images">
    <a className="project-image-link" href={current.src} target="_blank" rel="noreferrer" aria-label={`Open full-size image: ${current.alt}`}>
      <img className="project-image" src={current.src} alt={current.alt}/>
      <span className="image-enlarge" aria-hidden="true">↗</span>
    </a>
    <div className="image-selectors" role="group" aria-label="Project images">
      {images.map((image, i) => <button key={image.src} type="button" aria-label={`Show ${image.alt}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><img src={image.src} alt=""/></button>)}
      <span aria-live="polite">{selected + 1} / {images.length}</span>
    </div>
  </div>
}
