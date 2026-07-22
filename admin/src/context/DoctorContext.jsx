import { createContext, useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const DoctorContext = createContext()

// Decodes a JWT payload (no signature check needed client-side) to see if
// it's already past its "exp" claim, so an old/expired token can be purged
// immediately instead of triggering a failed request first.
const isTokenExpired = (t) => {
  if (!t) return true
  try {
    const payload = JSON.parse(atob(t.split(".")[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const getValidStoredToken = (key) => {
  const stored = localStorage.getItem(key)
  if (stored && isTokenExpired(stored)) {
    localStorage.removeItem(key)
    return ""
  }
  return stored || ""
}

const DoctorContextProvider = ({ children }) => {
  const backendUrl = "https://doctor-backend-cbt3.onrender.com";
  const [dToken, setDToken] = useState(() => getValidStoredToken("dToken"))
  const [appointments, setAppointments] = useState([])
  const [dashData, setDashData] = useState(null)
  const [profileData, setProfileData] = useState(null)

  // Session expired / invalid token => clear it and force back to the login screen
  const logoutDoctor = () => {
    localStorage.removeItem("dToken")
    setDToken("")
  }

  const handleFailure = (message) => {
    const sessionExpired = /jwt expired|invalid token|invalid signature|not authorized|jwt malformed/i.test(message || "")
    if (sessionExpired) {
      logoutDoctor()
      toast.error("Session expired. Please log in again.")
    } else {
      toast.error(message)
    }
  }

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, { headers: { dtoken: dToken } })
      if (data.success) setAppointments(data.appointments.reverse())
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`, { appointmentId }, { headers: { dtoken: dToken } })
      if (data.success) { toast.success(data.message); getAppointments() }
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/cancel-appointment`, { appointmentId }, { headers: { dtoken: dToken } })
      if (data.success) { toast.success(data.message); getAppointments() }
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, { headers: { dtoken: dToken } })
      if (data.success) setDashData(data.dashData)
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, { headers: { dtoken: dToken } })
      if (data.success) setProfileData(data.profileData)
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const value = { dToken, setDToken, backendUrl, appointments, getAppointments, completeAppointment, cancelAppointment, dashData, getDashData, profileData, setProfileData, getProfileData }
  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
}

export default DoctorContextProvider
export const useDoctorContext = () => useContext(DoctorContext)
