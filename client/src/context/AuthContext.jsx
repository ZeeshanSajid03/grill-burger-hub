import API_URL from '../config'
import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem('gbh_admin_token') || null
  )
  const [customer, setCustomer] = useState(
    () => {
      const saved = localStorage.getItem('gbh_customer')
      return saved ? JSON.parse(saved) : null
    }
  )

  // Admin login
  const adminLogin = async (username, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      username, password
    })
    localStorage.setItem('gbh_admin_token', res.data.token)
    setAdminToken(res.data.token)
  }

  const adminLogout = () => {
    localStorage.removeItem('gbh_admin_token')
    setAdminToken(null)
  }

  // Customer register
  const customerRegister = async (name, phone, password) => {
    const res = await axios.post(`${API_URL}/api/customers/register`, {
      name, phone, password
    })
    const data = { token: res.data.token, name: res.data.name, id: res.data.id }
    localStorage.setItem('gbh_customer', JSON.stringify(data))
    setCustomer(data)
  }

  // Customer login
  const customerLogin = async (phone, password) => {
    const res = await axios.post(`${API_URL}/api/customers/login`, {
      phone, password
    })
    const data = { token: res.data.token, name: res.data.name, id: res.data.id }
    localStorage.setItem('gbh_customer', JSON.stringify(data))
    setCustomer(data)
  }

  const customerLogout = () => {
    localStorage.removeItem('gbh_customer')
    setCustomer(null)
  }

  const isAdmin    = !!adminToken
  const isCustomer = !!customer

  const adminHeader    = adminToken  ? { Authorization: `Bearer ${adminToken}` }   : {}
  const customerHeader = customer    ? { Authorization: `Bearer ${customer.token}` } : {}

  return (
    <AuthContext.Provider value={{
      adminToken, adminLogin, adminLogout, isAdmin, adminHeader,
      customer, customerLogin, customerRegister, customerLogout,
      isCustomer, customerHeader,
      // legacy support for AdminPage
      isLoggedIn: isAdmin,
      login: adminLogin,
      logout: adminLogout,
      authHeader: adminHeader,
      token: adminToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)