import React from 'react'
import { useAdminContext } from '../context/AdminContext'
import { useDoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const { aToken, setAToken } = useAdminContext()
  const { dToken, setDToken } = useDoctorContext()

  const logout = () => {
    if (aToken) { setAToken(''); localStorage.removeItem('aToken') }
    if (dToken) { setDToken(''); localStorage.removeItem('dToken') }
  }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="font-bold text-slate-800">Prescripto</span>
        <span className="hidden sm:inline-flex bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {aToken ? 'Admin' : 'Doctor'} Panel
        </span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </nav>
  )
}

export default Navbar
