import { createContext, useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export const DoctorContext = createContext()

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "")
  const [appointments, setAppointments] = useState([])
  const [dashData, setDashData] = useState(null)
  const [profileData, setProfileData] = useState(null)

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, { headers: { dtoken: dToken } })
      if (data.success) setAppointments(data.appointments.reverse())
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`, { appointmentId }, { headers: { dtoken: dToken } })
      if (data.success) { toast.success(data.message); getAppointments() }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/doctor/cancel-appointment`, { appointmentId }, { headers: { dtoken: dToken } })
      if (data.success) { toast.success(data.message); getAppointments() }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, { headers: { dtoken: dToken } })
      if (data.success) setDashData(data.dashData)
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, { headers: { dtoken: dToken } })
      if (data.success) setProfileData(data.profileData)
    } catch (e) { toast.error(e.message) }
  }

  const value = { dToken, setDToken, backendUrl, appointments, getAppointments, completeAppointment, cancelAppointment, dashData, getDashData, profileData, setProfileData, getProfileData }
  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
}

export default DoctorContextProvider
export const useDoctorContext = () => useContext(DoctorContext)
