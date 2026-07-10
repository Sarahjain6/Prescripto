import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Prescripto</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your trusted platform for booking doctor appointments. Quality healthcare, made accessible for everyone.
            </p>
            <div className="flex gap-3 mt-6">
              {['Twitter', 'LinkedIn', 'Facebook'].map(s => (
                <button key={s} className="w-9 h-9 bg-slate-800 hover:bg-sky-600 rounded-lg flex items-center justify-center transition-colors text-xs font-bold">
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {[['Home', '/'], ['About Us', '/about'], ['Contact', '/contact'], ['Find Doctors', '/doctors']].map(([label, path]) => (
                <li key={label}>
                  <button onClick={() => navigate(path)} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">{label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📞 +91 98765 43210</li>
              <li>✉️ support@prescripto.com</li>
              <li>📍 New Delhi, India</li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1 bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Available 24/7
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2024 Prescripto. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <button className="hover:text-sky-400 transition-colors">Privacy Policy</button>
            <button className="hover:text-sky-400 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
