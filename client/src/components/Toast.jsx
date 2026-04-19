import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 10)
    // Animate out then close
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error:   'bg-red-500/20   border-red-500/30   text-red-400',
    info:    'bg-zinc-800     border-zinc-700      text-zinc-300',
  }

  const icons = {
    success: '✓',
    error:   '✗',
    info:    'ℹ',
  }

  return (
    <div className={`fixed top-20 left-1/2 z-100 transition-all duration-300
      ${visible ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 -translate-y-2'}`}
    >
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shadow-lg ${colors[type]}`}>
        <span className="font-bold text-lg leading-none">{icons[type]}</span>
        <span className="text-sm font-medium whitespace-nowrap">{message}</span>
      </div>
    </div>
  )
}