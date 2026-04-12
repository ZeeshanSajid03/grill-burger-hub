import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import emailjs from '@emailjs/browser'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

const EMAILJS_SERVICE_ID  = 'service_x74p1cr'
const EMAILJS_TEMPLATE_ID = 'template_xovrjni'
const EMAILJS_PUBLIC_KEY  = 'HQWQSC7t70SVrB4ak'

export default function CheckoutPage() {
  const { customer } = useAuth()
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName:    '',
    customerPhone:   '',
    orderType:       'Takeaway',
    deliveryAddress: '',
    email:           ''
  })
  const [placing, setPlacing]         = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const [zones, setZones]               = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [deliveryFee, setDeliveryFee]   = useState(0)

  useEffect(() => {
    axios.get(`${API_URL}/api/delivery-zones`)
      .then(res => setZones(res.data))
      .catch(console.error)
  }, [])

  const cities = [...new Set(zones.map(z => z.city))]
  const areas  = zones.filter(z => z.city === selectedCity)

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setSelectedArea('')
    setDeliveryFee(0)
  }

  const handleAreaChange = (area) => {
    setSelectedArea(area)
    const zone = zones.find(z => z.city === selectedCity && z.area === area)
    if (zone) setDeliveryFee(zone.deliveryFee)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const finalTotal = form.orderType === 'Delivery'
    ? totalPrice + deliveryFee
    : totalPrice

  const handleSubmit = async () => {
    if (!form.customerName.trim()) return alert('Please enter your name')
    if (!form.customerPhone.trim()) return alert('Please enter your phone')
    if (form.orderType === 'Delivery') {
      if (!selectedCity) return alert('Please select a city')
      if (!selectedArea) return alert('Please select an area')
      if (!form.deliveryAddress.trim()) return alert('Please enter your street address')
    }
    if (cartItems.length === 0) return alert('Your cart is empty')

    setPlacing(true)
    try {
      const token   = customer?.token || null
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await axios.post(`${API_URL}/api/orders`, {
        customerName:    form.customerName,
        customerPhone:   form.customerPhone,
        orderType:       form.orderType,
        deliveryAddress: form.orderType === 'Delivery'
          ? `${form.deliveryAddress}, ${selectedArea}, ${selectedCity}`
          : '',
        deliveryCity: form.orderType === 'Delivery' ? selectedCity : '',
        deliveryArea: form.orderType === 'Delivery' ? selectedArea : '',
        deliveryFee:  form.orderType === 'Delivery' ? deliveryFee  : 0,
        items: cartItems.map(i => ({
          menuItem: i._id,
          name:     i.name,
          price:    i.price,
          quantity: i.quantity
        })),
        total: finalTotal
      }, { headers })

      const placed = res.data

      if (form.email) {
        const itemsList = cartItems
          .map(i => `${i.name} x${i.quantity} — Rs. ${i.price * i.quantity}`)
          .join('\n')
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_email:         form.email,
            customer_name:    form.customerName,
            order_number:     placed.orderNumber,
            order_items:      itemsList,
            order_total:      `Rs. ${finalTotal}`,
            order_type:       form.orderType,
            delivery_address: form.orderType === 'Delivery'
              ? `${form.deliveryAddress}, ${selectedArea}, ${selectedCity}`
              : 'N/A'
          },
          EMAILJS_PUBLIC_KEY
        )
      }

      clearCart()
      setPlacedOrder(placed)
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
                { type: 'Dine-in',  icon: '🍽️' },
                { type: 'Delivery', icon: '🛵' }
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    setForm({ ...form, orderType: type })
                    setSelectedCity('')
                    setSelectedArea('')
                    setDeliveryFee(0)
                  }}
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

          {/* Delivery fields */}
          {form.orderType === 'Delivery' && (
            <div className="space-y-4">
              {zones.length === 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">
                    No delivery zones available yet. Please contact the restaurant.
                  </p>
                </div>
              ) : (
                <>
                  {/* City */}
                  <div>
                    <label className="text-zinc-400 text-sm block mb-2">City *</label>
                    <select
                      value={selectedCity}
                      onChange={e => handleCityChange(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  {selectedCity && (
                    <div>
                      <label className="text-zinc-400 text-sm block mb-2">Area *</label>
                      <select
                        value={selectedArea}
                        onChange={e => handleAreaChange(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="">Select area</option>
                        {areas.map(zone => (
                          <option key={zone._id} value={zone.area}>
                            {zone.area} — {zone.deliveryFee === 0 ? 'Free Delivery' : `Rs. ${zone.deliveryFee}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Delivery fee badge */}
                  {selectedArea && (
                    <div className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all
                      ${deliveryFee === 0
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-zinc-800'
                      }`}>
                      <span className="text-zinc-400 text-sm">Delivery fee</span>
                      {deliveryFee === 0 ? (
                        <span className="flex items-center gap-2">
                          <span className="text-green-400 text-lg animate-bounce">🎉</span>
                          <span className="text-green-400 font-bold text-sm">Free Delivery!</span>
                          <span className="text-green-400 text-xs animate-pulse">✦</span>
                        </span>
                      ) : (
                        <span className="text-orange-400 font-bold">Rs. {deliveryFee}</span>
                      )}
                    </div>
                  )}

                  {/* Street address */}
                  {selectedArea && (
                    <div>
                      <label className="text-zinc-400 text-sm block mb-2">Street Address *</label>
                      <textarea
                        name="deliveryAddress"
                        value={form.deliveryAddress}
                        onChange={handleChange}
                        placeholder="House/Flat no., Street name"
                        rows={2}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-white text-lg mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item.cartKey} className="flex justify-between text-sm">
                <span className="text-zinc-300">
                  {item.name}
                  <span className="text-zinc-500 ml-2">×{item.quantity}</span>
                </span>
                <span className="text-white font-medium">Rs. {item.price * item.quantity}</span>
              </div>
            ))}

            {form.orderType === 'Delivery' && selectedArea && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Delivery fee ({selectedArea})</span>
                {deliveryFee === 0
                  ? <span className="text-green-400 font-medium">Free</span>
                  : <span className="text-white">Rs. {deliveryFee}</span>
                }
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
          disabled={placing || (form.orderType === 'Delivery' && zones.length === 0)}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          {placing ? 'Placing Order...' : `Place Order · Rs. ${finalTotal}`}
        </button>
      </div>
    </div>
  )
}