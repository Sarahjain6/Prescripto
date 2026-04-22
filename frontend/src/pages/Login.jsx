import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { token, setToken, backendUrl } = useAppContext()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => { if (token) navigate('/') }, [token])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const fillDemo = () => {
    setMode('login')
    setForm({ name: '', email: 'demo@prescripto.com', password: 'demo1234' })
    toast.info('Demo credentials filled! Click Sign In.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/user/login' : '/api/user/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const { data } = await axios.post(`${backendUrl}${url}`, payload)
      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Welcome back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your Prescripto account' : "Join Prescripto today — it's free"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([val, label]) => (
              <button key={val} onClick={() => setMode(val)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === val ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange} required
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 pr-11 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-200 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Please wait...</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          {/* Demo login button */}
          {mode === 'login' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-xs font-bold text-amber-700 mb-2">🧪 Try Demo Account</p>
              <p className="text-xs text-amber-600 mb-3">Register first with any email, then sign in. Or use our demo account:</p>
              <button onClick={fillDemo}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                ⚡ Fill Demo Credentials
              </button>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sky-600 font-semibold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Admin link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            Are you an admin or doctor?{' '}
            <a href="https://prescripto-nn59.vercel.app" target="_blank" rel="noreferrer"
              className="text-sky-500 hover:underline font-semibold">
              Go to Admin Portal →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login