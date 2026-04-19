import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CustomerAuthModal from './CustomerAuthModal'
import { useToast } from '../context/ToastContext'
import { useLocation } from 'react-router-dom'

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart()
  const { isAdmin, isCustomer, customer, customerLogout, adminLogout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const closeMenu = () => setMenuOpen(false)
  const location = useLocation()

  return (
    <>
      <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-2xl">🍔</span>
            <div>
              <p className="font-bold text-white leading-none">Grill Burger Hub</p>
              <p className="text-xs text-zinc-400 leading-none">Best Burger in Town</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Cart button — always visible */}
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

            {/* Desktop nav links — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3">
              {isAdmin && (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm transition-colors
        ${location.pathname === '/dashboard'
                        ? 'text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    Restaurant
                  </Link>
                  <Link
                    to="/admin"
                    className={`text-sm transition-colors
        ${location.pathname === '/admin'
                        ? 'text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    Admin
                  </Link>
                  <button
                    onClick={() => { adminLogout(); navigate('/'); showToast('Signed out', 'info') }}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {isCustomer && !isAdmin && (
                <>
                  <Link to="/my-orders" className="text-sm text-zinc-400 hover:text-white transition-colors">My Orders</Link>
                  <span className="text-zinc-500 text-sm">Hi, {customer.name.split(' ')[0]}</span>
                  <button onClick={customerLogout} className="text-sm text-zinc-500 hover:text-white transition-colors">Logout</button>
                </>
              )}
              {!isAdmin && !isCustomer && (
                <button onClick={() => setShowAuthModal(true)} className="text-sm text-zinc-400 hover:text-white transition-colors">Sign In</button>
              )}
            </div>

            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-4 space-y-1">
            {isAdmin && (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
    ${location.pathname === '/dashboard'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                >
                  <span>🍽️</span> Restaurant Dashboard
                </Link>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
    ${location.pathname === '/admin'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                >
                  <span>⚙️</span> Admin Panel
                </Link>
                <button
                  onClick={() => { adminLogout(); navigate('/'); closeMenu() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span>🚪</span> Logout
                </button>
              </>
            )}

            {isCustomer && !isAdmin && (
              <>
                <div className="flex items-center gap-3 px-4 py-3 text-zinc-400 text-sm">
                  <span>👋</span> Hi, {customer.name.split(' ')[0]}
                </div>
                <Link
                  to="/my-orders"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span>📋</span> My Orders
                </Link>
                <button
                  onClick={() => { customerLogout(); showToast('Signed out', 'info'); closeMenu() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span>🚪</span> Logout
                </button>
              </>
            )}

            {!isAdmin && !isCustomer && (
              <button
                onClick={() => { setShowAuthModal(true); closeMenu() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span>👤</span> Sign In / Register
              </button>
            )}
          </div>
        )}
      </nav>

      {showAuthModal && (
        <CustomerAuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}