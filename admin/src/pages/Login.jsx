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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'Admin') {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          toast.success('Admin logged in!')
        } else toast.error(data.message)
      } else {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, { email, password })
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          toast.success('Doctor logged in!')
        } else toast.error(data.message)
      }
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Prescripto</h1>
          <p className="text-slate-500 text-sm mt-1">Admin & Doctor Portal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {['Admin', 'Doctor'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {m} Login
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={mode === 'Admin' ? 'admin@prescripto.com' : 'doctor@prescripto.com'}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all duration-300 disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : `Sign in as ${mode}`}
            </button>
          </form>

          {mode === 'Admin' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              <strong>Demo:</strong> admin@prescripto.com / qwerty123
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
