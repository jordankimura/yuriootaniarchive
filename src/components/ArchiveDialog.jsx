import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ArchiveDialog({ title, onClose, children, className = '', portrait }) {
  const dialog = useRef(null)
  useLayoutEffect(() => {
    const node = dialog.current
    node.showModal()
    return () => node.close()
  }, [])
  return createPortal(<dialog ref={dialog} className={`archive-dialog ${className}`} aria-label={title} onCancel={onClose}>
    <div className="dialog-heading">{portrait && <img className="about-portrait" src={portrait} alt="Yuri profile picture on X"/>}<h2>{title}</h2><button onClick={onClose} aria-label={`Close ${title}`}>×</button></div>
    {children}
  </dialog>, document.body)
}


