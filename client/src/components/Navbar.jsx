import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CustomerAuthModal from './CustomerAuthModal'

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart()
  const { isAdmin, isCustomer, customer, customerLogout, adminLogout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <div>
              <p className="font-bold text-white leading-none">Grill Burger Hub</p>
              <p className="text-xs text-zinc-400 leading-none">Takeaway & Dine-in</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Admin links — only visible to admin */}
            {isAdmin && (
              <>
                <Link to="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Restaurant
                </Link>
                <Link to="/admin" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Admin
                </Link>
                <button
                  onClick={() => { adminLogout(); navigate('/') }}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {/* Customer links */}
            {isCustomer && !isAdmin && (
              <>
                <Link to="/my-orders" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  My Orders
                </Link>
                <span className="text-zinc-500 text-sm">Hi, {customer.name.split(' ')[0]}</span>
                <button
                  onClick={customerLogout}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {/* Not logged in */}
            {!isAdmin && !isCustomer && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <CustomerAuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}