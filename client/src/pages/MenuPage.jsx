import API_URL from '../config'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import AddonsModal from '../components/AddonsModal'

const categories = ['All', 'Burger', 'Fries', 'Drink', 'Deal']

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState([])
    const [activeCategory, setActiveCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const { addToCart, setIsCartOpen } = useCart()
    const [modalItem, setModalItem] = useState(null)

    useEffect(() => {
        axios.get(`${API_URL}/api/menu`)
            .then(res => { setMenuItems(res.data); setLoading(false) })
            .catch(err => { console.error(err); setLoading(false) })
    }, [])

    const filtered = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory)

    const handleAddToCart = (item) => {
  if (item.addons && item.addons.length > 0) {
    setModalItem(item)
  } else {
    addToCart(item)
    setIsCartOpen(true)
  }
}

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">

            {/* Hero */}
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-black text-white mb-3">
                    Grill <span className="text-orange-500">Burger</span> Hub
                </h1>
                <p className="text-zinc-400 text-lg">Fresh grilled burgers, crispy fries, ice cold drinks</p>
            </div>

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

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    <p className="text-4xl mb-3">😕</p>
                    <p>No items in this category yet</p>
                </div>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(item => (
                    <div
                        key={item._id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all group"
                    >
                        {/* Image placeholder */}
                        <div className="h-48 bg-zinc-800 flex items-center justify-center text-6xl overflow-hidden group-hover:scale-105 transition-transform">
                            {item.image
                                ? <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                : <>
                                    {item.category === 'Burger' && '🍔'}
                                    {item.category === 'Fries' && '🍟'}
                                    {item.category === 'Drink' && '🥤'}
                                    {item.category === 'Deal' && '🎁'}
                                </>
                            }
                        </div>

                        {/* Info */}
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                                <span className="text-orange-400 font-bold ml-2 whitespace-nowrap">Rs. {item.price}</span>
                            </div>
                            {item.description && (
                                <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{item.description}</p>
                            )}
                            <button
                                onClick={() => handleAddToCart(item)}
                                className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
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