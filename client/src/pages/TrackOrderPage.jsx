import API_URL from '../config'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import socket from '../socket'
import ReviewModal from '../components/ReviewModal'
import { useAuth } from '../context/AuthContext'

const steps = ['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed']

const stepIcons = {
  Pending: '🕐',
  Preparing: '👨‍🍳',
  Ready: '✅',
  'Out for Delivery': '🛵',
  Completed: '🎉'
}

const stepDesc = {
  Pending: 'Order received, waiting for confirmation',
  Preparing: 'Your food is being prepared',
  Ready: 'Your order is ready for pickup',
  'Out for Delivery': 'Your order is on its way',
  Completed: 'Order delivered. Enjoy your meal!'
}

export default function TrackOrderPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { isCustomer } = useAuth()
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewedItems, setReviewedItems] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/api/orders/track/${orderNumber}`)
      .then(res => { setOrder(res.data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })

    socket.on('order_updated', (updated) => {
      if (updated.orderNumber === orderNumber) {
        setOrder(updated)
      }
    })

    return () => socket.off('order_updated')
  }, [orderNumber])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-zinc-400 animate-pulse">Loading order...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
        <p className="text-zinc-400 mb-6">We couldn't find order {orderNumber}</p>
        <Link to="/" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Back to Menu
        </Link>
      </div>
    </div>
  )

  const currentStep = steps.indexOf(order.status)
  const isDelivery = order.orderType === 'Delivery'
  const activeSteps = isDelivery
    ? steps
    : steps.filter(s => s !== 'Out for Delivery')

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-zinc-400 text-sm mb-1">Order</p>
        <h1 className="text-4xl font-black text-white mb-2">{order.orderNumber}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium
          ${order.status === 'Completed'
            ? 'bg-green-500/10 text-green-400'
            : 'bg-orange-500/10 text-orange-400'
          }`}>
          {order.status}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="space-y-0">
          {activeSteps.map((step, i) => {
            const stepIndex = steps.indexOf(step)
            const isDone = stepIndex < currentStep
            const isCurrent = stepIndex === currentStep
            const isLast = i === activeSteps.length - 1

            return (
              <div key={step} className="flex gap-4">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 transition-all
                    ${isCurrent ? 'bg-orange-500 ring-4 ring-orange-500/20' :
                      isDone ? 'bg-green-500/20' : 'bg-zinc-800'
                    }`}>
                    {isDone ? '✓' : stepIcons[step]}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 my-1 transition-colors
                      ${isDone ? 'bg-green-500/40' : 'bg-zinc-800'}`}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-8 pt-1.5">
                  <p className={`font-medium text-sm transition-colors
                    ${isCurrent ? 'text-orange-400' :
                      isDone ? 'text-green-400' : 'text-zinc-500'
                    }`}>
                    {step}
                  </p>
                  {isCurrent && (
                    <p className="text-zinc-400 text-xs mt-0.5">{stepDesc[step]}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-white mb-4">Order Details</h3>
        <div className="space-y-2 mb-4">
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
        <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold">
          <span className="text-zinc-400 text-sm">Total</span>
          <span className="text-orange-400">Rs. {order.total}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Customer</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Type</span>
            <span>{order.orderType}</span>
          </div>
          {order.deliveryAddress && (
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Address</span>
              <span className="text-right max-w-48">{order.deliveryAddress}</span>
            </div>
          )}
          {/* Rider Info — only shown when Out for Delivery */}
          {order.rider?.name && order.status === 'Out for Delivery' && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-6">
              <p className="text-purple-300 text-sm font-medium mb-4">🛵 Your delivery rider</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg">🛵</span>
                  </div>
                  <div>
                    <p className="text-white font-bold">{order.rider.name}</p>
                    <p className="text-zinc-400 text-sm">{order.rider.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = 'tel:' + order.rider.phone}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  📞 Call Rider
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between text-xs text-zinc-500">
            <span>Placed at</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Review prompt — only for completed orders */}
      {order.status === 'Completed' && isCustomer && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-white mb-1">How was your order?</h3>
          <p className="text-zinc-400 text-sm mb-4">Rate the items you ordered</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-zinc-300 text-sm">{item.name}</span>
                {reviewedItems.includes(item.menuItem || item._id?.toString()) ? (
                  <span className="text-green-400 text-xs">✓ Reviewed</span>
                ) : (
                  <button
                    onClick={() => setReviewItem(item)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ★ Rate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewItem && (
        <ReviewModal
          item={reviewItem}
          orderId={order._id}
          onClose={() => setReviewItem(null)}
          onSubmitted={() => {
            setReviewedItems(prev => [...prev, reviewItem.menuItem || reviewItem._id?.toString()])
            setReviewItem(null)
          }}
        />
      )}

      <Link
        to="/"
        className="block text-center bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
      >
        Order More
      </Link>
    </div>
  )
}