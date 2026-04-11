import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import MenuPage from './pages/MenuPage'
import CheckoutPage from './pages/CheckoutPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import TrackOrderPage from './pages/TrackOrderPage'
import MyOrdersPage from './pages/MyOrdersPage'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/"                    element={<MenuPage />} />
        <Route path="/checkout"            element={<CheckoutPage />} />
        <Route path="/dashboard"           element={<DashboardPage />} />
        <Route path="/admin"               element={<AdminPage />} />
        <Route path="/track/:orderNumber"  element={<TrackOrderPage />} />
        <Route path="/my-orders"           element={<MyOrdersPage />} />
      </Routes>
    </div>
  )
}

export default App