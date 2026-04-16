import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import socket from '../socket'
import API_URL from '../config'
import ReviewModal from '../components/ReviewModal'


const statusColors = {
  Pending: 'bg-yellow-500/10 text-yellow-400',
  Preparing: 'bg-blue-500/10   text-blue-400',
  Ready: 'bg-green-500/10  text-green-400',
  'Out for Delivery': 'bg-purple-500/10 text-purple-400',
  Completed: 'bg-zinc-500/10   text-zinc-400',
}

export default function MyOrdersPage() {
  const { isCustomer, customerHeader, customerLogout } = useAuth()
  const { addToCart, setIsCartOpen, clearCart } = useCart()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordered, setReordered] = useState(null)
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewOrderId, setReviewOrderId] = useState(null)
  const [reviewedItems, setReviewedItems] = useState([])

  useEffect(() => {
    if (!isCustomer) { navigate('/'); return }

    axios.get(`${API_URL}/api/customers/orders`, { headers: customerHeader })
      .then(res => { setOrders(res.data); setLoading(false) })
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
        _id: item.menuItem || item._id,
        name: item.name,
        price: item.price,
        category: item.category || 'Burger',
        addons: []
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
          {orders.map(order => (
            <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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

              <div className="border-t border-zinc-800 pt-3">
                {/* Reorder + Track buttons */}
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
                        {reordered === order._id ? '✓ Added to Cart' : '🔁 Reorder'}
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
                {order.status === 'Completed' && isCustomer && (
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs mb-2">Rate your items</p>
                    <div className="space-y-1.5">
                      {order.items.map((item, i) => {
                        const itemKey = `${order._id}-${item.menuItem || i}`
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-zinc-300 text-xs">{item.name}</span>
                            {reviewedItems.includes(itemKey) ? (
                              <span className="text-green-400 text-xs">✓ Reviewed</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setReviewItem(item)
                                  setReviewOrderId(order._id)
                                }}
                                className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                ★ Rate
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {reviewItem && (
        <ReviewModal
          item={reviewItem}
          orderId={reviewOrderId}
          onClose={() => { setReviewItem(null); setReviewOrderId(null) }}
          onSubmitted={() => {
            const itemKey = `${reviewOrderId}-${reviewItem.menuItem || reviewItem._id}`
            setReviewedItems(prev => [...prev, itemKey])
            setReviewItem(null)
            setReviewOrderId(null)
          }}
        />
      )}
    </div>
  )
}