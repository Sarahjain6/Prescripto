import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAppContext } from '../context/AppContext'

const Contact = () => {
  const { backendUrl } = useAppContext()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/contact/submit`, form)
      if (data.success) {
        toast.success("Message sent! We'll get back to you within 24 hours.")
        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSent(false), 6000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 to-cyan-50 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-600">Have questions? Our team is here to help you 24/7.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Contact Information</h2>
            {[
              { icon: '📍', title: 'Office Address', lines: ['54709 Willms Station', 'Suite 350, New Delhi, India'] },
              { icon: '📞', title: 'Phone', lines: ['+91 98765 43210', 'Mon–Sat, 9am–6pm'] },
              { icon: '✉️', title: 'Email', lines: ['support@prescripto.com', 'We reply within 24 hours'] },
            ].map((info) => (
              <div key={info.title} className="flex gap-4 mb-8">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">{info.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{info.title}</h3>
                  {info.lines.map((line, i) => <p key={i} className="text-slate-500 text-sm">{line}</p>)}
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Emergency Support</h3>
              <p className="text-sky-100 text-sm mb-3">For urgent medical appointments, call us directly.</p>
              <p className="text-2xl font-extrabold">1800-PRESCRIPTO</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Send a Message</h2>
            {sent && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-emerald-800">Message received!</p>
                  <p className="text-emerald-600 text-sm">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { name: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe' },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Appointment query...' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{field.label}</label>
                  <input
                    type={field.type} placeholder={field.placeholder} required
                    value={form[field.name]}
                    onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea rows={5} required placeholder="Write your message here..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
