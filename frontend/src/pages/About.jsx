import React from 'react'
import { useNavigate } from 'react-router-dom'

const About = () => {
  const navigate = useNavigate()
  const values = [
    { icon: '🛡️', title: 'Verified Doctors', desc: 'All our doctors are thoroughly verified with valid medical licenses and credentials.' },
    { icon: '⚡', title: 'Instant Booking', desc: 'Book appointments in under 60 seconds with real-time slot availability.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Your health data is encrypted and kept completely private and confidential.' },
    { icon: '💬', title: '24/7 Support', desc: 'Our support team is always available to help with any questions or concerns.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 to-cyan-50 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
            Healthcare, <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">Simplified</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Prescripto connects patients with trusted medical professionals across India — making quality healthcare accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We believe that finding and booking quality healthcare should be as simple as ordering food online. Prescripto was founded with a clear goal: eliminate the friction between patients and doctors.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              From instant booking to online payments and follow-ups, we handle the logistics so you can focus on what matters most — your health.
            </p>
            <button onClick={() => navigate('/doctors')} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              Find a Doctor
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['500+', 'Expert Doctors'], ['50K+', 'Patients Served'], ['4.9/5', 'Average Rating'], ['20+', 'Specialities']].map(([val, label]) => (
              <div key={label} className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
                <p className="text-3xl font-extrabold text-sky-600 mb-1">{val}</p>
                <p className="text-slate-600 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Why Choose Prescripto</h2>
            <p className="text-slate-500">Built around your trust and well-being</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
