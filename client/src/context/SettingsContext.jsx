import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config'

const SettingsContext = createContext()

const DEFAULT_SETTINGS = {
  isOpen:          true,
  openTime:        '09:00',
  closeTime:       '23:00',
  isBusy:          false,
  busyMessage:     'Currently 30-45 min wait time',
  minDeliveryOrder: 0
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(res => setSettings({ ...DEFAULT_SETTINGS, ...res.data }))
      .catch(console.error)
  }, [])

  const updateSetting = async (key, value) => {
    try {
      await axios.post(`${API_URL}/api/settings`, { key, value })
      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)