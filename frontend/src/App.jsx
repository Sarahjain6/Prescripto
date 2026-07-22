import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import ChatBot from './components/ChatBot'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default App
