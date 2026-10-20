'use client'

import { useEffect, useRef } from 'react'

/** Native modal: background is inert, Tab stays inside, Escape and focus return work. */
export function Modal({ open, onClose, label, className, children }: {
  open: boolean
  onClose: () => void
  label: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const dialog = ref.current
    if (!dialog) return
    const trigger = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [open])
  return (
    <dialog ref={ref} aria-label={label} className={className} onCancel={(event) => {
      event.preventDefault()
      onClose()
    }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      {open && children}
    </dialog>
  )
}
