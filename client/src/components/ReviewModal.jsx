import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

export default function ReviewModal({ item, orderId, onClose, onSubmitted }) {
  const { customer, customerHeader } = useAuth()
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (!rating) return alert('Please select a rating')
    setSaving(true)
    try {
      await axios.post(
        `${API_URL}/api/reviews`,
        {
          menuItem:     item._id || item.menuItem,
          customerName: customer?.name || 'Guest',
          rating,
          comment,
          orderId
        },
        { headers: customerHeader }
      )
      setDone(true)
      setTimeout(() => { onSubmitted(); onClose() }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm pointer-events-auto p-6">
          {done ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🌟</p>
              <p className="text-white font-bold">Thanks for your review!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Rate {item.name}</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl leading-none">×</button>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-4xl transition-transform hover:scale-110"
                  >
                    <span className={star <= (hover || rating) ? 'text-yellow-400' : 'text-zinc-700'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience (optional)"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm mb-4"
              />

              <button
                onClick={handleSubmit}
                disabled={saving || !rating}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {saving ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}