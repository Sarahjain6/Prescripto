import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { token, setToken, userData } = useAppContext()
  const [showMenu, setShowMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl text-slate-800 font-bold tracking-tight">Prescripto</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/doctors', 'Doctors'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
              <NavLink key={path} to={path} className={({ isActive }) =>
                `text-sm font-semibold transition-colors pb-1 border-b-2 ${isActive ? 'text-sky-600 border-sky-500' : 'text-slate-600 border-transparent hover:text-sky-600'}`
              }>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {token && userData ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {userData.image ? <img src={userData.image} alt="" className="w-full h-full object-cover" /> : userData.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{userData.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    {[['My Profile', '/my-profile'], ['My Appointments', '/my-appointments']].map(([label, path]) => (
                      <button key={path} onClick={() => { navigate(path); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors font-medium">
                        {label}
                      </button>
                    ))}
                    <hr className="my-1 border-slate-100" />
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5">
                Create Account
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setShowMenu(!showMenu)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMenu ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {[['/', 'Home'], ['/doctors', 'Doctors'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
              <NavLink key={path} to={path} onClick={() => setShowMenu(false)}
                className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                {label}
              </NavLink>
            ))}
            {token ? (
              <>
                <button onClick={() => { navigate('/my-profile'); setShowMenu(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">My Profile</button>
                <button onClick={() => { navigate('/my-appointments'); setShowMenu(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">My Appointments</button>
                <button onClick={logout} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <button onClick={() => { navigate('/login'); setShowMenu(false); }}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-semibold">
                Create Account
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar