import { Link } from 'react-router-dom'

export default function Footer() {
  const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer')

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍔</span>
              <div>
                <p className="font-bold text-white leading-none">Grill Burger Hub</p>
                <p className="text-xs text-zinc-500 leading-none mt-0.5">Best Burger in Town</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Fresh grilled burgers, crispy fries and ice cold drinks made with love in Rawalpindi.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Contact Us</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📍</span>
                <p className="text-zinc-400 text-sm">
                  Main Gulzar-e-Quaid Market,<br/>
                  Main Road, Gulzar-e-Quaid,<br/>
                  Rawalpindi, Punjab
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📞</span>
                <button
                  onClick={() => window.location.href = 'tel:+923120704180'}
                  className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
                >
                  +92 312 070 4180
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📱</span>
                <button
                  onClick={() => openLink('https://wa.me/923120704180')}
                  className="text-zinc-400 hover:text-green-400 text-sm transition-colors"
                >
                  WhatsApp Us
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base">✉️</span>
                <button
                  onClick={() => window.location.href = 'mailto:grillburgerhub@gmail.com'}
                  className="text-zinc-400 hover:text-orange-400 text-sm transition-colors"
                >
                  grillburgerhub@gmail.com
                </button>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Opening Hours</h3>
            <div className="space-y-2">
              {[
                { day: 'Monday – Thursday', hours: '12:00 PM – 1:00 AM' },
                { day: 'Friday',            hours: '2:00 PM – 2:00 AM'  },
                { day: 'Saturday',          hours: '12:00 PM – 2:00 AM' },
                { day: 'Sunday',            hours: '12:00 PM – 1:00 AM' },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between gap-4 text-sm">
                  <span className="text-zinc-500">{day}</span>
                  <span className="text-zinc-300 whitespace-nowrap">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Quick Links</h3>
            <div className="space-y-2.5">
              <Link to="/" className="block text-zinc-400 hover:text-orange-400 text-sm transition-colors">
                🍔 Our Menu
              </Link>
              <Link to="/checkout" className="block text-zinc-400 hover:text-orange-400 text-sm transition-colors">
                🛒 Place Order
              </Link>
              <Link to="/my-orders" className="block text-zinc-400 hover:text-orange-400 text-sm transition-colors">
                📋 My Orders
              </Link>
              <button
                onClick={() => openLink('https://maps.app.goo.gl/aLGVCoRVG6voMp6r7')}
                className="block text-zinc-400 hover:text-orange-400 text-sm transition-colors"
              >
                🗺️ Find Us on Maps
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Grill Burger Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-600 text-xs">Made with ❤️ in Rawalpindi</span>
            <div className="flex gap-3">
              <button
                onClick={() => openLink('https://instagram.com')}
                className="text-zinc-600 hover:text-pink-400 text-sm transition-colors"
              >
                Instagram
              </button>
              <button
                onClick={() => openLink('https://facebook.com')}
                className="text-zinc-600 hover:text-blue-400 text-sm transition-colors"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}