import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import TrackOrderPage from './pages/TrackOrderPage'
import MyOrdersPage from './pages/MyOrdersPage'

function App() {
  const location = useLocation()
  const hideFooter = ['/dashboard', '/admin'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/"                   element={<MenuPage />} />
          <Route path="/checkout"           element={<CheckoutPage />} />
          <Route path="/dashboard"          element={<DashboardPage />} />
          <Route path="/admin"              element={<AdminPage />} />
          <Route path="/track/:orderNumber" element={<TrackOrderPage />} />
          <Route path="/my-orders"          element={<MyOrdersPage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

export default App