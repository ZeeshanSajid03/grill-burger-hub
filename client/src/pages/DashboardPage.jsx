import { useEffect, useState } from 'react'
import axios from 'axios'
import socket from '../socket'
import { useAuth } from '../context/AuthContext'
import LoginPage from './LoginPage'
import API_URL from '../config'
import { useRef } from 'react'

const statusColors = {
  Pending: 'bg-yellow-500/10 text-yellow-400  border-yellow-500/20',
  Preparing: 'bg-blue-500/10   text-blue-400    border-blue-500/20',
  Ready: 'bg-green-500/10  text-green-400   border-green-500/20',
  'Out for Delivery': 'bg-purple-500/10 text-purple-400  border-purple-500/20',
  Completed: 'bg-zinc-500/10   text-zinc-400    border-zinc-500/20',
}

const nextStatus = {
  Pending: 'Preparing',
  Preparing: { Delivery: 'Out for Delivery', default: 'Ready' },
  'Out for Delivery': 'Completed',
  Ready: 'Completed',
}

const getNextStatus = (order) => {
  const n = nextStatus[order.status]
  if (typeof n === 'object') return order.orderType === 'Delivery' ? n.Delivery : n.default
  return n
}

const getStatusLabel = (order) => {
  if (order.status === 'Preparing' && order.orderType === 'Delivery') return '🛵 Out for Delivery'
  if (order.status === 'Preparing') return '🟢 Mark as Ready'
  if (order.status === 'Pending') return '🟡 Mark as Preparing'
  if (order.status === 'Ready' || order.status === 'Out for Delivery') return '✅ Mark as Completed'
  return null
}

export default function DashboardPage() {
  const { isLoggedIn, adminLogout, isAdmin, adminHeader } = useAuth()
  const [loggedIn, setLoggedIn] = useState(isAdmin)

  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [newOrderIds, setNewOrderIds] = useState([])
  const [riders, setRiders] = useState([])
  const [assigningOrder, setAssigningOrder] = useState(null)
  const [selectedRider, setSelectedRider] = useState('')

  useEffect(() => {
    if (!loggedIn) return

    axios.get(`${API_URL}/api/orders`, { headers: adminHeader })
      .then(res => setOrders(res.data))
      .catch(console.error)

    axios.get(`${API_URL}/api/riders/all`, { headers: adminHeader })
      .then(res => setRiders(res.data))
      .catch(console.error)

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      setNewOrderIds(prev => [...prev, order._id])
      playNotificationSound()
      setTimeout(() => {
        setNewOrderIds(prev => prev.filter(id => id !== order._id))
      }, 3000)
    })

    socket.on('order_updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    })

    socket.on('order_deleted', (id) => {
      setOrders(prev => prev.filter(o => o._id !== id))
    })

    return () => {
      socket.off('new_order')
      socket.off('order_updated')
      socket.off('order_deleted')
    }
  }, [loggedIn])

  const handleLogin = () => setLoggedIn(true)
  const handleLogout = () => { adminLogout(); setLoggedIn(false) }

  const audioCtxRef = useRef(null)

  useEffect(() => {
    const unlock = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      document.removeEventListener('click', unlock)
    }
    document.addEventListener('click', unlock)
    return () => document.removeEventListener('click', unlock)
  }, [])

  const playNotificationSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      let time = ctx.currentTime
      const beepDuration = 0.15
      const silenceBetween = 0.1
      const pauseBetween = 0.6
      const totalDuration = 10

      while (time < ctx.currentTime + totalDuration) {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          osc.type = 'sine'
          gain.gain.setValueAtTime(0, time)
          gain.gain.linearRampToValueAtTime(0.4, time + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.001, time + beepDuration)
          osc.start(time)
          osc.stop(time + beepDuration)
          time += beepDuration + silenceBetween
        }
        time += pauseBetween
      }
    } catch (err) {
      console.error('Audio error:', err)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API_URL}/api/orders/${id}`,
        { status },
        { headers: adminHeader }
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleOutForDelivery = (order) => {
    setAssigningOrder(order)
    setSelectedRider('')
  }

  const confirmRiderAssignment = async () => {
  if (!selectedRider) return alert('Please select a rider')
  const rider = riders.find(r => r._id === selectedRider)
  try {
    await axios.patch(
      `${API_URL}/api/orders/${assigningOrder._id}/assign-rider`,
      {
        riderId:    rider._id,
        riderName:  rider.name,
        riderPhone: rider.phone
      },
      { headers: adminHeader }
    )
    setAssigningOrder(null)
    setSelectedRider('')
  } catch (err) {
    console.error(err)
  }
}
  


  const deleteOrder = async (id) => {
  try {
    await axios.delete(
      `${API_URL}/api/orders/${id}`,
      { headers: adminHeader }
    )
  } catch (err) {
    console.error(err)
  }
}

  const printReceipt = (order) => {
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.customerName}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 320px; margin: 0 auto; }
            h2 { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-weight: bold; font-size: 1.1em; }
            .center { text-align: center; }
            .small { font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <h2>🍔 Grill Burger Hub</h2>
          <p class="center small">Takeaway & Delivery</p>
          <div class="divider"></div>
          <div class="row"><span>Order:</span><span>${order.orderNumber}</span></div>
          <div class="row"><span>Customer:</span><span>${order.customerName}</span></div>
          ${order.customerPhone ? `<div class="row"><span>Phone:</span><span>${order.customerPhone}</span></div>` : ''}
          <div class="row"><span>Type:</span><span>${order.orderType}</span></div>
          ${order.deliveryAddress ? `<div class="row"><span>Address:</span><span style="max-width:180px;text-align:right">${order.deliveryAddress}</span></div>` : ''}
          ${order.rider?.name ? `<div class="row"><span>Rider:</span><span>${order.rider.name} (${order.rider.phone})</span></div>` : ''}
          <div class="row"><span>Time:</span><span>${new Date(order.createdAt).toLocaleString()}</span></div>
          <div class="divider"></div>
          <p><strong>Items:</strong></p>
          ${order.items.map(i => `
            <div class="row">
              <span>${i.name} x${i.quantity}</span>
              <span>Rs. ${i.price * i.quantity}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="row total"><span>TOTAL</span><span>Rs. ${order.total}</span></div>
          <div class="divider"></div>
          <p class="center small">Thank you for your order!</p>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today)
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const todayCompleted = todayOrders.filter(o => o.status === 'Completed').length
  const todayPending = todayOrders.filter(o => o.status === 'Pending').length

  const filtered = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter)

  const counts = {
    All: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Preparing: orders.filter(o => o.status === 'Preparing').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
  }

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Rider Assignment Modal */}
      {assigningOrder && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setAssigningOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm pointer-events-auto p-6">
              <h3 className="font-bold text-white text-lg mb-2">Assign Rider</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Order {assigningOrder.orderNumber} → {assigningOrder.customerName}
              </p>

              {riders.filter(r => r.available).length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                  <p className="text-red-400 text-sm">No available riders right now. Add riders in the Admin panel.</p>
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  {riders.filter(r => r.available).map(rider => (
                    <button
                      key={rider._id}
                      onClick={() => setSelectedRider(rider._id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                        ${selectedRider === rider._id
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${selectedRider === rider._id ? 'border-orange-500 bg-orange-500' : 'border-zinc-600'}`}>
                          {selectedRider === rider._id && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{rider.name}</p>
                          <p className="text-zinc-400 text-xs">{rider.phone}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Available</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={confirmRiderAssignment}
                  disabled={!selectedRider}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Assign & Dispatch
                </button>
                <button
                  onClick={() => setAssigningOrder(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Restaurant Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Orders update in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-zinc-400 text-xs hidden sm:block">Live</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-zinc-500 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Today's Orders", value: todayOrders.length, icon: '📋' },
          { label: "Today's Revenue", value: `Rs. ${todayRevenue}`, icon: '💰' },
          { label: 'Completed', value: todayCompleted, icon: '✅' },
          { label: 'Pending', value: todayPending, icon: '⏳' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xl sm:text-2xl font-black text-white">{value}</p>
            <p className="text-zinc-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Ready', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5
              ${filter === tab ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {tab}
            <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold
              ${filter === tab ? 'bg-white/20' : 'bg-zinc-700'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-3">🍽️</p>
          <p>No orders here yet</p>
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(order => (
          <div
            key={order._id}
            className={`bg-zinc-900 border rounded-2xl p-5 transition-all flex flex-col
              ${newOrderIds.includes(order._id)
                ? 'border-orange-500 shadow-lg shadow-orange-500/10'
                : 'border-zinc-800'
              }`}
          >
            {/* Order Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                {newOrderIds.includes(order._id) && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full mb-1 inline-block">New!</span>
                )}
                <h3 className="font-bold text-white text-lg leading-tight">{order.customerName}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-zinc-500 text-xs">
                    {order.orderType === 'Delivery' ? '🛵' : order.orderType === 'Dine-in' ? '🍽️' : '🥡'} {order.orderType}
                  </span>
                  <span className="text-zinc-600 text-xs">·</span>
                  <span className="text-zinc-500 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                {order.customerPhone && (
                  <p className="text-zinc-500 text-xs mt-0.5">📞 {order.customerPhone}</p>
                )}
                {order.deliveryAddress && (
                  <p className="text-zinc-500 text-xs mt-0.5">📍 {order.deliveryAddress}</p>
                )}
                {/* Rider info on dashboard */}
                {order.rider?.name && (
                  <p className="text-purple-400 text-xs mt-0.5">🛵 {order.rider.name} · {order.rider.phone}</p>
                )}
              </div>
              <span className={`text-xs border px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-1.5 mb-4 flex-1">
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

            {/* Total */}
            <div className="border-t border-zinc-800 pt-3 mb-4 flex justify-between font-bold">
              <span className="text-zinc-400 text-sm">Total</span>
              <span className="text-orange-400">Rs. {order.total}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {order.status !== 'Completed' && (
                <>
                  {order.status === 'Preparing' && order.orderType === 'Delivery' ? (
                    <button
                      onClick={() => handleOutForDelivery(order)}
                      className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                      🛵 Assign Rider & Dispatch
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(order._id, getNextStatus(order))}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                      {getStatusLabel(order)}
                    </button>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => printReceipt(order)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2 rounded-xl transition-colors"
                >
                  🖨️ Print Receipt
                </button>
                {order.status === 'Completed' && (
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium py-2 rounded-xl transition-colors"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}