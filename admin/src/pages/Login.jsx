import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdminContext } from '../context/AdminContext'
import { useDoctorContext } from '../context/DoctorContext'

const Login = () => {
  const { setAToken, backendUrl } = useAdminContext()
  const { setDToken } = useDoctorContext()
  const [mode, setMode] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (mode === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          toast.success('Welcome back, Admin!')
        } else setErrorMsg(data.message || 'Invalid credentials')
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password })
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          toast.success('Welcome back, Doctor!')
        } else setErrorMsg(data.message || 'Invalid credentials')
      }
    } catch (err) { setErrorMsg(err.message) }
    setLoading(false)
  }

  // Quick fill credentials
  const fillAdmin = () => {
    setMode('Admin')
    setEmail('admin@prescripto.com')
    setPassword('qwerty123')
  }

  const fillDoctor = (docEmail) => {
    setMode('Doctor')
    setEmail(docEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Prescripto</h1>
          <p className="text-slate-500 text-sm mt-1">Admin & Doctor Portal</p>
        </div>

        {/* Quick Login Cards */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Quick Login</p>
          <div className="grid grid-cols-2 gap-3">

            {/* Admin Quick Login */}
            <button
              onClick={fillAdmin}
              className="group relative bg-white border-2 border-slate-200 hover:border-sky-400 rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-bold text-slate-800 text-sm">Admin</p>
              <p className="text-xs text-slate-400 mt-0.5">Full access</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-sky-100 text-sky-600 font-bold px-2 py-0.5 rounded-full">Click to fill</span>
              </div>
            </button>

            {/* Doctor Quick Login */}
            <button
              onClick={() => fillDoctor('doctor@prescripto.com')}
              className="group relative bg-white border-2 border-slate-200 hover:border-sky-400 rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-bold text-slate-800 text-sm">Doctor</p>
              <p className="text-xs text-slate-400 mt-0.5">Your appointments</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs bg-sky-100 text-sky-600 font-bold px-2 py-0.5 rounded-full">Click to fill</span>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

          {/* Toggle Admin / Doctor */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            {['Admin', 'Doctor'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setEmail(''); setPassword(''); setErrorMsg('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}`}
              >
                {m === 'Admin'
                  ? <span className="flex items-center justify-center gap-1.5">🛡️ Admin</span>
                  : <span className="flex items-center justify-center gap-1.5">👨‍⚕️ Doctor</span>
                }
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl px-4 py-3">
                {errorMsg}
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)} required
                placeholder={mode === 'Admin' ? 'admin@prescripto.com' : 'doctor@example.com'}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all duration-300 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Signing in...</>
                : `Sign in as ${mode}`
              }
            </button>
          </form>

          {/* Credentials hint */}
          
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Patient portal? Visit{' '}
          <a href="https://prescripto-k3en.vercel.app/login" target="_blank" rel="noreferrer" className="text-sky-500 hover:underline font-semibold">
            prescripto-k3en.vercel.app
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login