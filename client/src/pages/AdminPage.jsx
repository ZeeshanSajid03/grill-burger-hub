import API_URL from '../config'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts'

const categories = ['Burger', 'Fries', 'Drink', 'Deal']
const emptyForm  = { name: '', description: '', price: '', category: 'Burger', available: true, addons: [] }

function AddOnInput({ onAdd }) {
  const [name, setName]   = useState('')
  const [price, setPrice] = useState('')

  const handleAdd = () => {
    if (!name.trim() || !price) return
    onAdd({ name: name.trim(), price: Number(price) })
    setName('')
    setPrice('')
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="e.g. Fries (Regular)"
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
      />
      <input
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Price"
        className="w-28 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
      >
        + Add
      </button>
    </div>
  )
}

export default function AdminPage() {
  const { isLoggedIn, authHeader, logout } = useAuth()
  const navigate = useNavigate()

  // Menu state
  const [menuItems, setMenuItems]       = useState([])
  const [orders, setOrders]             = useState([])
  const [form, setForm]                 = useState(emptyForm)
  const [editingId, setEditingId]       = useState(null)
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving]             = useState(false)
  const [activeTab, setActiveTab]       = useState('menu')
  const [graphRange, setGraphRange]     = useState('weekly')

  // Delivery zone state
  const [zones, setZones]                 = useState([])
  const [zoneForm, setZoneForm]           = useState({ city: '', area: '', deliveryFee: '', _free: false })
  const [editingZoneId, setEditingZoneId] = useState(null)
  const [savingZone, setSavingZone]       = useState(false)

  // Rider state
  const [riders, setRiders]           = useState([])
  const [riderForm, setRiderForm]     = useState({ name: '', phone: '' })
  const [savingRider, setSavingRider] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) navigate('/dashboard')
  }, [isLoggedIn])

  useEffect(() => {
    fetchMenu()
    fetchOrders()
    fetchZones()
    fetchRiders()
  }, [])

  const fetchMenu = async () => {
    const res = await axios.get(`${API_URL}/api/menu`)
    setMenuItems(res.data)
  }

  const fetchOrders = async () => {
    const res = await axios.get(`${API_URL}/api/orders`)
    setOrders(res.data)
  }

  const fetchZones = async () => {
    const res = await axios.get(`${API_URL}/api/delivery-zones`)
    setZones(res.data)
  }

  const fetchRiders = async () => {
    const res = await axios.get(`${API_URL}/api/riders`)
    setRiders(res.data)
  }

  // Menu handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert('Name and price are required')
    setSaving(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'addons') data.append('addons', JSON.stringify(v))
        else data.append(k, v)
      })
      if (imageFile) data.append('image', imageFile)
      if (editingId) {
        await axios.put(
          `${API_URL}/api/menu/${editingId}`,
          data,
          { headers: { ...authHeader, 'Content-Type': 'multipart/form-data' } }
        )
      } else {
        await axios.post(
          `${API_URL}/api/menu`,
          data,
          { headers: { ...authHeader, 'Content-Type': 'multipart/form-data' } }
        )
      }
      setForm(emptyForm)
      setEditingId(null)
      setImageFile(null)
      setImagePreview('')
      fetchMenu()
    } catch (err) {
      alert('Error saving item')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setForm({
      name:        item.name,
      description: item.description || '',
      price:       item.price,
      category:    item.category,
      available:   item.available,
      addons:      item.addons || []
    })
    setEditingId(item._id)
    setImagePreview(item.image || '')
    setImageFile(null)
    setActiveTab('menu')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return
    await axios.delete(`${API_URL}/api/menu/${id}`, { headers: authHeader })
    fetchMenu()
  }

  const handleToggleAvailability = async (id) => {
    await axios.patch(`${API_URL}/api/menu/${id}/availability`, {}, { headers: authHeader })
    fetchMenu()
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
  }

  // Zone handlers
  const handleZoneSubmit = async () => {
    if (!zoneForm.city || !zoneForm.area) return alert('City and area required')
    if (zoneForm.deliveryFee === '' && !zoneForm._free) return alert('Enter a delivery fee or set as free')
    setSavingZone(true)
    try {
      const payload = {
        city:        zoneForm.city,
        area:        zoneForm.area,
        deliveryFee: zoneForm._free ? 0 : Number(zoneForm.deliveryFee)
      }
      if (editingZoneId) {
        await axios.put(
          `${API_URL}/api/delivery-zones/${editingZoneId}`,
          payload,
          { headers: authHeader }
        )
      } else {
        await axios.post(
          `${API_URL}/api/delivery-zones`,
          payload,
          { headers: authHeader }
        )
      }
      setZoneForm({ city: '', area: '', deliveryFee: '', _free: false })
      setEditingZoneId(null)
      fetchZones()
    } catch (err) {
      alert('Error saving zone')
    } finally {
      setSavingZone(false)
    }
  }

  const handleDeleteZone = async (id) => {
    if (!confirm('Delete this delivery zone?')) return
    await axios.delete(`${API_URL}/api/delivery-zones/${id}`, { headers: authHeader })
    fetchZones()
  }

  const handleToggleZone = async (id) => {
    await axios.patch(
      `${API_URL}/api/delivery-zones/${id}/availability`,
      {},
      { headers: authHeader }
    )
    fetchZones()
  }

  const handleEditZone = (zone) => {
    setZoneForm({
      city:        zone.city,
      area:        zone.area,
      deliveryFee: zone.deliveryFee === 0 ? '' : zone.deliveryFee,
      _free:       zone.deliveryFee === 0
    })
    setEditingZoneId(zone._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Rider handlers
  const handleRiderSubmit = async () => {
    if (!riderForm.name || !riderForm.phone) return alert('Name and phone required')
    setSavingRider(true)
    try {
      await axios.post(`${API_URL}/api/riders`, riderForm, { headers: authHeader })
      setRiderForm({ name: '', phone: '' })
      fetchRiders()
    } catch (err) {
      alert('Error saving rider')
    } finally {
      setSavingRider(false)
    }
  }

  const handleDeleteRider = async (id) => {
    if (!confirm('Delete this rider?')) return
    await axios.delete(`${API_URL}/api/riders/${id}`, { headers: authHeader })
    fetchRiders()
  }

  const handleToggleRider = async (id) => {
    await axios.patch(
      `${API_URL}/api/riders/${id}/availability`,
      {},
      { headers: authHeader }
    )
    fetchRiders()
  }

  // Analytics
  const getSalesData = () => {
    const now  = new Date()
    const days = graphRange === 'weekly' ? 7 : 30
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - i))
      const label = graphRange === 'weekly'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.getDate()
      const dayOrders = orders.filter(o =>
        new Date(o.createdAt).toDateString() === d.toDateString()
      )
      return {
        name:    label,
        orders:  dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + o.total, 0)
      }
    })
  }

  const getCategoryData = () =>
    categories.map(cat => ({
      name:  cat,
      count: orders.reduce((sum, o) =>
        sum + o.items.filter(i => {
          const mi = menuItems.find(m => m._id === (i.menuItem?._id || i.menuItem))
          return mi?.category === cat
        }).length, 0)
    }))

  const salesData    = getSalesData()
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalOrders  = orders.length
  const avgOrder     = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name === 'revenue' ? `Rs. ${p.value}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Panel</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage menu and view analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate('/dashboard') }}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {['menu', 'analytics', 'delivery', 'riders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
          >
            {tab === 'menu'      ? '🍔 Menu'           :
             tab === 'analytics' ? '📊 Analytics'       :
             tab === 'delivery'  ? '🛵 Delivery Zones'  :
                                   '🧑‍💼 Riders'}
          </button>
        ))}
      </div>

      {/* ── MENU TAB ── */}
      {activeTab === 'menu' && (
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6">
              {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Classic Zinger"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Price (Rs.) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 550"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:border-orange-500 transition-colors file:mr-3 file:bg-zinc-700 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-zinc-400 text-sm block mb-2">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the item"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Add-ons */}
              <div className="md:col-span-2">
                <label className="text-zinc-400 text-sm block mb-2">
                  Add-ons
                  <span className="text-zinc-600 ml-2 font-normal">(optional)</span>
                </label>
                <div className="space-y-2 mb-3">
                  {form.addons.map((addon, i) => (
                    <div key={i} className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-2">
                      <span className="flex-1 text-white text-sm">{addon.name}</span>
                      <span className="text-orange-400 text-sm font-medium">Rs. {addon.price}</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, addons: form.addons.filter((_, idx) => idx !== i) })}
                        className="text-zinc-500 hover:text-red-400 text-lg leading-none ml-2 transition-colors"
                      >×</button>
                    </div>
                  ))}
                </div>
                <AddOnInput onAdd={addon => setForm({ ...form, addons: [...form.addons, addon] })} />
              </div>

              {imagePreview && (
                <div className="md:col-span-2">
                  <p className="text-zinc-400 text-sm mb-2">Image preview</p>
                  <img src={imagePreview} alt="preview" className="h-40 w-full object-cover rounded-xl"/>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button
                  onClick={handleCancel}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Menu Items List */}
          <div>
            <h2 className="font-bold text-white text-lg mb-4">
              Current Menu ({menuItems.length} items)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div
                  key={item._id}
                  className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all
                    ${item.available ? 'border-zinc-800' : 'border-zinc-700 opacity-60'}`}
                >
                  <div className="h-36 bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                      : <span className="text-4xl">
                          {item.category === 'Burger' ? '🍔' :
                           item.category === 'Fries'  ? '🍟' :
                           item.category === 'Drink'  ? '🥤' : '🎁'}
                        </span>
                    }
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
                      <span className="text-orange-400 text-sm font-bold ml-2">Rs. {item.price}</span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-1">{item.category}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${item.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg transition-colors"
                      >✏️ Edit</button>
                      <button
                        onClick={() => handleToggleAvailability(item._id)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg transition-colors"
                      >{item.available ? '🔴 Hide' : '🟢 Show'}</button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-2 rounded-lg transition-colors"
                      >🗑️ Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total orders',    value: totalOrders,           icon: '📋' },
              { label: 'Total revenue',   value: `Rs. ${totalRevenue}`, icon: '💰' },
              { label: 'Avg order value', value: `Rs. ${avgOrder}`,     icon: '📈' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-2xl mb-2">{icon}</p>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-zinc-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {['weekly', 'monthly'].map(r => (
              <button
                key={r}
                onClick={() => setGraphRange(r)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors
                  ${graphRange === r ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                {r === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesData} barSize={graphRange === 'weekly' ? 32 : 12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }}/>
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Order volume</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Sales by category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getCategoryData()} barSize={40} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false}/>
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} width={50}/>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }}/>
                <Bar dataKey="count" fill="#f97316" radius={[0, 6, 6, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── DELIVERY ZONES TAB ── */}
      {activeTab === 'delivery' && (
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6">
              {editingZoneId ? '✏️ Edit Zone' : '➕ Add Delivery Zone'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">City *</label>
                <input
                  type="text"
                  value={zoneForm.city}
                  onChange={e => setZoneForm({ ...zoneForm, city: e.target.value })}
                  placeholder="e.g. Rawalpindi"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Area *</label>
                <input
                  type="text"
                  value={zoneForm.area}
                  onChange={e => setZoneForm({ ...zoneForm, area: e.target.value })}
                  placeholder="e.g. Saddar"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Delivery Fee (Rs.) *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={zoneForm._free ? '' : zoneForm.deliveryFee}
                    onChange={e => setZoneForm({ ...zoneForm, deliveryFee: e.target.value, _free: false })}
                    placeholder="e.g. 150"
                    disabled={zoneForm._free}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-40"
                  />
                  <button
                    type="button"
                    onClick={() => setZoneForm({ ...zoneForm, _free: !zoneForm._free, deliveryFee: !zoneForm._free ? 0 : '' })}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                      ${zoneForm._free
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                  >
                    {zoneForm._free ? '✓ Free' : 'Set Free'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleZoneSubmit}
                disabled={savingZone}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                {savingZone ? 'Saving...' : editingZoneId ? 'Update Zone' : 'Add Zone'}
              </button>
              {editingZoneId && (
                <button
                  onClick={() => { setZoneForm({ city: '', area: '', deliveryFee: '', _free: false }); setEditingZoneId(null) }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-white text-lg mb-4">
              Delivery Zones ({zones.length})
            </h2>
            {zones.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-3xl mb-3">🛵</p>
                <p>No delivery zones added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {zones.map(zone => (
                  <div
                    key={zone._id}
                    className={`bg-zinc-900 border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-all
                      ${zone.available ? 'border-zinc-800' : 'border-zinc-700 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-white font-medium">
                          {zone.city}
                          <span className="text-zinc-500 mx-2">→</span>
                          {zone.area}
                        </p>
                        {zone.deliveryFee === 0 ? (
                          <span className="inline-flex items-center gap-1 mt-0.5">
                            <span className="text-green-400 text-xs animate-pulse">✦</span>
                            <span className="text-green-400 text-sm font-bold">Free Delivery</span>
                          </span>
                        ) : (
                          <p className="text-orange-400 text-sm font-bold mt-0.5">Rs. {zone.deliveryFee}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${zone.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {zone.available ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEditZone(zone)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg transition-colors"
                      >✏️ Edit</button>
                      <button
                        onClick={() => handleToggleZone(zone._id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg transition-colors"
                      >{zone.available ? '🔴 Disable' : '🟢 Enable'}</button>
                      <button
                        onClick={() => handleDeleteZone(zone._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg transition-colors"
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RIDERS TAB ── */}
      {activeTab === 'riders' && (
        <div className="space-y-8">

          {/* Add Rider Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-6">➕ Add Rider</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Name *</label>
                <input
                  type="text"
                  value={riderForm.name}
                  onChange={e => setRiderForm({ ...riderForm, name: e.target.value })}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm block mb-2">Phone *</label>
                <input
                  type="text"
                  value={riderForm.phone}
                  onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleRiderSubmit}
              disabled={savingRider}
              className="mt-5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {savingRider ? 'Saving...' : 'Add Rider'}
            </button>
          </div>

          {/* Riders List */}
          <div>
            <h2 className="font-bold text-white text-lg mb-4">
              Riders ({riders.length})
            </h2>
            {riders.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-3xl mb-3">🛵</p>
                <p>No riders added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riders.map(rider => (
                  <div
                    key={rider._id}
                    className={`bg-zinc-900 border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-all
                      ${rider.available ? 'border-zinc-800' : 'border-zinc-700 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="text-lg">🛵</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{rider.name}</p>
                        <p className="text-zinc-400 text-sm">{rider.phone}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${rider.available
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                        }`}>
                        {rider.available ? 'Available' : 'Off Duty'}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleRider(rider._id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        {rider.available ? '🔴 Off Duty' : '🟢 On Duty'}
                      </button>
                      <button
                        onClick={() => handleDeleteRider(rider._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}