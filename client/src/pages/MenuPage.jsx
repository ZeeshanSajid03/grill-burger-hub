import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import AddonsModal from '../components/AddonsModal'
import API_URL from '../config'

const categories = ['All', 'Burger', 'Fries', 'Drink', 'Deal']

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={`text-xs ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-zinc-600'}`}
        >★</span>
      ))}
      {count > 0 && <span className="text-zinc-500 text-xs ml-1">({count})</span>}
    </div>
  )
}

export default function MenuPage() {
  const [menuItems, setMenuItems]     = useState([])
  const [ratings, setRatings]         = useState({})
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading]         = useState(true)
  const [modalItem, setModalItem]     = useState(null)
  const { addToCart, setIsCartOpen }  = useCart()
  const { settings }                  = useSettings()

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/menu`),
      axios.get(`${API_URL}/api/reviews/averages`)
    ]).then(([menuRes, ratingsRes]) => {
      setMenuItems(menuRes.data)
      const ratingsMap = {}
      ratingsRes.data.forEach(r => {
        ratingsMap[r._id] = { avg: r.avgRating, count: r.count }
      })
      setRatings(ratingsMap)
      setLoading(false)
    }).catch(err => { console.error(err); setLoading(false) })
  }, [])

  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  const handleAddToCart = (item) => {
    if (!settings.isOpen) return
    if (item.soldOut) return
    if (item.addons && item.addons.length > 0) {
      setModalItem(item)
    } else {
      addToCart(item)
      setIsCartOpen(true)
    }
  }

  // Check if currently open based on time
  const checkIsOpenNow = () => {
    if (!settings.isOpen) return false
    const now     = new Date()
    const current = now.getHours() * 60 + now.getMinutes()
    const [oh, om] = settings.openTime.split(':').map(Number)
    const [ch, cm] = settings.closeTime.split(':').map(Number)
    const open  = oh * 60 + om
    const close = ch * 60 + cm
    return current >= open && current <= close
  }

  const isOpenNow = checkIsOpenNow()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-white mb-3">
          Grill <span className="text-orange-500">Burger</span> Hub
        </h1>
        <p className="text-zinc-400 text-lg">Fresh grilled burgers, crispy fries, ice cold drinks</p>
      </div>

      {/* Closed Banner */}
      {!isOpenNow && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 mb-6 text-center">
          <p className="text-red-400 font-bold text-lg">🔒 We're currently closed</p>
          <p className="text-zinc-400 text-sm mt-1">
            We're open {settings.openTime} – {settings.closeTime}
          </p>
        </div>
      )}

      {/* Busy Banner */}
      {isOpenNow && settings.isBusy && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-6 py-4 mb-6 text-center">
          <p className="text-yellow-400 font-bold">⏳ Kitchen is busy</p>
          <p className="text-zinc-400 text-sm mt-1">{settings.busyMessage}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-3 animate-pulse">🍔</p>
          <p>Loading menu...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-3">😕</p>
          <p>No items in this category yet</p>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => {
          const rating   = ratings[item._id]
          const isSoldOut = item.soldOut
          return (
            <div
              key={item._id}
              className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all group
                ${isSoldOut ? 'opacity-70' : 'hover:border-zinc-600'}`}
            >
              {/* Image */}
              <div className="h-48 bg-zinc-800 flex items-center justify-center text-6xl overflow-hidden relative">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                  : <span className="group-hover:scale-105 transition-transform">
                      {item.category === 'Burger' ? '🍔' :
                       item.category === 'Fries'  ? '🍟' :
                       item.category === 'Drink'  ? '🥤' : '🎁'}
                    </span>
                }
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                  <span className="text-orange-400 font-bold ml-2 whitespace-nowrap">Rs. {item.price}</span>
                </div>
                {item.description && (
                  <p className="text-zinc-500 text-sm mb-2 leading-relaxed">{item.description}</p>
                )}
                {rating && (
                  <div className="mb-3">
                    <StarRating rating={rating.avg} count={rating.count}/>
                  </div>
                )}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={isSoldOut || !isOpenNow}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  {isSoldOut ? 'Sold Out' : !isOpenNow ? 'Closed' : 'Add to Cart'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {modalItem && (
        <AddonsModal
          item={modalItem}
          onConfirm={(item, selectedAddons) => {
            addToCart(item, selectedAddons)
            setIsCartOpen(true)
          }}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  )
}