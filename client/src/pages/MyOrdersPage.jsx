import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import socket from '../socket'
import API_URL from '../config'
import ReviewModal from '../components/ReviewModal'

const statusColors = {
  Pending:            'bg-yellow-500/10 text-yellow-400',
  Preparing:          'bg-blue-500/10   text-blue-400',
  Ready:              'bg-green-500/10  text-green-400',
  'Out for Delivery': 'bg-purple-500/10 text-purple-400',
  Completed:          'bg-zinc-500/10   text-zinc-400',
}

export default function MyOrdersPage() {
  const { isCustomer, customerHeader, customerLogout, customer } = useAuth()
  const { addToCart, setIsCartOpen, clearCart }                  = useCart()
  const navigate = useNavigate()

  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [reordered, setReordered]   = useState(null)
  const [reviewingOrder, setReviewingOrder] = useState(null)
  const [orderReviews, setOrderReviews]     = useState({})

  useEffect(() => {
    if (!isCustomer) { navigate('/'); return }

    axios.get(`${API_URL}/api/customers/orders`, { headers: customerHeader })
      .then(async res => {
        setOrders(res.data)
        setLoading(false)

        // Fetch reviews for all completed orders
        const completedOrders = res.data.filter(o => o.status === 'Completed')
        const reviewPromises  = completedOrders.map(o =>
          axios.get(`${API_URL}/api/reviews/order/${o._id}`)
            .then(r => ({ orderId: o._id, review: r.data }))
            .catch(() => ({ orderId: o._id, review: null }))
        )
        const results = await Promise.all(reviewPromises)
        const reviewMap = {}
        results.forEach(({ orderId, review }) => {
          if (review) reviewMap[orderId] = review
        })
        setOrderReviews(reviewMap)
      })
      .catch(() => { customerLogout(); navigate('/') })

    socket.on('order_updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    })

    return () => socket.off('order_updated')
  }, [isCustomer])

  const handleReorder = (order) => {
    clearCart()
    order.items.forEach(item => {
      addToCart({
        _id:      item.menuItem || item._id,
        name:     item.name,
        price:    item.price,
        category: item.category || 'Burger',
        addons:   []
      })
    })
    setReordered(order._id)
    setIsCartOpen(true)
    setTimeout(() => setReordered(null), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-zinc-400 animate-pulse">Loading your orders...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">My Orders</h1>
        <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to Menu
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-zinc-400 mb-6">No orders yet</p>
          <Link
            to="/"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const existingReview = orderReviews[order._id]
            return (
              <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-black text-white text-lg">{order.orderNumber}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {order.orderType} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-300">
                        {item.name}
                        <span className="text-zinc-500 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="text-zinc-400">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total + actions */}
                <div className="border-t border-zinc-800 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-orange-400 font-bold">Rs. {order.total}</span>
                    <div className="flex gap-2">
                      {order.status === 'Completed' && (
                        <button
                          onClick={() => handleReorder(order)}
                          className={`text-sm px-4 py-2 rounded-xl transition-colors font-medium
                            ${reordered === order._id
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                        >
                          {reordered === order._id ? '✓ Added' : '🔁 Reorder'}
                        </button>
                      )}
                      <Link
                        to={`/track/${order.orderNumber}`}
                        className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        Track
                      </Link>
                    </div>
                  </div>

                  {/* Review section — only for completed orders */}
                  {order.status === 'Completed' && (
                    <div className="mt-2">
                      {existingReview ? (
                        // Show existing review
                        <div className="bg-zinc-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(star => (
                                <span
                                  key={star}
                                  className={`text-sm ${star <= existingReview.rating ? 'text-yellow-400' : 'text-zinc-700'}`}
                                >★</span>
                              ))}
                            </div>
                            <span className="text-zinc-500 text-xs">
                              {new Date(existingReview.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {existingReview.comment && (
                            <p className="text-zinc-400 text-sm">{existingReview.comment}</p>
                          )}
                          <p className="text-zinc-600 text-xs mt-2">Your review has been submitted</p>
                        </div>
                      ) : (
                        // Show rate button
                        <button
                          onClick={() => setReviewingOrder(order)}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-xl transition-colors"
                        >
                          ★ Rate this order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingOrder && (
        <OrderReviewModal
          order={reviewingOrder}
          customerName={customer?.name || 'Guest'}
          customerHeader={customerHeader}
          onClose={() => setReviewingOrder(null)}
          onSubmitted={(review) => {
            setOrderReviews(prev => ({ ...prev, [reviewingOrder._id]: review }))
            setReviewingOrder(null)
          }}
        />
      )}
    </div>
  )
}

// Review modal for entire order
function OrderReviewModal({ order, customerName, customerHeader, onClose, onSubmitted }) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (!rating) return alert('Please select a rating')
    setSaving(true)
    try {
      const res = await axios.post(
        `${API_URL}/api/reviews`,
        {
          orderId:      order._id,
          customerName,
          rating,
          comment
        },
        { headers: customerHeader }
      )
      setDone(true)
      setTimeout(() => onSubmitted(res.data), 1500)
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review')
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
            <div className="text-center py-6">
              <p className="text-5xl mb-3">🌟</p>
              <p className="text-white font-bold text-lg">Thanks for your review!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-lg">Rate your order</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl leading-none">×</button>
              </div>
              <p className="text-zinc-500 text-sm mb-6">{order.orderNumber}</p>

              {/* Items summary */}
              <div className="bg-zinc-800 rounded-xl p-3 mb-6 space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="text-zinc-400 text-xs">
                    {item.name} ×{item.quantity}
                  </p>
                ))}
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