import API_URL from '../config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import emailjs from '@emailjs/browser'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const DELIVERY_FEE = 100


export default function CheckoutPage() {
  const { customer } = useAuth()
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    orderType: 'Takeaway',
    deliveryAddress: '',
    email: ''
  })
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const finalTotal = form.orderType === 'Delivery' ? totalPrice + DELIVERY_FEE : totalPrice

  const handleSubmit = async () => {
    if (!form.customerName.trim()) return alert('Please enter your name')
    if (!form.customerPhone.trim()) return alert('Please enter your phone')
    if (form.orderType === 'Delivery' && !form.deliveryAddress.trim())
      return alert('Please enter delivery address')
    if (cartItems.length === 0) return alert('Your cart is empty')

    setPlacing(true)
    try {
      const token = customer?.token || null
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await axios.post(`${API_URL}/api/orders`, {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        deliveryAddress: form.orderType === 'Delivery' ? form.deliveryAddress : '',
        items: cartItems.map(i => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        total: finalTotal
      }, { headers })

      const placedOrder = res.data

      // Send email receipt if email provided
      if (form.email) {
        const itemsList = cartItems
          .map(i => `${i.name} x${i.quantity} — Rs. ${i.price * i.quantity}`)
          .join('\n')

        await emailjs.send(
          'service_x74p1cr',
          'template_xovrjni',
          {
            to_email: form.email,
            customer_name: form.customerName,
            order_number: placedOrder.orderNumber,
            order_items: itemsList,
            order_total: `Rs. ${finalTotal}`,
            order_type: form.orderType,
            delivery_address: form.orderType === 'Delivery' ? form.deliveryAddress : 'N/A'
          },
          'HQWQSC7t70SVrB4ak'
        )
      }

      clearCart()
      setPlacedOrder(placedOrder)
    } catch (err) {
      console.error(err)
      alert('Something went wrong, please try again')
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-3xl font-black text-white mb-2">Order Placed!</h2>
        <p className="text-zinc-400 mb-6">
          {form.orderType === 'Delivery'
            ? 'Your order is being prepared and will be delivered soon.'
            : 'Your order has been sent to the kitchen.'}
        </p>

        {/* Order number */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <p className="text-zinc-400 text-sm mb-1">Your order number</p>
          <p className="text-4xl font-black text-orange-400 mb-1">{placedOrder.orderNumber}</p>
          <p className="text-zinc-500 text-xs">Save this to track your order</p>
        </div>

        <div className="space-y-3">
          <Link
            to={`/track/${placedOrder.orderNumber}`}
            className="block w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Track My Order
          </Link>
          <button
            onClick={() => navigate('/')}
            className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/')}
        className="text-zinc-400 hover:text-white text-sm mb-8 flex items-center gap-2 transition-colors"
      >
        ← Back to Menu
      </button>

      <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Customer Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white text-lg">Your Details</h2>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Name *</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Phone *</label>
            <input
              type="text"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="03xx-xxxxxxx"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">
              Email
              <span className="text-zinc-600 ml-1 font-normal">(optional — for receipt)</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Order Type */}
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Order Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'Takeaway', icon: '🥡' },
                { type: 'Dine-in', icon: '🍽️' },
                { type: 'Delivery', icon: '🛵' }
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, orderType: type })}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors
                    ${form.orderType === type
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                >
                  {icon} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address - only shows when Delivery selected */}
          {form.orderType === 'Delivery' && (
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Delivery Address *</label>
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="House/Flat no., Street, Area, City"
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
              <p className="text-zinc-500 text-xs mt-1">Delivery fee: Rs. {DELIVERY_FEE}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-white text-lg mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-zinc-300">
                  {item.name}
                  <span className="text-zinc-500 ml-2">×{item.quantity}</span>
                </span>
                <span className="text-white font-medium">Rs. {item.price * item.quantity}</span>
              </div>
            ))}

            {form.orderType === 'Delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Delivery fee</span>
                <span className="text-white">Rs. {DELIVERY_FEE}</span>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-lg">
              <span className="text-white">Total</span>
              <span className="text-orange-400">Rs. {finalTotal}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={placing}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          {placing ? 'Placing Order...' : `Place Order · Rs. ${finalTotal}`}
        </button>
      </div>
    </div>
  )
}