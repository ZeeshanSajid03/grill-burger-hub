import { useState, useEffect } from 'react'

function formatTime(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export default function StatusPopup({ settings }) {
  const [dismissed, setDismissed] = useState(false)

  const checkIsOpenNow = () => {
    if (!settings.isOpen) return false
    const now = new Date()
    const current = now.getHours() * 60 + now.getMinutes()
    const [oh, om] = settings.openTime.split(':').map(Number)
    const [ch, cm] = settings.closeTime.split(':').map(Number)
    const open = oh * 60 + om
    const close = ch * 60 + cm

    if (close > open) {
      // Normal hours e.g. 9am to 11pm — same day
      return current >= open && current <= close
    } else {
      // Overnight hours e.g. 6pm to 2am — spans midnight
      return current >= open || current <= close
    }
  }

  const isOpenNow = checkIsOpenNow()
  const isBusy = settings.isBusy && isOpenNow

  // Reset dismissed state when status changes
  useEffect(() => {
    setDismissed(false)
  }, [settings.isOpen, settings.isBusy])

  if (dismissed) return null
  if (isOpenNow && !isBusy) return null

  const isClosed = !isOpenNow

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setDismissed(true)}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-6 text-center
          ${isClosed
            ? 'bg-zinc-900 border-red-500/30'
            : 'bg-zinc-900 border-yellow-500/30'
          }`}>

          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setDismissed(true)}
              className="text-zinc-500 hover:text-white text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {isClosed ? (
            <>
              <p className="text-5xl mb-4">🔒</p>
              <h2 className="text-xl font-black text-white mb-2">We're Closed</h2>
              <p className="text-zinc-400 text-sm mb-4">
                We're not taking orders right now.
              </p>
              <div className="bg-zinc-800 rounded-xl px-4 py-3 inline-block">
                <p className="text-zinc-400 text-xs mb-1">Opening hours</p>
                <p className="text-white font-bold">
                  {formatTime(settings.openTime)} – {formatTime(settings.closeTime)}
                </p>
              </div>
              <p className="text-zinc-500 text-xs mt-4">
                You can still browse the menu but ordering is disabled.
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl mb-4">⏳</p>
              <h2 className="text-xl font-black text-white mb-2">Kitchen is Busy</h2>
              <p className="text-zinc-400 text-sm mb-4">{settings.busyMessage}</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                <p className="text-yellow-400 text-sm font-medium">
                  Orders are temporarily paused
                </p>
              </div>
              <p className="text-zinc-500 text-xs mt-4">
                You can still browse the menu. Please check back soon.
              </p>
            </>
          )}

          <button
            onClick={() => setDismissed(true)}
            className={`mt-5 w-full font-bold py-3 rounded-xl transition-colors
              ${isClosed
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
              }`}
          >
            Got it, let me browse
          </button>
        </div>
      </div>
    </>
  )
}