import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAdminContext } from './context/AdminContext'
import { useDoctorContext } from './context/DoctorContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import AllAppointments from './pages/admin/AllAppointments'
import AddDoctor from './pages/admin/AddDoctor'
import DoctorsList from './pages/admin/DoctorsList'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorProfile from './pages/doctor/DoctorProfile'
import ContactMessages from './pages/admin/ContactMessages'

const App = () => {
  const { aToken, setAToken } = useAdminContext()
  const { dToken, setDToken } = useDoctorContext()

  // Arriving via a "?forceLogin=true" link (e.g. the patient site's
  // "Go to Admin Portal" link) always clears any stored session so the
  // login screen asks for credentials, even if a token was left in this browser.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('forceLogin') === 'true') {
      localStorage.removeItem('aToken')
      localStorage.removeItem('dToken')
      setAToken('')
      setDToken('')
      params.delete('forceLogin')
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  if (!aToken && !dToken) return <Login />

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            {aToken && <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />
              <Route path="/contact-messages" element={<ContactMessages />} />
            </>}
            {dToken && <>
              <Route path="/" element={<DoctorDashboard />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
            </>}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
