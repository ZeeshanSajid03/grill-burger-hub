import API_URL from '../config'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import socket from '../socket'

const statusColors = {
  Pending:            'bg-yellow-500/10 text-yellow-400',
  Preparing:          'bg-blue-500/10   text-blue-400',
  Ready:              'bg-green-500/10  text-green-400',
  'Out for Delivery': 'bg-purple-500/10 text-purple-400',
  Completed:          'bg-zinc-500/10   text-zinc-400',
}

export default function MyOrdersPage() {
  const { isCustomer, customerHeader, customerLogout } = useAuth()
  const navigate  = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

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

              {/* Footer */}
              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                <span className="text-orange-400 font-bold">Rs. {order.total}</span>
                <Link
                  to={`/track/${order.orderNumber}`}
                  className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}