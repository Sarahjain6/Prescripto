import { createContext, useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const AdminContext = createContext()

const AdminContextProvider = ({ children }) => {
  const backendUrl = "https://doctor-backend-cbt3.onrender.com";
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "")
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [dashData, setDashData] = useState(null)

  // Session expired / invalid token => clear it and force back to the login screen
  const logoutAdmin = () => {
    localStorage.removeItem("aToken")
    setAToken("")
  }

  const handleFailure = (message) => {
    const sessionExpired = /jwt expired|invalid token|invalid signature|not authorized|jwt malformed/i.test(message || "")
    if (sessionExpired) {
      logoutAdmin()
      toast.error("Session expired. Please log in again.")
    } else {
      toast.error(message)
    }
  }

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, { headers: { atoken: aToken } })
      if (data.success) setDoctors(data.doctors)
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/change-availability`, { docId }, { headers: { atoken: aToken } })
      if (data.success) { toast.success(data.message); getAllDoctors() }
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, { headers: { atoken: aToken } })
      if (data.success) setAppointments(data.appointments.reverse())
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/cancel-appointment`, { appointmentId }, { headers: { atoken: aToken } })
      if (data.success) { toast.success(data.message); getAllAppointments() }
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { atoken: aToken } })
      if (data.success) setDashData(data.dashData)
      else handleFailure(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const value = { aToken, setAToken, backendUrl, doctors, getAllDoctors, changeAvailability, appointments, getAllAppointments, cancelAppointment, dashData, getDashData }
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export default AdminContextProvider
export const useAdminContext = () => useContext(AdminContext)
